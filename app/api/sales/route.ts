import { getSales } from '@/lib/actions/sales'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const salesRaw = await getSales()
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
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 })
  }
}
