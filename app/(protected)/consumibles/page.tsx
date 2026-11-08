import { getAllSuppliesForConsumables, getConsumableUsageHistory, formatConsumableHistory } from '@/lib/actions/consumables'
import { ConsumiblesClient } from './consumibles-client'

export const dynamic = 'force-dynamic'

export default async function ConsumiblesPage() {
  const [supplies, history] = await Promise.all([
    getAllSuppliesForConsumables(),
    getConsumableUsageHistory()
  ])

  const formattedHistory = await formatConsumableHistory(history)

  return (
    <ConsumiblesClient 
      supplies={supplies} 
      history={formattedHistory}
    />
  )
}