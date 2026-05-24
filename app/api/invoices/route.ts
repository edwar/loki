import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
      include: {
        customer: { select: { id: true, name: true } },
        invoiceItems: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error fetching invoices' }, { status: 500 })
  }
}
