import { getSupplies } from '@/lib/actions/supplies'
import { getSuppliers } from '@/lib/actions/suppliers'
import { InventarioClient } from './inventario-client'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const [suppliesRaw, suppliers] = await Promise.all([
    getSupplies(),
    getSuppliers()
  ])

  const supplies = suppliesRaw.map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    unit: s.unit,
    currentStock: Number(s.currentStock),
    minStock: Number(s.minStock),
    purchasePrice: Number(s.purchasePrice),
    supplier: s.supplier,
    updatedAt: s.updatedAt.toISOString()
  }))

  const suppliersData = suppliers.map((s: any) => ({
    id: s.id,
    name: s.name
  }))

  return (
    <InventarioClient
      supplies={supplies}
      suppliers={suppliersData}
    />
  )
}