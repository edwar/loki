import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Receipt,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Plus,
  BarChart3,
  Calendar
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

  const salesTotal = todaySales.reduce((sum: number, s: any) => sum + Number(s.totalAmount), 0)
  const expensesTotal = todayExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
  const yesterdayTotal = yesterdaySales.reduce((sum: number, s: any) => sum + Number(s.totalAmount), 0)

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

function StatCard({ title, value, subtitle, change, index, icon: Icon, color }: {
  title: string
  value: string
  subtitle?: string
  change?: number
  index: number
  icon: any
  color: string
}) {
  return (
    <Card className={cn(
      'group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 animate-fade-in rounded-lg',
      `stagger-${index}`
    )}>
      <div className={cn('absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20', color)} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn('p-2.5 rounded-lg bg-background/50 border border-border/50 group-hover:scale-110 transition-transform duration-500', color.replace('bg-', 'text-'))}>
            <Icon size={20} />
          </div>
          {change !== undefined && change !== 0 && (
            <div className={cn(
              'flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg',
              change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            )}>
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-90" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight font-display">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-medium pt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentItemRow({ title, date, amount, icon: Icon, isNegative }: {
  title: string
  date: Date
  amount: number
  icon: any
  isNegative?: boolean
}) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg hover:bg-accent/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-background border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <Icon size={20} className="text-primary/70" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <Calendar size={10} />
            {formatDate(date)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", isNegative ? "text-rose-500" : "text-foreground")}>
          {isNegative ? '-' : ''}{formatCurrency(amount)}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Exitosa</p>
      </div>
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
  }).then((supplies: any[]) => supplies.filter((s: any) => Number(s.currentStock) < Number(s.minStock)).slice(0, 5))

  return (
    <div className="space-y-10">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Resumen Ejecutivo</h1>
          <p className="text-muted-foreground font-medium mt-1">Sincronización en tiempo real de tu operación.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ventas">
            <Button className="rounded-lg h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all">
              <Plus size={20} className="mr-2" />
              Nueva Venta
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas de Hoy"
          value={formatCurrency(stats.salesTotal)}
          subtitle={`${recentSales.length} transacciones registradas`}
          change={stats.salesChange}
          icon={TrendingUp}
          color="bg-primary"
          index={1}
        />
        <StatCard
          title="Inversión Hoy"
          value={formatCurrency(stats.expensesTotal)}
          subtitle="Gastos indirectos totales"
          icon={Receipt}
          color="bg-rose-500"
          index={2}
        />
        <StatCard
          title="Stock Crítico"
          value={lowStock.length.toString()}
          subtitle="Insumos bajo el mínimo"
          icon={AlertTriangle}
          color="bg-amber-500"
          index={3}
        />
        <StatCard
          title="Catálogo Activo"
          value={stats.productsCount.toString()}
          subtitle="Productos en vitrina"
          icon={ShoppingBag}
          color="bg-indigo-500"
          index={4}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
            <div className="p-8 pb-0 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-display tracking-tight">Actividad Reciente</h2>
                <p className="text-sm text-muted-foreground font-medium">Ventas y egresos del día</p>
              </div>
              <Link href="/ventas">
                <Button variant="ghost" className="rounded-lg text-xs font-bold text-primary hover:bg-primary/5">
                  Ver Todo <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
            <CardContent className="p-4 pt-6 space-y-2">
              {recentSales.length === 0 && recentExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center">
                    <BarChart3 className="text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No se detectó actividad hoy aún.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentSales.map((sale: any) => (
                    <RecentItemRow
                      key={sale.id}
                      title={sale.saleItems.map((si: any) => si.product.name).join(', ')}
                      date={sale.createdAt}
                      amount={Number(sale.totalAmount)}
                      icon={DollarSign}
                    />
                  ))}
                  {recentExpenses.map((expense: any) => (
                    <RecentItemRow
                      key={expense.id}
                      title={expense.type}
                      date={expense.date}
                      amount={Number(expense.amount)}
                      icon={Receipt}
                      isNegative
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Insights */}
        <div className="lg:col-span-4 space-y-8">
          {lowStock.length > 0 && (
            <Card className="rounded-lg border-amber-500/20 bg-amber-500/[0.03] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <AlertTriangle size={120} className="text-amber-500" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Reposición</h3>
                    <p className="text-xs text-amber-600/80 font-bold uppercase tracking-wider">Acción Requerida</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {lowStock.map((supply: any) => (
                    <div key={supply.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-amber-500/10 group/item hover:bg-background transition-colors">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-muted-foreground" />
                        <span className="text-sm font-bold">{supply.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-1 bg-rose-500/10 text-rose-600 rounded-lg">
                        {Number(supply.currentStock)} {supply.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/insumos" className="block">
                  <Button variant="outline" className="w-full rounded-lg border-amber-500/30 text-amber-700 hover:bg-amber-500/10 h-11 font-bold">
                    Gestionar Inventario
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Productivity Insight */}
          <Card className="rounded-lg border-primary/20 bg-primary/[0.03] p-8 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="text-primary" size={20} />
            </div>
            <h4 className="font-bold">Dato del día</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tus ventas han crecido un <span className="text-primary font-bold">{stats.salesChange.toFixed(1)}%</span> respecto a ayer. ¡Buen trabajo!
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}