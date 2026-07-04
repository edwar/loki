import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        images: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        recipeItems: {
          where: { deletedAt: null },
          include: { supply: true },
          orderBy: { createdAt: 'desc' },
        },
        productRecipeItems: {
          where: { deletedAt: null },
          include: { preparation: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const prepIds = products.flatMap((p) =>
      p.productRecipeItems.map((pri) => pri.preparationId)
    )
    if (prepIds.length > 0) {
      const prepsWithIngredients = await prisma.preparation.findMany({
        where: { id: { in: prepIds } },
        include: {
          ingredients: {
            include: { supply: true, subPreparation: true },
          },
        },
      })
      const costMap = new Map<string, number>()

      function resolveCost(prepId: string, visited: Set<string>): number {
        const cached = costMap.get(prepId)
        if (cached !== undefined) return cached
        if (visited.has(prepId)) return 0
        visited.add(prepId)

        const prep = prepsWithIngredients.find((p) => p.id === prepId)
        if (!prep) return 0

        const yieldAmount = Number(prep.yield) || 1
        const total = prep.ingredients.reduce((acc, ing) => {
          const qty = Number(ing.quantity) || 0
          if (ing.supply) return acc + qty * (Number(ing.supply.purchasePrice) || 0)
          if (ing.subPreparation) return acc + qty * resolveCost(ing.subPreparation.id, visited)
          return acc
        }, 0)
        const cost = yieldAmount > 0 ? total / yieldAmount : 0
        costMap.set(prepId, cost)
        return cost
      }

      for (const prep of prepsWithIngredients) {
        resolveCost(prep.id, new Set())
      }
      for (const product of products) {
        for (const pri of product.productRecipeItems) {
          const computed = costMap.get(pri.preparationId)
          if (computed !== undefined) {
            ;(pri.preparation as any).costPrice = computed
          }
        }
      }
    }

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
      const productRecipeItems = p.productRecipeItems?.map((pri: any) => ({
        ...pri,
        quantity: Number(pri.quantity),
        preparation: pri.preparation ? {
          ...pri.preparation,
          currentStock: Number(pri.preparation.currentStock),
          costPrice: Number(pri.preparation.costPrice),
        } : null,
      })) || []

      const supplyCost = recipeItems.reduce((acc: number, ri: any) => {
        return acc + (Number(ri.quantityRequired) || 0) * (Number(ri.supply?.purchasePrice) || 0)
      }, 0)
      const preparationCost = productRecipeItems.reduce((acc: number, pri: any) => {
        return acc + (Number(pri.quantity) || 0) * (Number(pri.preparation?.costPrice) || 0)
      }, 0)
      const recipeCost = supplyCost + preparationCost
      const unitCost = yieldAmount > 0 ? recipeCost / yieldAmount : 0
      const computedMargin = salePrice > 0 && unitCost > 0
        ? ((salePrice - unitCost) / salePrice) * 100
        : profitMargin

      let maxBatches = Infinity
      if (recipeItems.length === 0 && productRecipeItems.length === 0) {
        maxBatches = 0
      } else {
        for (const item of recipeItems) {
          if (item.supply) {
            const possible = Math.floor(item.supply.currentStock / item.quantityRequired)
            if (possible < maxBatches) maxBatches = possible
          }
        }
        for (const item of productRecipeItems) {
          if (item.preparation) {
            const possible = Math.floor(item.preparation.currentStock / item.quantity)
            if (possible < maxBatches) maxBatches = possible
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
        productRecipeItems,
        maxPossibleBatches: maxBatches === Infinity ? 0 : maxBatches,
        isPublic: p.isPublic ?? false,
        preparation: p.preparation,
        computedMargin,
      }
    })

    mapped.sort((a: any, b: any) => b.computedMargin - a.computedMargin)

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
}
