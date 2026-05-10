import { getSuppliers } from '@/lib/actions/suppliers'
import { ProveedoresClient } from './proveedores-client'

export const dynamic = 'force-dynamic'

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers()

  const suppliersData = suppliers.map((s: any) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    address: s.address,
    purchaseCount: s._count.purchases
  }))

  return <ProveedoresClient suppliers={suppliersData} />
}