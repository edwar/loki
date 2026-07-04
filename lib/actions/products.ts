'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { convertUnits } from '@/lib/conversions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getProducts() {
  const session = await getServerSession(authOptions)
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } })
    : null

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(user?.companyId ? { companyId: user.companyId } : {}),
    },
    include: {
      category: true,
      images: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
      recipeItems: {
        where: { deletedAt: null },
        include: { supply: true },
        orderBy: { createdAt: 'desc' },
      },
      productRecipeItems: {
        where: { deletedAt: null },
        include: { preparation: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const prepIds = products.flatMap((p) =>
    p.productRecipeItems.map((pri) => pri.preparationId)
  )

  if (prepIds.length > 0) {
    const prepsWithIngredients = await prisma.preparation.findMany({
      where: { id: { in: prepIds } },
      include: {
        ingredients: {
          include: { supply: true, subPreparation: true },
        },
      },
    })

    const costMap = new Map<string, number>()

    function resolveCost(prepId: string, visited: Set<string>): number {
      const cached = costMap.get(prepId)
      if (cached !== undefined) return cached
      if (visited.has(prepId)) return 0
      visited.add(prepId)

      const prep = prepsWithIngredients.find((p) => p.id === prepId)
      if (!prep) return 0

      const yieldAmount = Number(prep.yield) || 1
      const total = prep.ingredients.reduce((acc, ing) => {
        const qty = Number(ing.quantity) || 0
        if (ing.supply) return acc + qty * (Number(ing.supply.purchasePrice) || 0)
        if (ing.subPreparation) return acc + qty * resolveCost(ing.subPreparation.id, visited)
        return acc
      }, 0)
      const cost = yieldAmount > 0 ? total / yieldAmount : 0
      costMap.set(prepId, cost)
      return cost
    }

    for (const prep of prepsWithIngredients) {
      resolveCost(prep.id, new Set())
    }

    for (const product of products) {
      for (const pri of product.productRecipeItems) {
        const computed = costMap.get(pri.preparationId)
        if (computed !== undefined) {
          ;(pri.preparation as any).costPrice = computed
        }
      }
    }
  }

  return (products as any[]).map((p) => ({
    ...p,
    currentStock: Number(p.currentStock),
    yield: Number(p.yield),
    profitMargin: Number(p.profitMargin),
    salePrice: Number(p.salePrice),
    recipeItems: (p.recipeItems || []).map((ri: any) => ({
      ...ri,
      quantityRequired: Number(ri.quantityRequired),
      supply: ri.supply
        ? { ...ri.supply, currentStock: Number(ri.supply.currentStock), minStock: Number(ri.supply.minStock), purchasePrice: Number(ri.supply.purchasePrice) }
        : null,
    })),
    productRecipeItems: (p.productRecipeItems || []).map((pri: any) => ({
      ...pri,
      quantity: Number(pri.quantity),
      preparation: pri.preparation
        ? { ...pri.preparation, yield: Number(pri.preparation.yield), currentStock: Number(pri.preparation.currentStock), minStock: Number(pri.preparation.minStock), costPrice: Number(pri.preparation.costPrice) }
        : null,
    })),
    images: (p.images || []).map((i: any) => ({ ...i })),
  }))
}

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } })
    : null

  const name = formData.get('name') as string
  const categoryName = formData.get('category') as string | null
  const profitMargin = parseFloat(formData.get('profitMargin') as string) || 30
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1
  const isPublic = formData.get('isPublic') === 'true'
  const preparation = formData.get('preparation') as string

  let categoryId = null
  if (categoryName) {
    const category = await prisma.category.findFirst({
      where: { name: categoryName, type: 'product', deletedAt: null }
    })
    categoryId = category?.id || null
  }

  await prisma.product.create({
    data: {
      name,
      categoryId,
      profitMargin,
      salePrice,
      yield: yieldAmount,
      companyId: user?.companyId || null,
      isPublic,
      preparation: preparation || null,
    },
  })

  revalidatePath('/productos')
}

export async function addRecipeItem(formData: FormData) {
  const productId = formData.get('productId') as string
  const supplyId = formData.get('supplyId') as string
  const quantityRequired = parseFloat(formData.get('quantityRequired') as string) || 0
  const unit = formData.get('unit') as string

  await prisma.recipeItem.upsert({
    where: {
      productId_supplyId: {
        productId,
        supplyId,
      }
    },
    update: {
      quantityRequired,
      unit,
      deletedAt: null // In case it was previously deleted
    },
    create: {
      productId,
      supplyId,
      quantityRequired,
      unit,
    },
  })

  revalidatePath('/productos')
}

