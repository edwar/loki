import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { deletedAt: null }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const sales = await prisma.dailySale.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        saleItems: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)

    return NextResponse.json({
      sales,
      total,
      startDate: startDate || '',
      endDate: endDate || ''
    })
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}