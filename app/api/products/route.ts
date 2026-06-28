import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        recipeItems: {
          where: { deletedAt: null },
          include: { supply: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = products.map((p: any) => {
      const currentStock = Number(p.currentStock)
      const profitMargin = Number(p.profitMargin) || 30
      const yieldAmount = Number(p.yield) || 1
      const salePrice = Number(p.salePrice)
      const images = (p.images || [])
        .filter((i: any) => !i.deletedAt)
        .map((i: any) => ({ id: i.id, url: i.url, publicId: i.publicId, order: i.order }))
      const recipeItems = p.recipeItems?.map((ri: any) => ({
        ...ri,
        quantityRequired: Number(ri.quantityRequired),
        supply: ri.supply ? {
          ...ri.supply,
          currentStock: Number(ri.supply.currentStock),
          minStock: Number(ri.supply.minStock),
          purchasePrice: Number(ri.supply.purchasePrice)
        } : null
      })) || []

      let maxBatches = Infinity
      if (recipeItems.length === 0) {
        maxBatches = 0
      } else {
        for (const item of recipeItems) {
          if (item.supply) {
            const possible = Math.floor(item.supply.currentStock / item.quantityRequired)
            if (possible < maxBatches) {
              maxBatches = possible
            }
          }
        }
      }

      return {
        id: p.id,
        name: p.name,
        category: p.category?.name || null,
        currentStock,
        profitMargin,
        yield: yieldAmount,
        salePrice,
        images,
        recipeItems,
        maxPossibleBatches: maxBatches === Infinity ? 0 : maxBatches
      }
    })

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
}
