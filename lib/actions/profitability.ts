'use server'

import { prisma } from '@/lib/prisma'

export interface ProductProfitability {
  id: string
  name: string
  category: string | null
  salePrice: number
  yield: number
  totalRecipeCost: number
  costPerUnit: number
  margin: number
  marginPercentage: number
  isProfitable: boolean
  hasRecipe: boolean
}

export interface CategoryProfitability {
  category: string
  productCount: number
  totalRevenue: number
  totalCost: number
  totalMargin: number
  avgMarginPercentage: number
}

export interface ProfitabilitySummary {
  products: ProductProfitability[]
  categories: CategoryProfitability[]
  alerts: { productId: string; productName: string; marginPercentage: number }[]
  averageMargin: number
  totalProducts: number
  profitableProducts: number
  unprofitableProducts: number
}

const DEFAULT_MARGIN_THRESHOLD = 20 // 20% mínimo

export async function getProductProfitability(marginThreshold: number = DEFAULT_MARGIN_THRESHOLD): Promise<ProfitabilitySummary> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    include: {
      category: true,
      recipeItems: {
        where: { deletedAt: null },
        include: {
          supply: {
            select: {
              id: true,
              name: true,
              purchasePrice: true,
              unit: true
            }
          }
        }
      }
    }
  })

  const productProfitability: ProductProfitability[] = products.map(product => {
    const profitMargin = Number(product.profitMargin) || 30
    const salePrice = Number(product.salePrice)
    const yieldAmount = Number(product.yield) || 1

    const totalRecipeCost = product.recipeItems.reduce((sum, item) => {
      const supplyPrice = Number(item.supply?.purchasePrice) || 0
      const quantityRequired = Number(item.quantityRequired) || 0
      return sum + (supplyPrice * quantityRequired)
    }, 0)

    // Si no hay receta, no podemos calcular rentabilidad real
    if (product.recipeItems.length === 0) {
      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || null,
        salePrice,
        yield: yieldAmount,
        totalRecipeCost: 0,
        costPerUnit: 0,
        margin: 0,
        marginPercentage: 0,
        isProfitable: false,
        hasRecipe: false
      }
    }

    // Usar el precio de venta almacenado si existe, de lo contrario calcularlo
    const effectiveSalePrice = salePrice > 0
      ? salePrice
      : (totalRecipeCost / yieldAmount) * (1 + profitMargin / 100)

    const costPerUnit = yieldAmount > 0 ? totalRecipeCost / yieldAmount : totalRecipeCost
    const margin = effectiveSalePrice - costPerUnit
    const marginPercentage = effectiveSalePrice > 0 ? (margin / effectiveSalePrice) * 100 : 0

    return {
      id: product.id,
      name: product.name,
      category: product.category?.name || null,
      salePrice: effectiveSalePrice,
      yield: yieldAmount,
      totalRecipeCost,
      costPerUnit,
      margin,
      marginPercentage,
      isProfitable: margin > 0,
      hasRecipe: true
    }
  })

  const categoryMap = new Map<string, CategoryProfitability>()
  
  productProfitability.forEach(product => {
    const category = product.category || 'Sin categoría'
    const existing = categoryMap.get(category)
    
    if (existing) {
      existing.productCount += 1
      existing.totalRevenue += product.salePrice * product.yield
      existing.totalCost += product.totalRecipeCost
      existing.totalMargin += product.margin * product.yield
    } else {
      categoryMap.set(category, {
        category,
        productCount: 1,
        totalRevenue: product.salePrice * product.yield,
        totalCost: product.totalRecipeCost,
        totalMargin: product.margin * product.yield,
        avgMarginPercentage: product.marginPercentage
      })
    }
  })

  const categories: CategoryProfitability[] = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    avgMarginPercentage: cat.totalRevenue > 0 ? (cat.totalMargin / cat.totalRevenue) * 100 : 0
  }))

  const alerts = productProfitability
    .filter(p => p.hasRecipe && p.marginPercentage < marginThreshold)
    .map(p => ({
      productId: p.id,
      productName: p.name,
      marginPercentage: p.marginPercentage
    }))
    .slice(0, 10)

  const totalProducts = productProfitability.length
  const profitableProducts = productProfitability.filter(p => p.isProfitable).length
  const unprofitableProducts = totalProducts - profitableProducts

  const productsWithRecipe = productProfitability.filter(p => p.hasRecipe)
  const averageMargin = productsWithRecipe.length > 0
    ? productsWithRecipe.reduce((sum, p) => sum + p.marginPercentage, 0) / productsWithRecipe.length
    : 0

  return {
    products: productProfitability,
    categories,
    alerts,
    averageMargin,
    totalProducts,
    profitableProducts,
    unprofitableProducts
  }
}