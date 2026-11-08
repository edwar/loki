import { getAllSuppliesForConsumables, getConsumableUsageHistory, formatConsumableHistory } from '@/lib/actions/consumables'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [supplies, historyRaw] = await Promise.all([
      getAllSuppliesForConsumables(),
      getConsumableUsageHistory()
    ])
    const history = await formatConsumableHistory(historyRaw)
    return NextResponse.json({ supplies, history })
  } catch (error) {
    console.error('Error fetching consumables:', error)
    return NextResponse.json({ error: 'Error al obtener consumibles' }, { status: 500 })
  }
}
