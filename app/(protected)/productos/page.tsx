import { getProducts } from '@/lib/actions/products'
import { getSupplies } from '@/lib/actions/supplies'
import { prisma } from '@/lib/prisma'
import { ProductosClient } from './productos-client'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const [productsRaw, suppliesRaw, dbCategories] = await Promise.all([
    getProducts(),
    getSupplies(),
    prisma.category.findMany({
      where: { type: 'product', deletedAt: null },
      orderBy: { name: 'asc' }
    })
  ])

  const products = productsRaw.map((p: any) => {
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
          const possibleBatchesWithThisSupply = Math.floor(item.supply.currentStock / item.quantityRequired)
          if (possibleBatchesWithThisSupply < maxBatches) {
            maxBatches = possibleBatchesWithThisSupply
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

  const supplies = suppliesRaw.map((s: any) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
    unitsPerPack: Number(s.unitsPerPack)
  }))

  const productCategories = products.map((p: any) => p.category).filter(Boolean) as string[]
  const dbCategoryNames = dbCategories.map((c) => c.name)
  const categories = [...new Set([...productCategories, ...dbCategoryNames])]

  return (
    <ProductosClient
      products={products}
      categories={categories}
      allSupplies={supplies}
    />
  )
}