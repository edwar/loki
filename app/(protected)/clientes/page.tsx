import { getCustomers } from '@/lib/actions/customers'
import { ClientesClient } from './clientes-client'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const customersRaw = await getCustomers()

  const customers = customersRaw.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    saleCount: c._count.sales
  }))

  return <ClientesClient customers={customers} />
}