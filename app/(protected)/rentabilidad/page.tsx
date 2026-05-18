import { getProductProfitability } from '@/lib/actions/profitability'
import { RentabilidadClient } from './rentabilidad-client'

export const dynamic = 'force-dynamic'

export default async function RentabilidadPage(props: {
  searchParams: Promise<{ threshold?: string }>
}) {
  const searchParams = await props.searchParams
  const threshold = searchParams.threshold ? parseFloat(searchParams.threshold) : 20

  const data = await getProductProfitability(threshold)

  return <RentabilidadClient data={data} threshold={threshold} />
}