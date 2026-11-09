import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supply = await prisma.supply.findUnique({
      where: { id },
      select: { id: true, name: true, unit: true },
    })
    if (!supply) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 })
    }

    // unitPrice de PurchaseItem ya está en la unidad base del insumo
    const items = await prisma.purchaseItem.findMany({
      where: {
        supplyId: id,
        deletedAt: null,
        purchaseOrder: { deletedAt: null, status: 'completed' },
      },
      select: {
        unitPrice: true,
        purchaseOrder: {
          select: {
            purchaseDate: true,
            supplier: { select: { id: true, name: true } },
          },
        },
      },
    })

    const bySupplier = new Map<
      string,
      {
        supplierId: string | null
        supplierName: string
        lastPrice: number
        lastDate: Date
        bestPrice: number
        purchases: number
      }
    >()

    for (const item of items) {
      const price = Number(item.unitPrice)
      if (!(price > 0)) continue
      const supplier = item.purchaseOrder.supplier
      const key = supplier?.id ?? 'none'
      const date = item.purchaseOrder.purchaseDate
      const current = bySupplier.get(key)

      if (!current) {
        bySupplier.set(key, {
          supplierId: supplier?.id ?? null,
          supplierName: supplier?.name ?? 'Sin proveedor',
          lastPrice: price,
          lastDate: date,
          bestPrice: price,
          purchases: 1,
        })
        continue
      }

      current.purchases += 1
      current.bestPrice = Math.min(current.bestPrice, price)
      if (date > current.lastDate) {
        current.lastDate = date
        current.lastPrice = price
      }
    }

    const suppliers = [...bySupplier.values()]
      .sort((a, b) => a.lastPrice - b.lastPrice)
      .map((s) => ({ ...s, lastDate: s.lastDate.toISOString() }))

    return NextResponse.json({ supply, suppliers })
  } catch (error) {
    console.error('Error fetching price comparison:', error)
    return NextResponse.json({ error: 'Error al obtener comparación de precios' }, { status: 500 })
  }
}
