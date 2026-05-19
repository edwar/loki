'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getConsumables() {
  return prisma.supply.findMany({
    where: { 
      deletedAt: null,
      category: {
        name: 'Consumibles'
      }
    },
    include: { category: true },
    orderBy: { name: 'asc' }
  })
}

export async function getAllSuppliesForConsumables() {
  const consumables = await prisma.supply.findMany({
    where: { 
      deletedAt: null,
      category: {
        name: 'Consumibles'
      }
    },
    orderBy: { name: 'asc' }
  })
  
  return consumables.map((s: any) => ({
    id: s.id,
    name: s.name,
    currentStock: Number(s.currentStock),
    unit: s.unit,
    purchasePrice: Number(s.purchasePrice)
  }))
}

export interface ConsumableUsage {
  id: string
  supplyId: string
  supplyName: string
  quantity: number
  reason: 'sale' | 'damage' | 'loss'
  saleId?: string
  createdAt: Date
}

export async function registerConsumableUsage(formData: FormData) {
  const supplyId = formData.get('supplyId') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1
  const reason = formData.get('reason') as string || 'sale'
  const notes = formData.get('notes') as string || ''

  const supply = await prisma.supply.findUnique({ where: { id: supplyId } })
  if (!supply) throw new Error('Consumible no encontrado')

  const currentStock = Number(supply.currentStock)
  if (currentStock < quantity) {
    throw new Error(`Stock insuficiente. Stock actual: ${currentStock}`)
  }

  await prisma.$transaction(async (tx) => {
    await tx.supply.update({
      where: { id: supplyId },
      data: { currentStock: { decrement: quantity } }
    })

    await tx.consumableUsage.create({
      data: {
        supplyId,
        quantity,
        reason: reason as 'sale' | 'damage' | 'loss',
        notes
      }
    })
  })

  revalidatePath('/ventas')
  revalidatePath('/consumibles')
}

export async function getConsumableUsageHistory() {
  return prisma.consumableUsage.findMany({
    where: { deletedAt: null },
    include: { supply: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}