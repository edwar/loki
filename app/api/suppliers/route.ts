import { getSuppliers } from '@/lib/actions/suppliers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const suppliers = await getSuppliers()
    const suppliersData = suppliers.map((s: any) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      address: s.address,
      purchaseCount: s._count.purchases
    }))
    return NextResponse.json(suppliersData)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 })
  }
}
