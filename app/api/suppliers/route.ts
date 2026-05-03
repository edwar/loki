import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(suppliers)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching suppliers' }, { status: 500 })
  }
}
