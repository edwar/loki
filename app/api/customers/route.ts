import { getCustomers } from '@/lib/actions/customers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const customersRaw = await getCustomers()
    const customers = customersRaw.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      saleCount: c._count.sales
    }))
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}
