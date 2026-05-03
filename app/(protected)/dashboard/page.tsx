import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ShoppingBag, TrendingUp, Receipt, AlertTriangle, DollarSign, ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [suppliesCount, productsCount, todaySales, todayExpenses, yesterdaySales] = await Promise.all([
    prisma.supply.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.dailySale.findMany({ where: { deletedAt: null, createdAt: { gte: today } } }),
    prisma.indirectCost.findMany({ where: { deletedAt: null, date: { gte: today } } }),
    prisma.dailySale.findMany({ 
      where: { 
        deletedAt: null,
        createdAt: { 
          gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          lt: today 
        } 
      } 
    })
  ])

  const salesTotal = todaySales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const expensesTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  
  const salesChange = yesterdayTotal > 0 ? ((salesTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0

  return { suppliesCount, productsCount, salesTotal, expensesTotal, salesChange }
}

async function getRecentSales() {
  return prisma.dailySale.findMany({
    where: { deletedAt: null },
    include: { saleItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
}

async function getRecentExpenses() {
  return prisma.indirectCost.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    take: 5
  })
}

function StatCard({ title, value, subtitle, change, index }: { 
  title: string
  value: string
  subtitle?: string
  change?: number
  index: number
}) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-[24px] p-6 animate-fade-in', `stagger-${index}`)}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-4xl font-bold text-black dark:text-white tracking-tight">{value}</div>
      {subtitle && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">{subtitle}</span>
          {change !== undefined && change !== 0 && (
            <span className={cn(
              'flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
              change >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
            )}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function SaleRow({ sale }: { sale: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
          <DollarSign size={18} className="text-gray-600 dark:text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-black dark:text-white">{sale.saleItems.map((si: any) => si.product.name).join(', ')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(sale.createdAt)}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-black dark:text-white">{formatCurrency(Number(sale.totalAmount))}</span>
    </div>
  )
}

function ExpenseRow({ expense }: { expense: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
          <Receipt size={18} className="text-gray-600 dark:text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-black dark:text-white">{expense.type}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(expense.date)}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-black dark:text-white">{formatCurrency(Number(expense.amount))}</span>
    </div>
  )
}

export default async function DashboardPage() {
  const [stats, recentSales, recentExpenses] = await Promise.all([
    getStats(),
    getRecentSales(),
    getRecentExpenses()
  ])

  const lowStock = await prisma.supply.findMany({
    where: { deletedAt: null }
  }).then(supplies => supplies.filter(s => Number(s.currentStock) < Number(s.minStock)).slice(0, 5))

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Buenos días</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Aquí está el resumen de tu negocio</p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard 
          title="Ventas Hoy" 
          value={formatCurrency(stats.salesTotal)} 
          subtitle={`${recentSales.length} transacciones`}
          change={stats.salesChange}
          index={1}
        />
        <StatCard 
          title="Gastos Hoy" 
          value={formatCurrency(stats.expensesTotal)}
          subtitle="Gastos indirectos"
          index={2}
        />
        <StatCard 
          title="Insumos" 
          value={stats.suppliesCount.toString()}
          subtitle="En inventario"
          index={3}
        />
        <StatCard 
          title="Productos" 
          value={stats.productsCount.toString()}
          subtitle="Disponibles"
          index={4}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sales Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Ventas Recientes</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500">Últimas transacciones</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <TrendingUp size={18} className="text-gray-500 dark:text-slate-400" />
            </div>
          </div>
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-slate-500">No hay ventas registradas aún</p>
            </div>
          ) : (
            <div>
              {recentSales.map((sale: any) => (
                <SaleRow key={sale.id} sale={sale} />
              ))}
            </div>
          )}
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Gastos Recientes</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500">Últimos gastos registrados</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <Receipt size={18} className="text-gray-500 dark:text-slate-400" />
            </div>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-slate-500">No hay gastos registrados aún</p>
            </div>
          ) : (
            <div>
              {recentExpenses.map((expense: any) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 border border-amber-200 dark:border-amber-800 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">Alerta de Stock Bajo</h2>
              <p className="text-sm text-amber-600">{lowStock.length} productos necesitan reposición</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {lowStock.map((supply: any) => (
              <div key={supply.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-black">{supply.name}</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                  {Number(supply.currentStock)} {supply.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}