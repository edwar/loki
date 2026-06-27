'use server'

import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export interface Alert {
  id: string
  type: 'stock_low' | 'stock_critical' | 'expense_high' | 'low_margin'
  title: string
  description: string
  severity: 'warning' | 'error' | 'info'
  link?: string
  createdAt: Date
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
    
    const lowStockCount = supplies.filter((s) => Number(s.currentStock) < Number(s.minStock)).length
    
    return lowStockCount
  } catch (error) {
    console.error('Error fetching low stock count:', error)
    return 0
  }
}

export async function getAlerts(): Promise<AlertsSummary> {
  try {
    const alerts: Alert[] = []
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)

    const supplies = await prisma.supply.findMany({
      where: { deletedAt: null }
    })

    const expenses = await prisma.indirectCost.findMany({
      where: {
        deletedAt: null,
        date: { gte: thirtyDaysAgo }
      }
    })

    const supplyExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const avgExpense = expenses.length > 0 ? supplyExpenses / expenses.length : 0
    const highExpenseThreshold = avgExpense * 2

    for (const supply of supplies) {
      const currentStock = Number(supply.currentStock)
      const minStock = Number(supply.minStock)

      if (currentStock < minStock) {
        const severity = currentStock < minStock * 0.5 ? 'error' : 'warning'
        alerts.push({
          id: `stock-${supply.id}`,
          type: currentStock < minStock * 0.5 ? 'stock_critical' : 'stock_low',
          title: currentStock < minStock * 0.5 ? 'Stock Crítico' : 'Stock Bajo',
          description: `${supply.name}: ${currentStock} ${supply.unit} (mín: ${minStock})`,
          severity,
          link: '/insumos',
          createdAt: today
        })
      }
    }

    const recentExpenses = expenses.filter(e => Number(e.amount) > highExpenseThreshold)
    for (const expense of recentExpenses) {
      alerts.push({
        id: `expense-${expense.id}`,
        type: 'expense_high',
        title: 'Gasto Elevado',
        description: `${expense.type}: $${Number(expense.amount).toLocaleString()} (promedio: $${avgExpense.toLocaleString()})`,
        severity: 'warning',
        link: '/gastos',
        createdAt: expense.date
      })
    }

    const products = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        recipeItems: {
          where: { deletedAt: null },
          include: { supply: true }
        }
      }
    })

    for (const product of products) {
      if (product.recipeItems.length === 0) {
        alerts.push({
          id: `recipe-${product.id}`,
          type: 'low_margin',
          title: 'Sin Receta',
          description: `${product.name}: no tiene una receta definida`,
          severity: 'warning',
          createdAt: new Date(),
        })
        continue
      }

      const profitMargin = Number(product.profitMargin) || 30
      if (profitMargin < 20) {
        alerts.push({
          id: `margin-${product.id}`,
          type: 'low_margin',
          title: 'Margen Bajo',
          description: `${product.name}: ${profitMargin}% configurado`,
          severity: 'warning',
          link: '/rentabilidad',
          createdAt: today
        })
      }
    }

    alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return {
      alerts,
      unreadCount: alerts.length,
      lowStockCount: supplies.filter(s => Number(s.currentStock) < Number(s.minStock)).length,
      highExpenseCount: recentExpenses.length
    }
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return { alerts: [], unreadCount: 0, lowStockCount: 0, highExpenseCount: 0 }
  }
}
