import { getActiveProducts, getSales } from '@/lib/actions/sales'
import { getCustomers } from '@/lib/actions/customers'
import { VentasClient } from './ventas-client'

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const [productsRaw, customersRaw, salesRaw] = await Promise.all([
    getActiveProducts(),
    getCustomers(),
    getSales()
  ])

  const products = productsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    salePrice: Number(p.salePrice),
    currentStock: Number(p.currentStock),
    yield: Number(p.yield) || 1,
    recipeItems: p.recipeItems?.map((ri: any) => ({
      id: ri.id,
      quantityRequired: Number(ri.quantityRequired),
      unit: ri.unit,
      supply: ri.supply ? {
        name: ri.supply.name,
        currentStock: Number(ri.supply.currentStock),
        minStock: Number(ri.supply.minStock),
        purchasePrice: Number(ri.supply.purchasePrice)
      } : null
    })) || []
  }))

  const customers = customersRaw.map((c: any) => ({
    id: c.id,
    name: c.name,
    totalPurchases: Number(c.totalPurchases)
  }))

  const sales = salesRaw.map((s: any) => ({
    id: s.id,
    totalAmount: Number(s.totalAmount),
    createdAt: s.createdAt.toISOString(),
    customer: s.customer ? {
      name: s.customer.name,
      totalPurchases: Number(s.customer.totalPurchases)
    } : null,
    saleItems: s.saleItems?.map((si: any) => ({
      id: si.id,
      quantity: Number(si.quantity),
      unitPrice: Number(si.unitPrice),
      subtotal: Number(si.subtotal),
      product: si.product ? {
        name: si.product.name,
        salePrice: Number(si.product.salePrice),
        currentStock: Number(si.product.currentStock),
        yield: Number(si.product.yield) || 1
      } : null
    })) || []
  }))

  return (
    <VentasClient
      products={products}
      customers={customers}
      sales={sales}
    />
  )
}