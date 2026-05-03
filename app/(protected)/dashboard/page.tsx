import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ShoppingBag, TrendingUp, Receipt, AlertTriangle, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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

function StatCard({ title, value, subtitle, icon: IconComponent, color, change, changeLabel }: { 
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color: string
  change?: number
  changeLabel?: string
}) {
  return (
    <Card className="card-hover relative overflow-hidden group">
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-20', color.replace('bg-', 'bg-opacity-100 bg-'))} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{title}</CardTitle>
        <div className={cn('p-2.5 rounded-xl', color)}>
          {IconComponent}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{value}</div>
        {subtitle && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>
            {change !== undefined && (
              <span className={cn('flex items-center text-xs font-medium', change >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {change >= 0 ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-[var(--muted-foreground)]" />
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Bienvenido</h1>
        <p className="text-[var(--muted-foreground)]">Aquí está el resumen de tu negocio hoy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatCard 
            title="Ventas Hoy" 
            value={formatCurrency(stats.salesTotal)} 
            subtitle={`${recentSales.length} transacciones`}
            change={stats.salesChange}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatCard 
            title="Gastos Hoy" 
            value={formatCurrency(stats.expensesTotal)}
            subtitle="Gastos indirectos"
            icon={<Receipt className="w-5 h-5 text-rose-600" />}
            color="bg-rose-100 dark:bg-rose-900/30"
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatCard 
            title="Insumos" 
            value={stats.suppliesCount.toString()}
            subtitle="Productos en inventario"
            icon={<Package className="w-5 h-5 text-amber-600" />}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatCard 
            title="Productos" 
            value={stats.productsCount.toString()}
            subtitle="Productos disponibles"
            icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Ventas Recientes</CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">Últimas transacciones</p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <EmptyState icon={TrendingUp} message="No hay ventas registradas aún" />
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--accent)] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {sale.saleItems.map(si => si.product.name).join(', ')}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatDate(sale.createdAt)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(Number(sale.totalAmount))}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Gastos Recientes</CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">Últimos gastos registrados</p>
            </div>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <EmptyState icon={Receipt} message="No hay gastos registrados aún" />
            ) : (
              <div className="space-y-2">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--accent)] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{expense.type}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-rose-600">{formatCurrency(Number(expense.amount))}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 animate-fade-in">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-amber-800 dark:text-amber-200">Alerta de Stock Bajo</CardTitle>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/70">{lowStock.length} productos necesitan reposición</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((supply) => (
                <div key={supply.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-amber-200/30">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">{supply.name}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                    {Number(supply.currentStock)} {supply.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}