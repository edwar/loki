import { getProducts } from '@/lib/actions/products'
import { getSupplies } from '@/lib/actions/supplies'
import { ProductosClient } from './productos-client'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const [productsRaw, suppliesRaw] = await Promise.all([
    getProducts(),
    getSupplies()
  ])

  const products = productsRaw.map((p: any) => {
    const salePrice = Number(p.salePrice)
    const currentStock = Number(p.currentStock)
    const yieldAmount = Number(p.yield) || 1
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
      category: p.category,
      salePrice,
      currentStock,
      yield: yieldAmount,
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

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean) as string[])]

  return (
    <ProductosClient
      products={products}
      categories={categories}
      allSupplies={supplies}
    />
  )
}