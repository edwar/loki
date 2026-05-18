import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
      ...(type ? { type } : {})
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(categories)
}