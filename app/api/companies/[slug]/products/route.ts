import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const company = await prisma.company.findUnique({
      where: { slug, deletedAt: null, isActive: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        companyId: company.id,
        deletedAt: null,
        isActive: true,
        isPublic: true,
      },
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        recipeItems: {
          where: { deletedAt: null },
          include: { supply: { select: { name: true, unit: true, purchasePrice: true } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      salePrice: Number(p.salePrice),
      currentStock: Number(p.currentStock),
      images: (p.images || []).map((i) => ({ url: i.url, publicId: i.publicId })),
      ingredients: (p.recipeItems || []).map((ri) => ({
        name: ri.supply?.name || '',
        quantity: Number(ri.quantityRequired),
        unit: ri.unit,
      })),
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
}
