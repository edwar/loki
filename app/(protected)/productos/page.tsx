import { getProducts } from '@/lib/actions/products'
import { getSupplies } from '@/lib/actions/supplies'
import { getPreparationsSimple } from '@/lib/actions/preparations'
import { getUserCompany } from '@/lib/actions/companies'
import { prisma } from '@/lib/prisma'
import { ProductosClient } from './productos-client'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const [productsRaw, suppliesRaw, dbCategories, userCompany, preparations] = await Promise.all([
    getProducts(),
    getSupplies(),
    prisma.category.findMany({
      where: { type: 'product', deletedAt: null },
      orderBy: { name: 'asc' }
    }),
    getUserCompany(),
    getPreparationsSimple(),
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
      }       : null
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

    const recipeCost = recipeItems.reduce((acc: number, ri: any) => {
      return acc + (Number(ri.quantityRequired) || 0) * (Number(ri.supply?.purchasePrice) || 0)
    }, 0)
    const prepCost = productRecipeItems.reduce((acc: number, pri: any) => {
      return acc + (Number(pri.quantity) || 0) * (Number(pri.preparation?.costPrice) || 0)
    }, 0)
    const totalRecipeCost = recipeCost + prepCost
    const unitCost = yieldAmount > 0 ? totalRecipeCost / yieldAmount : 0
    const computedMargin = salePrice > 0 && unitCost > 0
      ? ((salePrice - unitCost) / salePrice) * 100
      : profitMargin

    let maxBatches = Infinity
    if (recipeItems.length === 0 && productRecipeItems.length === 0) {
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
      for (const item of productRecipeItems) {
        if (item.preparation) {
          const possible = Math.floor(item.preparation.currentStock / item.quantity)
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
      productRecipeItems,
      maxPossibleBatches: maxBatches === Infinity ? 0 : maxBatches,
      companyId: p.companyId,
      isPublic: p.isPublic ?? false,
      preparation: p.preparation,
      computedMargin,
    }
  })

  products.sort((a: any, b: any) => b.computedMargin - a.computedMargin)

  const supplies = suppliesRaw.map((s: any) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
    unitsPerPack: Number(s.unitsPerPack)
  }))

  const productCategories = products.map((p: any) => p.category).filter(Boolean) as string[]
  const dbCategoryNames = dbCategories.map((c: any) => c.name)
  const categories = [...new Set([...productCategories, ...dbCategoryNames])]

  return (
    <ProductosClient
      products={products}
      categories={categories}
      allSupplies={supplies}
      allPreparations={preparations}
      company={userCompany ? { id: userCompany.id, name: userCompany.name, slug: userCompany.slug } : undefined}
    />
  )
}