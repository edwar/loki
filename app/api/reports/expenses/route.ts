import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { deletedAt: null }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59')
    }

    const expenses = await prisma.indirectCost.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    const byCategory: Record<string, number> = {}
    let total = 0
    expenses.forEach(e => {
      byCategory[e.type] = (byCategory[e.type] || 0) + Number(e.amount)
      total += Number(e.amount)
    })

    return NextResponse.json({
      expenses,
      byCategory,
      total,
      startDate: startDate || '',
      endDate: endDate || ''
    })
  } catch (error) {
    console.error('Error fetching expenses report:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}