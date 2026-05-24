import { prisma } from '@/lib/prisma'
import { eachDayOfInterval, subDays, format } from 'date-fns'
import { getAdvancedMetrics } from './advanced-metrics'

function getStartDate(range: string) {
  if (range === '7d') return subDays(new Date(), 7)
  if (range === '90d') return subDays(new Date(), 90)
  if (range === 'year') {
    const d = new Date()
    d.setMonth(0, 1)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (range === 'all') return new Date(2000, 0, 1)
  return subDays(new Date(), 30)
}

export async function getDashboardData(range: string = '30d') {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = getStartDate(range)
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const [
    suppliesCount,
    productsCount,
    todaySales,
    todayExpenses,
    yesterdaySales,
    periodSales,
    periodExpenses,
    recentSales,
    recentExpenses,
    historicalData,
    advancedMetrics,
  ] = await Promise.all([
    prisma.supply.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.dailySale.findMany({ where: { deletedAt: null, createdAt: { gte: today } } }),
    prisma.indirectCost.findMany({ where: { deletedAt: null, date: { gte: today } } }),
    prisma.dailySale.findMany({
      where: { deletedAt: null, createdAt: { gte: yesterday, lt: today } },
    }),
    prisma.dailySale.findMany({ where: { deletedAt: null, createdAt: { gte: startDate } } }),
    prisma.indirectCost.findMany({ where: { deletedAt: null, date: { gte: startDate } } }),
    prisma.dailySale.findMany({
      where: { deletedAt: null },
      include: { saleItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.indirectCost.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    getHistoricalData(startDate),
    getAdvancedMetrics(range),
  ])

  const salesTotal = todaySales.reduce((sum: number, s) => sum + Number(s.totalAmount), 0)
  const expensesTotal = todayExpenses.reduce((sum: number, e) => sum + Number(e.amount), 0)
  const yesterdayTotal = yesterdaySales.reduce((sum: number, s) => sum + Number(s.totalAmount), 0)
  const periodSalesTotal = periodSales.reduce((sum: number, s) => sum + Number(s.totalAmount), 0)
  const periodExpensesTotal = periodExpenses.reduce((sum: number, e) => sum + Number(e.amount), 0)
  const salesChange = yesterdayTotal > 0 ? ((salesTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0

  const lowStock = await prisma.supply
    .findMany({ where: { deletedAt: null } })
    .then((supplies) => supplies.filter((s) => Number(s.currentStock) < Number(s.minStock)).slice(0, 5))

  return {
    stats: {
      suppliesCount,
      productsCount,
      salesTotal,
      expensesTotal,
      salesChange,
      periodSalesTotal,
      periodExpensesTotal,
    },
    recentSales: recentSales.map((s) => ({
      id: s.id,
      totalAmount: Number(s.totalAmount),
      customer: s.customerId ? { name: 'Cliente' } : null,
      saleItems: s.saleItems.map((i) => ({
        product: i.product ? { name: i.product.name } : null,
        quantity: i.quantity,
      })),
      createdAt: s.createdAt.toISOString(),
    })),
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      type: e.type,
      amount: Number(e.amount),
      description: e.description,
      date: e.date.toISOString(),
    })),
    historicalData,
    advancedMetrics: {
      ticketPromedio: Number(advancedMetrics.ticketPromedio),
      ticketPromedioAnterior: Number(advancedMetrics.ticketPromedioAnterior),
      ticketCambio: Number(advancedMetrics.ticketCambio),
      rotacionInventario: {
        tasaRotacion: Number(advancedMetrics.rotacionInventario.tasaRotacion),
        diasPromedioStock: Number(advancedMetrics.rotacionInventario.diasPromedioStock),
        valorInventario: Number(advancedMetrics.rotacionInventario.valorInventario),
      },
      productosMasVendidos: advancedMetrics.productosMasVendidos.map((p: any) => ({
        productId: p.productId,
        name: p.name,
        revenue: Number(p.revenue),
      })),
      clientesTop: advancedMetrics.clientesTop.map((c: any) => ({
        customerId: c.customerId,
        name: c.name,
        totalPurchases: Number(c.totalPurchases),
      })),
      comparacionPeriodo: {
        ventasActual: Number(advancedMetrics.comparacionPeriodo.ventasActual),
        cambioVentas: Number(advancedMetrics.comparacionPeriodo.cambioVentas),
        gastosActual: Number(advancedMetrics.comparacionPeriodo.gastosActual),
        cambioGastos: Number(advancedMetrics.comparacionPeriodo.cambioGastos),
        utilidadActual: Number(advancedMetrics.comparacionPeriodo.utilidadActual),
        cambioUtilidad: Number(advancedMetrics.comparacionPeriodo.cambioUtilidad),
      },
    },
    lowStock: lowStock.map((s) => ({
      id: s.id,
      name: s.name,
      currentStock: Number(s.currentStock),
      unit: s.unit,
    })),
  }
}

async function getHistoricalData(startDate: Date) {
  const [sales, expenses] = await Promise.all([
    prisma.dailySale.findMany({
      where: { deletedAt: null, createdAt: { gte: startDate } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.indirectCost.findMany({
      where: { deletedAt: null, date: { gte: startDate } },
      select: { amount: true, type: true, date: true },
    }),
  ])

  const allDays = eachDayOfInterval({ start: startDate, end: new Date() })
  const salesMap = sales.reduce((acc: Record<string, number>, sale) => {
    const day = format(sale.createdAt, 'yyyy-MM-dd')
    acc[day] = (acc[day] || 0) + Number(sale.totalAmount)
    return acc
  }, {})

  const salesByDay = allDays.map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    amount: salesMap[format(day, 'yyyy-MM-dd')] || 0,
  }))

  const expensesByCategoryMap = expenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + Number(expense.amount)
    return acc
  }, {})

  return {
    salesByDay,
    expensesByCategory: Object.entries(expensesByCategoryMap).map(([name, value]) => ({
      name,
      value: Number(value),
    })),
  }
}
