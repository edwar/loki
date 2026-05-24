import { getSupplies } from '@/lib/actions/supplies'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const suppliesRaw = await getSupplies()
    const supplies = suppliesRaw.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category?.name || null,
      unit: s.unit,
      currentStock: Number(s.currentStock),
      minStock: Number(s.minStock),
      purchasePrice: Number(s.purchasePrice),
      supplier: s.supplier,
      updatedAt: s.updatedAt.toISOString()
    }))
    return NextResponse.json(supplies)
  } catch (error) {
    console.error('Error fetching supplies:', error)
    return NextResponse.json({ error: 'Error al obtener insumos' }, { status: 500 })
  }
}
