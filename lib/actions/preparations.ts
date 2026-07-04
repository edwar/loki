'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function calculateCostPrice(ingredients: any[], yieldAmount: number): number {
  const total = ingredients.reduce((acc: number, ing: any) => {
    const qty = Number(ing.quantity) || 0
    if (ing.supply) {
      return acc + qty * (Number(ing.supply.purchasePrice) || 0)
    }
    if (ing.subPreparation) {
      return acc + qty * (Number(ing.subPreparation.costPrice) || 0)
    }
    return acc
  }, 0)
  return yieldAmount > 0 ? total / yieldAmount : 0
}

async function getUserCompanyId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  })
  return user?.companyId || null
}

export async function getPreparations() {
  const companyId = await getUserCompanyId()
  const preps = await prisma.preparation.findMany({
    where: {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
    },
    include: {
      ingredients: {
        where: {
          supply: { deletedAt: null },
        },
        include: {
          supply: true,
          subPreparation: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return preps.map((p) => {
    const costPrice = calculateCostPrice(p.ingredients, Number(p.yield))
    return {
      ...p,
      yield: Number(p.yield),
      currentStock: Number(p.currentStock),
      minStock: Number(p.minStock),
      costPrice,
      ingredients: p.ingredients.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
      })),
    }
  })
}

export async function getPreparationsSimple() {
  const companyId = await getUserCompanyId()
  const allPreps = await prisma.preparation.findMany({
    where: {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
    },
    include: {
      ingredients: {
        include: { supply: true, subPreparation: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const costMap = new Map<string, number>()

  function resolveCost(prepId: string, visited: Set<string>): number {
    const cached = costMap.get(prepId)
    if (cached !== undefined) return cached
    if (visited.has(prepId)) return 0
    visited.add(prepId)

    const prep = allPreps.find((p) => p.id === prepId)
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

  for (const prep of allPreps) {
    resolveCost(prep.id, new Set())
  }

  return allPreps.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    costPrice: costMap.get(p.id) || 0,
    currentStock: Number(p.currentStock),
  }))
}

export async function createPreparation(formData: FormData) {
  const companyId = await getUserCompanyId()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const unit = formData.get('unit') as string
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1
  const notes = formData.get('notes') as string

  await prisma.preparation.create({
    data: {
      name,
      description: description || null,
      unit,
      yield: yieldAmount,
      companyId,
      notes: notes || null,
    },
  })

  revalidatePath('/preparaciones')
}

export async function updatePreparation(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const unit = formData.get('unit') as string
  const yieldAmount = parseFloat(formData.get('yield') as string) || 1
  const notes = formData.get('notes') as string

  await prisma.preparation.update({
    where: { id },
    data: {
      name,
      description: description || null,
      unit,
      yield: yieldAmount,
      notes: notes || null,
    },
  })

  revalidatePath('/preparaciones')
}

export async function deletePreparation(id: string) {
  await prisma.preparation.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/preparaciones')
}

export async function addIngredient(formData: FormData) {
  const preparationId = formData.get('preparationId') as string
  const type = formData.get('type') as string
  const supplyId = type === 'supply' ? (formData.get('supplyId') as string) : null
  const subPreparationId = type === 'preparation' ? (formData.get('subPreparationId') as string) : null
  const quantity = parseFloat(formData.get('quantity') as string) || 0
  const unit = formData.get('unit') as string

  if (type === 'preparation' && subPreparationId === preparationId) {
    throw new Error('Una preparación no puede ser ingrediente de sí misma')
  }

  await prisma.preparationIngredient.create({
    data: {
      preparationId,
      supplyId,
      subPreparationId,
      quantity,
      unit,
    },
  })

  revalidatePath('/preparaciones')
}

export async function removeIngredient(id: string) {
  await prisma.preparationIngredient.delete({ where: { id } })
  revalidatePath('/preparaciones')
}

export async function updateIngredient(id: string, quantity: number, unit: string) {
  await prisma.preparationIngredient.update({
    where: { id },
    data: { quantity, unit },
  })
  revalidatePath('/preparaciones')
}

export async function producePreparation(
  preparationId: string,
  batches: number,
  actualQuantity: number,
) {
  const preparation = await prisma.preparation.findUnique({
    where: { id: preparationId },
    include: {
      ingredients: {
        include: { supply: true, subPreparation: true },
      },
    },
  })

  if (!preparation) throw new Error('Preparación no encontrada')
  if (preparation.ingredients.length === 0) throw new Error('La preparación no tiene ingredientes')

  const supplyUpdates: { id: string; quantity: number; unitCost: number }[] = []
  const prepConsumption: { id: string; quantity: number }[] = []

  for (const ing of preparation.ingredients) {
    const totalRequired = Number(ing.quantity) * batches

    if (ing.supply) {
      if (Number(ing.supply.currentStock) < totalRequired) {
        throw new Error(`Insumo insuficiente: ${ing.supply.name}`)
      }
      supplyUpdates.push({
        id: ing.supply.id,
        quantity: totalRequired,
        unitCost: Number(ing.supply.purchasePrice),
      })
    }

    if (ing.subPreparation) {
      if (Number(ing.subPreparation.currentStock) < totalRequired) {
        throw new Error(`Preparación insuficiente: ${ing.subPreparation.name}`)
      }
      prepConsumption.push({
        id: ing.subPreparation.id,
        quantity: totalRequired,
      })
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const update of supplyUpdates) {
      await tx.supply.update({
        where: { id: update.id },
        data: { currentStock: { decrement: update.quantity } },
      })
    }

    for (const cons of prepConsumption) {
      await tx.preparation.update({
        where: { id: cons.id },
        data: { currentStock: { decrement: cons.quantity } },
      })
    }

    await tx.preparation.update({
      where: { id: preparationId },
      data: { currentStock: { increment: actualQuantity } },
    })

    await tx.prepProductionLog.create({
      data: {
        preparationId,
        quantity: actualQuantity,
        batches,
        items: {
          create: [
            ...supplyUpdates.map((u) => ({
              supplyId: u.id,
              quantityConsumed: u.quantity,
              unitCost: u.unitCost,
            })),
            ...prepConsumption.map((c) => ({
              subPreparationId: c.id,
              quantityConsumed: c.quantity,
              unitCost: 0,
            })),
          ],
        },
      },
    })
  })

  revalidatePath('/preparaciones')
  revalidatePath('/inventario')
  revalidatePath('/productos')
}

export async function deletePrepProductionLog(id: string) {
  const log = await prisma.prepProductionLog.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!log) throw new Error('Log no encontrado')

  await prisma.$transaction(async (tx) => {
    for (const item of log.items) {
      if (item.supplyId) {
        await tx.supply.update({
          where: { id: item.supplyId },
          data: { currentStock: { increment: item.quantityConsumed } },
        })
      }
      if (item.subPreparationId) {
        await tx.preparation.update({
          where: { id: item.subPreparationId },
          data: { currentStock: { increment: item.quantityConsumed } },
        })
      }
    }

    await tx.preparation.update({
      where: { id: log.preparationId },
      data: { currentStock: { decrement: log.quantity } },
    })

    await tx.prepProductionLog.delete({ where: { id } })
  })

  revalidatePath('/preparaciones')
  revalidatePath('/inventario')
}

export async function addProductRecipeItem(formData: FormData) {
  const productId = formData.get('productId') as string
  const preparationId = formData.get('preparationId') as string
  const quantity = parseFloat(formData.get('quantity') as string) || 0
  const unit = formData.get('unit') as string

  await prisma.productRecipeItem.upsert({
    where: {
      productId_preparationId: { productId, preparationId },
    },
    update: { quantity, unit },
    create: { productId, preparationId, quantity, unit },
  })

  revalidatePath('/productos')
}

export async function removeProductRecipeItem(id: string) {
  await prisma.productRecipeItem.delete({ where: { id } })
  revalidatePath('/productos')
}

export async function updateProductRecipeItem(id: string, quantity: number, unit: string) {
  await prisma.productRecipeItem.update({
    where: { id },
    data: { quantity, unit },
  })
  revalidatePath('/productos')
}

export async function getPrepProductionLogs() {
  const logs = await prisma.prepProductionLog.findMany({
    orderBy: { producedAt: 'desc' },
    include: {
      preparation: true,
      items: {
        include: { supply: true, subPreparation: true },
      },
    },
  })

  return logs.map((log) => ({
    ...log,
    quantity: Number(log.quantity),
    batches: Number(log.batches),
    items: log.items.map((item) => ({
      ...item,
      quantityConsumed: Number(item.quantityConsumed),
      unitCost: Number(item.unitCost),
    })),
  }))
}