export async function deleteRecipeItem(id: string) {
  await prisma.recipeItem.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/productos')
}

export async function updateRecipeItem(id: string, quantityRequired: number, unit: string) {
  await prisma.recipeItem.update({
    where: { id },
    data: { quantityRequired, unit },
  })

  revalidatePath('/productos')
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const categoryName = formData.get('category') as string | null
  const profitMargin = parseFloat(formData.get('profitMargin') as string) || 30
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1
  const isPublic = formData.get('isPublic') === 'true'
  const preparation = formData.get('preparation') as string

  let categoryId = null
  if (categoryName) {
    const category = await prisma.category.findFirst({
      where: { name: categoryName, type: 'product', deletedAt: null }
    })
    categoryId = category?.id || null
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      profitMargin,
      salePrice,
      yield: yieldAmount,
      isPublic,
      preparation: preparation || null,
    },
  })

  revalidatePath('/productos')
}

import { logAction } from './audit'

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await logAction('DELETE', 'PRODUCT', id, { name: product?.name })

  revalidatePath('/productos')
}

export async function prepareProduct(productId: string, batches: number, actualYield: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      recipeItems: { where: { deletedAt: null } },
      productRecipeItems: { where: { deletedAt: null }, include: { preparation: true } },
    }
  })

  if (!product) throw new Error('Producto no encontrado')

  const supplyUpdates: { id: string; quantity: number; unitCost: number }[] = []
  const prepUpdates: { id: string; quantity: number; unitCost: number }[] = []

  for (const item of product.recipeItems) {
    const supply = await prisma.supply.findUnique({ where: { id: item.supplyId } })
    let totalRequired = Number(item.quantityRequired) * batches
    if (supply && item.unit && supply.unit !== item.unit) {
      const converted = convertUnits(totalRequired, item.unit, supply.unit)
      if (converted !== null) totalRequired = converted
    }
    if (!supply || Number(supply.currentStock) < totalRequired) {
      throw new Error(`Insumo insuficiente: ${supply?.name || 'Desconocido'}`)
    }
    supplyUpdates.push({
      id: item.supplyId,
      quantity: totalRequired,
      unitCost: Number(supply.purchasePrice),
    })
  }

  for (const item of product.productRecipeItems) {
    const prep = item.preparation
    const totalRequired = Number(item.quantity) * batches
    if (Number(prep.currentStock) < totalRequired) {
      throw new Error(`Preparación insuficiente: ${prep.name}`)
    }
    prepUpdates.push({
      id: prep.id,
      quantity: totalRequired,
      unitCost: Number(prep.costPrice),
    })
  }

  await prisma.$transaction(async (tx) => {
    for (const update of supplyUpdates) {
      await tx.supply.update({
        where: { id: update.id },
        data: { currentStock: { decrement: update.quantity } },
      })
    }

    for (const update of prepUpdates) {
      await tx.preparation.update({
        where: { id: update.id },
        data: { currentStock: { decrement: update.quantity } },
      })
    }

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: { increment: actualYield } },
    })

    await tx.product.update({
      where: { id: productId },
      data: { yield: actualYield },
    })

    await tx.productionLog.create({
      data: {
        productId,
        expectedYield: actualYield,
        actualYield,
        batches,
        items: {
          create: [
            ...supplyUpdates.map(update => ({
              supplyId: update.id,
              quantityConsumed: update.quantity,
              unitCost: update.unitCost,
            })),
            ...prepUpdates.map(update => ({
              preparationId: update.id,
              quantityConsumed: update.quantity,
              unitCost: update.unitCost,
            })),
          ],
        },
      },
    })
  })

  revalidatePath('/produccion')
  revalidatePath('/productos')
  revalidatePath('/insumos')
  revalidatePath('/preparaciones')
  revalidatePath('/ventas')
  revalidatePath('/')
}

export async function consumeProduct(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })
  if (!product) throw new Error('Producto no encontrado')
  if (quantity <= 0) throw new Error('La cantidad debe ser mayor a 0')
  if (Number(product.currentStock) < quantity) {
    throw new Error(`Stock insuficiente. Disponible: ${Number(product.currentStock)}`)
  }

  await prisma.product.update({
    where: { id: productId },
    data: { currentStock: { decrement: quantity } },
  })

  revalidatePath('/productos')
}