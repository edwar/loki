'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { convertUnits } from '@/lib/conversions'

export async function getProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      recipeItems: {
        where: { deletedAt: null },
        include: { supply: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const categoryName = formData.get('category') as string | null
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1

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
      salePrice,
      yield: yieldAmount,
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

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const categoryName = formData.get('category') as string | null
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1

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
      salePrice,
      yield: yieldAmount,
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
    include: { recipeItems: { where: { deletedAt: null } } }
  })

  if (!product) throw new Error('Producto no encontrado')

  const yieldAmount = Number(product.yield) || 1
  const expectedYield = yieldAmount * batches

  // 1. Verificar disponibilidad y preparar deducciones
  const supplyUpdates: { id: string; quantity: number; unitCost: number }[] = []
  for (const item of product.recipeItems) {
    const supply = await prisma.supply.findUnique({ where: { id: item.supplyId } })
    
    let totalRequired = Number(item.quantityRequired) * batches
    
    // Convertir si las unidades son diferentes
    if (supply && item.unit && supply.unit !== item.unit) {
      const converted = convertUnits(totalRequired, item.unit, supply.unit)
      if (converted !== null) {
        totalRequired = converted
      }
    }
    
    if (!supply || Number(supply.currentStock) < totalRequired) {
      throw new Error(`Insumo insuficiente: ${supply?.name || 'Desconocido'}`)
    }

    supplyUpdates.push({
      id: item.supplyId,
      quantity: totalRequired,
      unitCost: Number(supply.purchasePrice) // We store the current cost for historical accuracy
    })
  }

  // 2. Ejecutar transacciones
  await prisma.$transaction(async (tx) => {
    // Deducir insumos
    for (const update of supplyUpdates) {
      await tx.supply.update({
        where: { id: update.id },
        data: { currentStock: { decrement: update.quantity } }
      })
    }

    // Aumentar stock de producto con el rendimiento real obtenido
    await tx.product.update({
      where: { id: productId },
      data: { currentStock: { increment: actualYield } }
    })

    // Registrar el log de producción
    await tx.productionLog.create({
      data: {
        productId,
        expectedYield,
        actualYield,
        batches,
        items: {
          create: supplyUpdates.map(update => ({
            supplyId: update.id,
            quantityConsumed: update.quantity,
            unitCost: update.unitCost
          }))
        }
      }
    })
  })

  revalidatePath('/produccion')
  revalidatePath('/productos')
  revalidatePath('/insumos')
  revalidatePath('/ventas')
  revalidatePath('/')
}