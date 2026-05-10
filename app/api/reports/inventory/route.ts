import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supplies = await prisma.supply.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    })

    const totalValue = supplies.reduce((sum, s) => sum + Number(s.currentStock) * Number(s.purchasePrice), 0)
    const lowStock = supplies.filter(s => Number(s.currentStock) < Number(s.minStock))
    const criticalCount = lowStock.length

    return NextResponse.json({
      supplies,
      totalValue,
      lowStock,
      criticalCount
    })
  } catch (error) {
    console.error('Error fetching inventory report:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}