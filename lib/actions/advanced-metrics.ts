'use server'

import { prisma } from '@/lib/prisma'
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export interface AdvancedMetrics {
  ticketPromedio: number
  ticketPromedioAnterior: number
  ticketCambio: number
  
  productosMasVendidos: { productId: string; name: string; quantity: number; revenue: number }[]
  
  clientesTop: { customerId: string | null; name: string; totalPurchases: number; orderCount: number }[]
  
  comparacionPeriodo: {
    ventasActual: number
    ventasAnterior: number
    cambioVentas: number
    gastosActual: number
    gastosAnterior: number
    cambioGastos: number
    utilidadActual: number
    utilidadAnterior: number
    cambioUtilidad: number
  }
  
  rotacionInventario: {
    tasaRotacion: number
    diasPromedioStock: number
    valorInventario: number
    costoVentas: number
  }
}

export async function getAdvancedMetrics(range: string = '30d'): Promise<AdvancedMetrics> {
  const today = new Date()
  
  let startDate = subDays(today, 30)
  let previousStartDate = subDays(startDate, 30)
  
  if (range === '7d') {
    startDate = subDays(today, 7)
    previousStartDate = subDays(startDate, 7)
  }
  if (range === '90d') {
    startDate = subDays(today, 90)
    previousStartDate = subDays(startDate, 90)
  }
  if (range === 'year') {
    startDate = startOfMonth(today)
    previousStartDate = subMonths(startOfMonth(today), 1)
  }
  if (range === 'all') {
    startDate = new Date(2000, 0, 1)
    previousStartDate = new Date(2000, 0, 1)
  }

  const [
    currentSales,
    previousSales,
    currentExpenses,
    previousExpenses,
    supplies,
    allProducts
  ] = await Promise.all([
    prisma.dailySale.findMany({
      where: { deletedAt: null, createdAt: { gte: startDate } },
      include: { saleItems: { include: { product: { include: { recipeItems: { include: { supply: true } } } } } }, customer: true }
    }),
    prisma.dailySale.findMany({
      where: { deletedAt: null, createdAt: { gte: previousStartDate, lt: startDate } },
      include: { saleItems: { include: { product: true } }, customer: true }
    }),
    prisma.indirectCost.findMany({
      where: { deletedAt: null, date: { gte: startDate } }
    }),
    prisma.indirectCost.findMany({
      where: { deletedAt: null, date: { gte: previousStartDate, lt: startDate } }
    }),
    prisma.supply.findMany({ where: { deletedAt: null } }),
    prisma.product.findMany({ 
      where: { deletedAt: null, isActive: true },
      include: { recipeItems: { include: { supply: true } } }
    })
  ])

  const ventasActual = currentSales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const ventasAnterior = previousSales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const gastosActual = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const gastosAnterior = previousExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const ticketPromedio = currentSales.length > 0 ? ventasActual / currentSales.length : 0
  const ticketPromedioAnterior = previousSales.length > 0 ? ventasAnterior / previousSales.length : 0
  const ticketCambio = ticketPromedioAnterior > 0 
    ? ((ticketPromedio - ticketPromedioAnterior) / ticketPromedioAnterior) * 100 
    : 0

  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const sale of currentSales) {
    for (const item of sale.saleItems || []) {
      const existing = productSalesMap.get(item.productId) || { name: item.product?.name || 'Unknown', quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += Number(item.subtotal)
      productSalesMap.set(item.productId, existing)
    }
  }

  const productosMasVendidos = Array.from(productSalesMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const customerSalesMap = new Map<string, { name: string; totalPurchases: number; orderCount: number }>()
  for (const sale of currentSales) {
    const name = sale.customer?.name || 'Cliente General'
    const existing = customerSalesMap.get(sale.customerId || 'general') || { name, totalPurchases: 0, orderCount: 0 }
    existing.totalPurchases += Number(sale.totalAmount)
    existing.orderCount += 1
    customerSalesMap.set(sale.customerId || 'general', existing)
  }

  const clientesTop = Array.from(customerSalesMap.entries())
    .map(([customerId, data]) => ({ customerId: customerId === 'general' ? null : customerId, ...data }))
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, 5)

  const valorInventario = supplies.reduce((sum, s) => sum + (Number(s.currentStock) * Number(s.purchasePrice)), 0)
  const costoVentas = currentSales.reduce((sum, sale) => {
    return sum + (sale.saleItems || []).reduce((itemSum, item) => {
      const product = allProducts.find(p => p.id === item.productId)
      if (!product || product.recipeItems.length === 0) return itemSum
      
      const totalCost = product.recipeItems.reduce((costSum, ri) => {
        const price = Number(ri.supply?.purchasePrice) || 0
        return costSum + (price * Number(ri.quantityRequired))
      }, 0)
      // Costo por lote (sin rendimiento, se calcula a nivel de producción)
      const costPerUnit = totalCost
      
      return itemSum + (costPerUnit * item.quantity)
    }, 0)
  }, 0)

  const diasEnPeriodo = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30
  const tasaRotacion = valorInventario > 0 ? (costoVentas / valorInventario) * (365 / diasEnPeriodo) : 0
  const diasPromedioStock = tasaRotacion > 0 ? 365 / tasaRotacion : 0

  return {
    ticketPromedio,
    ticketPromedioAnterior,
    ticketCambio,
    productosMasVendidos,
    clientesTop,
    comparacionPeriodo: {
      ventasActual,
      ventasAnterior,
      cambioVentas: ventasAnterior > 0 ? ((ventasActual - ventasAnterior) / ventasAnterior) * 100 : 0,
      gastosActual,
      gastosAnterior,
      cambioGastos: gastosAnterior > 0 ? ((gastosActual - gastosAnterior) / gastosAnterior) * 100 : 0,
      utilidadActual: ventasActual - gastosActual,
      utilidadAnterior: ventasAnterior - gastosAnterior,
      cambioUtilidad: (ventasAnterior - gastosAnterior) > 0 
        ? (((ventasActual - gastosActual) - (ventasAnterior - gastosAnterior)) / (ventasAnterior - gastosAnterior)) * 100 
        : 0
    },
    rotacionInventario: {
      tasaRotacion,
      diasPromedioStock,
      valorInventario,
      costoVentas
    }
  }
}