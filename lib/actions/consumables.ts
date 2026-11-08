'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPreparationsSimple } from '@/lib/actions/preparations'

export async function getConsumables() {
  return prisma.supply.findMany({
    where: { deletedAt: null, isConsumable: true },
    include: { category: true },
    orderBy: { name: 'asc' }
  })
}

export interface ConsumableItem {
  /** `supply:<id>` o `preparation:<id>` */
  key: string
  kind: 'supply' | 'preparation'
  id: string
  name: string
  currentStock: number
  unit: string
  /** costo por unidad (precio de compra o costo de la preparación) */
  unitCost: number
}

export async function getAllSuppliesForConsumables(): Promise<ConsumableItem[]> {
  const [supplies, preparations] = await Promise.all([
    prisma.supply.findMany({
      where: { deletedAt: null, isConsumable: true },
      orderBy: { name: 'asc' }
    }),
    getPreparationsSimple()
  ])

  return [
    ...supplies.map((s) => ({
      key: `supply:${s.id}`,
      kind: 'supply' as const,
      id: s.id,
      name: s.name,
      currentStock: Number(s.currentStock),
      unit: s.unit,
      unitCost: Number(s.purchasePrice)
    })),
    ...preparations
      .filter((p) => p.isConsumable)
      .map((p) => ({
        key: `preparation:${p.id}`,
        kind: 'preparation' as const,
        id: p.id,
        name: p.name,
        currentStock: p.currentStock,
        unit: p.unit,
        unitCost: p.costPrice
      }))
  ]
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
  const kind = formData.get('kind') === 'preparation' ? 'preparation' : 'supply'
  const itemId = formData.get('itemId') as string
  const quantity = parseFloat(formData.get('quantity') as string)
  const reason = (formData.get('reason') as string) || 'sale'
  const notes = (formData.get('notes') as string) || ''

  if (!itemId) throw new Error('Selecciona un consumible')
  if (!(quantity > 0)) throw new Error('La cantidad debe ser mayor a 0')

  if (kind === 'supply') {
    const supply = await prisma.supply.findUnique({ where: { id: itemId } })
    if (!supply) throw new Error('Consumible no encontrado')
    const currentStock = Number(supply.currentStock)
    if (currentStock < quantity) {
      throw new Error(`Stock insuficiente. Stock actual: ${currentStock}`)
    }

    await prisma.$transaction(async (tx) => {
      await tx.supply.update({
        where: { id: itemId },
        data: { currentStock: { decrement: quantity } }
      })
      await tx.consumableUsage.create({
        data: { supplyId: itemId, quantity, unitCost: supply.purchasePrice, reason, notes }
      })
    })
  } else {
    const [prep, simple] = await Promise.all([
      prisma.preparation.findUnique({ where: { id: itemId } }),
      getPreparationsSimple()
    ])
    if (!prep || !prep.isConsumable) throw new Error('Consumible no encontrado')
    const currentStock = Number(prep.currentStock)
    if (currentStock < quantity) {
      throw new Error(`Stock insuficiente. Stock actual: ${currentStock}`)
    }
    const unitCost = simple.find((p) => p.id === itemId)?.costPrice ?? 0

    await prisma.$transaction(async (tx) => {
      await tx.preparation.update({
        where: { id: itemId },
        data: { currentStock: { decrement: quantity } }
      })
      await tx.consumableUsage.create({
        data: { preparationId: itemId, quantity, unitCost, reason, notes }
      })
    })
  }

  revalidatePath('/ventas')
  revalidatePath('/consumibles')
  revalidatePath('/preparaciones')
  revalidatePath('/inventario')
}

export async function getConsumableUsageHistory() {
  return prisma.consumableUsage.findMany({
    where: { deletedAt: null },
    include: { supply: true, preparation: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

export async function formatConsumableHistory(historyRaw: Awaited<ReturnType<typeof getConsumableUsageHistory>>) {
  return historyRaw.map((h) => ({
    id: h.id,
    supplyName: h.supply?.name ?? h.preparation?.name ?? 'Desconocido',
    unit: h.supply?.unit ?? h.preparation?.unit ?? '',
    quantity: Number(h.quantity),
    cost: Number(h.quantity) * Number(h.unitCost),
    reason: h.reason,
    notes: h.notes,
    createdAt: h.createdAt.toISOString()
  }))
}
