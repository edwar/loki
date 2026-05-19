import { getAllSuppliesForConsumables, getConsumableUsageHistory } from '@/lib/actions/consumables'
import { ConsumiblesClient } from './consumibles-client'

export const dynamic = 'force-dynamic'

export default async function ConsumiblesPage() {
  const [supplies, history] = await Promise.all([
    getAllSuppliesForConsumables(),
    getConsumableUsageHistory()
  ])

  const formattedHistory = history.map((h: any) => ({
    id: h.id,
    supplyName: h.supply?.name || 'Unknown',
    quantity: h.quantity,
    reason: h.reason,
    notes: h.notes,
    createdAt: h.createdAt.toISOString()
  }))

  return (
    <ConsumiblesClient 
      supplies={supplies} 
      history={formattedHistory}
    />
  )
}