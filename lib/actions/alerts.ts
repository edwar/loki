'use server'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay } from 'date-fns'

export interface Alert {
  id: string
  type: 'stock_low' | 'stock_critical' | 'expense_high' | 'low_margin' | 'sales_drop' | 'no_sales_today'
  title: string
  description: string
  severity: 'warning' | 'error' | 'info'
  link?: string
  createdAt: Date
  read: boolean
  dismissed: boolean
}

export interface AlertsSummary {
  alerts: Alert[]
  unreadCount: number
  lowStockCount: number
  highExpenseCount: number
}

export async function getLowStockCount(): Promise<number> {
  try {
    const supplies = await prisma.supply.findMany({
      where: { deletedAt: null }
    })
    return supplies.filter((s) => Number(s.currentStock) < Number(s.minStock)).length
  } catch (error) {
    console.error('Error fetching low stock count:', error)
    return 0
  }
}

export async function getAlerts(): Promise<AlertsSummary> {
  try {
    const alerts = await prisma.alert.findMany({
      where: { dismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = alerts.filter(a => !a.read).length

    const lowStockCount = await getLowStockCount()

    const highExpenseCount = await prisma.alert.count({
      where: { dismissed: false, type: 'expense_high' },
    })

    return {
      alerts: alerts.map(a => ({
        id: a.id,
        type: a.type as Alert['type'],
        title: a.title,
        description: a.description,
        severity: a.severity as Alert['severity'],
        link: a.link || undefined,
        createdAt: a.createdAt,
        read: a.read,
        dismissed: a.dismissed,
      })),
      unreadCount,
      lowStockCount,
      highExpenseCount,
    }
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return { alerts: [], unreadCount: 0, lowStockCount: 0, highExpenseCount: 0 }
  }
}

export async function generateAlerts() {
  try {
    const today = startOfDay(new Date())
    const thirtyDaysAgo = subDays(today, 30)
    const sevenDaysAgo = subDays(today, 7)

    const alerts: { type: string; title: string; description: string; severity: string; link?: string }[] = []

    const supplies = await prisma.supply.findMany({ where: { deletedAt: null } })
    for (const supply of supplies) {
      const currentStock = Number(supply.currentStock)
      const minStock = Number(supply.minStock)
      if (currentStock >= minStock) continue

      const isCritical = currentStock < minStock * 0.5
      const existing = await prisma.alert.findFirst({
        where: { type: isCritical ? 'stock_critical' : 'stock_low', dismissed: false, description: { startsWith: supply.name } },
      })
      if (existing) continue

      alerts.push({
        type: isCritical ? 'stock_critical' : 'stock_low',
        title: isCritical ? 'Stock Crítico' : 'Stock Bajo',
        description: `${supply.name}: ${currentStock} ${supply.unit} (mín: ${minStock})`,
        severity: isCritical ? 'error' : 'warning',
        link: '/insumos',
      })
    }

    const expenses = await prisma.indirectCost.findMany({
      where: { deletedAt: null, date: { gte: thirtyDaysAgo } },
    })
    const supplyExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const avgExpense = expenses.length > 0 ? supplyExpenses / expenses.length : 0
    const highExpenseThreshold = avgExpense * 2

    for (const expense of expenses) {
      if (Number(expense.amount) <= highExpenseThreshold) continue
      const existing = await prisma.alert.findFirst({
        where: { type: 'expense_high', dismissed: false, description: { startsWith: expense.type } },
      })
      if (existing) continue

      alerts.push({
        type: 'expense_high',
        title: 'Gasto Elevado',
        description: `${expense.type}: $${Number(expense.amount).toLocaleString()} (promedio: $${avgExpense.toLocaleString()})`,
        severity: 'warning',
        link: '/gastos',
      })
    }

    const products = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      include: { recipeItems: { where: { deletedAt: null } } },
    })

    for (const product of products) {
      if (product.recipeItems.length === 0) {
        const existing = await prisma.alert.findFirst({
          where: { type: 'low_margin', dismissed: false, description: { startsWith: product.name } },
        })
        if (existing) continue

        alerts.push({
          type: 'low_margin',
          title: 'Sin Receta',
          description: `${product.name}: no tiene una receta definida`,
          severity: 'warning',
        })
        continue
      }

      const profitMargin = Number(product.profitMargin) || 30
      if (profitMargin >= 20) continue
      const existing = await prisma.alert.findFirst({
        where: { type: 'low_margin', dismissed: false, description: { startsWith: product.name } },
      })
      if (existing) continue

      alerts.push({
        type: 'low_margin',
        title: 'Margen Bajo',
        description: `${product.name}: ${profitMargin}% configurado`,
        severity: 'warning',
        link: '/rentabilidad',
      })
    }

    const periodSales = await prisma.dailySale.findMany({
      where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } },
    })
    const todaySales = periodSales.filter(s => s.createdAt >= today)
    const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
    const sevenDayAvg = periodSales.length > 0
      ? periodSales.reduce((sum, s) => sum + Number(s.totalAmount), 0) / 7
      : 0

    const existingSalesDrop = await prisma.alert.findFirst({
      where: { type: 'sales_drop', dismissed: false, createdAt: { gte: today } },
    })

    if (sevenDayAvg > 0 && todayTotal < sevenDayAvg * 0.5 && !existingSalesDrop) {
      alerts.push({
        type: 'sales_drop',
        title: 'Caída de Ventas',
        description: `Hoy: ${todayTotal > 0 ? '$' + todayTotal.toLocaleString() : 'sin ventas'} (promedio diario: $${sevenDayAvg.toLocaleString()})`,
        severity: 'warning',
        link: '/ventas',
      })
    }

    const hour = new Date().getHours()
    const existingNoSales = await prisma.alert.findFirst({
      where: { type: 'no_sales_today', dismissed: false, createdAt: { gte: today } },
    })

    if (hour >= 16 && todayTotal === 0 && !existingNoSales) {
      alerts.push({
        type: 'no_sales_today',
        title: 'Sin Ventas Hoy',
        description: 'Aún no registras ninguna venta. Revisa tu tienda o agenda.',
        severity: 'info',
        link: '/ventas',
      })
    }

    if (alerts.length === 0) return { generated: 0 }

    await prisma.alert.createMany({ data: alerts })
    return { generated: alerts.length }
  } catch (error) {
    console.error('Error generating alerts:', error)
    return { generated: 0 }
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.alert.update({ where: { id }, data: { read: true } })
    return { success: true }
  } catch (error) {
    console.error('Error marking alert as read:', error)
    return { success: false }
  }
}

export async function markAllAsRead() {
  try {
    await prisma.alert.updateMany({
      where: { read: false, dismissed: false },
      data: { read: true },
    })
    return { success: true }
  } catch (error) {
    console.error('Error marking all alerts as read:', error)
    return { success: false }
  }
}

export async function dismissAlert(id: string) {
  try {
    await prisma.alert.update({ where: { id }, data: { dismissed: true } })
    return { success: true }
  } catch (error) {
    console.error('Error dismissing alert:', error)
    return { success: false }
  }
}
