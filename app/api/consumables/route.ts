import { getAllSuppliesForConsumables, getConsumableUsageHistory } from '@/lib/actions/consumables'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [supplies, historyRaw] = await Promise.all([
      getAllSuppliesForConsumables(),
      getConsumableUsageHistory()
    ])
    const history = historyRaw.map((h: any) => ({
      id: h.id,
      supplyName: h.supply?.name || 'Unknown',
      quantity: h.quantity,
      reason: h.reason,
      notes: h.notes,
      createdAt: h.createdAt.toISOString()
    }))
    return NextResponse.json({ supplies, history })
  } catch (error) {
    console.error('Error fetching consumables:', error)
    return NextResponse.json({ error: 'Error al obtener consumibles' }, { status: 500 })
  }
}
