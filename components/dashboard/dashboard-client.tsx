'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Package, ShoppingBag, TrendingUp, Receipt, AlertTriangle,
  ArrowUpRight, Plus, Calendar, Users, BarChart3, RotateCcw, DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SalesChart } from './sales-chart'
import { ExpensesChart } from './expenses-chart'
import { RecentActivityCard } from './recent-activity-card'
import { Skeleton } from '@/components/ui/skeleton'

const RANGES = [
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 90 días', value: '90d' },
  { label: 'Este año', value: 'year' },
  { label: 'Todo el tiempo', value: 'all' },
]

const rangeLabels: Record<string, string> = {
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  '90d': 'últimos 90 días',
  'year': 'este año',
  'all': 'histórico',
}

function fetchDashboardData(range: string) {
  return fetch(`/api/dashboard?range=${range}`).then((res) => {
    if (!res.ok) throw new Error('Error al cargar datos')
    return res.json()
  })
}

function StatCard({ title, value, subtitle, change, index, icon: Icon, color }: {
  title: string; value: string; subtitle?: string; change?: number; index: number; icon: any; color: string
}) {
  return (
    <Card className={cn(
      'group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 animate-fade-in rounded-lg',
      `stagger-${index}`
    )}>
      <div className={cn('absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20', color)} />
      <CardContent className="p-2">
        <div className="flex justify-between items-start mb-3">
          <div className={cn('p-2 rounded-lg bg-background/50 border border-border/50 group-hover:scale-110 transition-transform duration-500', color.replace('bg-', 'text-'))}>
            <Icon size={18} />
          </div>
          {change !== undefined && change !== 0 && (
            <div className={cn(
              'flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg',
              change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            )}>
              {change >= 0 ? <ArrowUpRight size={10} /> : <ArrowUpRight size={10} className="rotate-90" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight font-display">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardClient({ initialData }: { initialData?: any }) {
  const [range, setRange] = useState('30d')

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => fetchDashboardData(range),
    initialData: range === '30d' ? initialData : undefined,
    staleTime: 30 * 1000,
  })

  if (isLoading && !data) {
    return <DashboardSkeleton />
  }

  if (!data) return null

  const { stats, lowStock, recentSales, recentExpenses, historicalData, advancedMetrics } = data

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Resumen Ejecutivo</h1>
          <p className="text-muted-foreground font-medium mt-1">Sincronización en tiempo real de tu operación.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/50 border border-border/50 text-muted-foreground">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Periodo</span>
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-10 w-full md:w-[180px] rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm font-medium">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-primary/10">
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="rounded-lg">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/ventas" className="w-full">
            <Button className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all">
              <Plus size={20} className="mr-2" />
              Nueva Venta
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title={`Ventas (${rangeLabels[range]})`} value={formatCurrency(stats.periodSalesTotal)}
          subtitle={`${stats.salesTotal > 0 ? formatCurrency(stats.salesTotal) + ' hoy' : 'Sin ventas hoy'}`}
          change={stats.salesChange} icon={TrendingUp} color="bg-primary" index={1} />
        <StatCard title={`Inversión (${rangeLabels[range]})`} value={formatCurrency(stats.periodExpensesTotal)}
          subtitle={`${stats.expensesTotal > 0 ? formatCurrency(stats.expensesTotal) + ' hoy' : 'Sin gastos hoy'}`}
          icon={Receipt} color="bg-rose-500" index={2} />
        <StatCard title="Ticket Promedio" value={formatCurrency(advancedMetrics.ticketPromedio)}
          subtitle={advancedMetrics.ticketPromedioAnterior > 0 ? 'vs ' + formatCurrency(advancedMetrics.ticketPromedioAnterior) : ''}
          change={advancedMetrics.ticketCambio} icon={DollarSign} color="bg-emerald-500" index={3} />
        <StatCard title="Rotación Inventario" value={advancedMetrics.rotacionInventario.tasaRotacion.toFixed(1) + 'x'}
          subtitle={`${advancedMetrics.rotacionInventario.diasPromedioStock.toFixed(0)} días promedio`}
          icon={RotateCcw} color="bg-violet-500" index={4} />
        <StatCard title="Stock Crítico" value={lowStock.length.toString()} subtitle="Insumos bajo el mínimo"
          icon={AlertTriangle} color="bg-amber-500" index={5} />
        <StatCard title="Catálogo Activo" value={stats.productsCount.toString()} subtitle="Productos en vitrina"
          icon={ShoppingBag} color="bg-indigo-500" index={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalesChart data={historicalData.salesByDay} />
          <ExpensesChart data={historicalData.expensesByCategory} />
        </div>

        <Card className="lg:col-span-4 rounded-lg">
          <CardHeader className="p-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {advancedMetrics.productosMasVendidos.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Sin ventas en este período</p>
            ) : (
              <div className="space-y-2">
                {advancedMetrics.productosMasVendidos.map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[120px]">{product.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-lg">
          <CardHeader className="p-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Mejores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {advancedMetrics.clientesTop.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Sin clientes en este período</p>
            ) : (
              <div className="space-y-2">
                {advancedMetrics.clientesTop.map((client: any, index: number) => (
                  <div key={client.customerId || 'general'} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[120px]">{client.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatCurrency(client.totalPurchases)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 rounded-lg">
          <CardHeader className="p-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Comparación con Período Anterior
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Ventas', value: advancedMetrics.comparacionPeriodo.ventasActual, change: advancedMetrics.comparacionPeriodo.cambioVentas, reverse: false },
                { label: 'Gastos', value: advancedMetrics.comparacionPeriodo.gastosActual, change: advancedMetrics.comparacionPeriodo.cambioGastos, reverse: true },
                { label: 'Utilidad', value: advancedMetrics.comparacionPeriodo.utilidadActual, change: advancedMetrics.comparacionPeriodo.cambioUtilidad, reverse: false },
                { label: 'Inventario', value: advancedMetrics.rotacionInventario.valorInventario, subtitle: `${advancedMetrics.rotacionInventario.diasPromedioStock.toFixed(0)} días` },
              ].map((item: any, i) => (
                <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-lg font-bold">{formatCurrency(item.value)}</p>
                  {item.change !== undefined && (
                    <p className={cn('text-[10px] font-bold mt-1', 
                      item.reverse ? (item.change <= 0 ? 'text-emerald-500' : 'text-rose-500') : (item.change >= 0 ? 'text-emerald-500' : 'text-rose-500')
                    )}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                    </p>
                  )}
                  {item.subtitle && <p className="text-[10px] text-muted-foreground mt-1">{item.subtitle}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RecentActivityCard recentSales={recentSales} recentExpenses={recentExpenses} />

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-lg border-primary/20 bg-primary/3 p-2 space-y-2">
            <CardHeader className="flex flex-row items-center justify-between p-2">
              <CardTitle className="font-bold text-sm flex items-center gap-2">
                <ArrowUpRight className="text-primary" size={20} />
                Dato del día
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed">
              Tus ventas han crecido un <span className="text-primary font-bold">{stats.salesChange.toFixed(1)}%</span> vs ayer.
            </CardContent>
          </Card>

          {lowStock.length > 0 && (
            <Card className="rounded-lg border-amber-500/20 bg-amber-500/3 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <AlertTriangle size={60} className="text-amber-500" />
              </div>
              <CardContent className="p-2 space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Reposición</h3>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Acción Requerida</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {lowStock.map((supply: any) => (
                    <div key={supply.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-amber-500/10 group/item hover:bg-background transition-colors">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-muted-foreground" />
                        <span className="text-sm font-bold">{supply.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                        {supply.currentStock} {supply.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/insumos" className="block">
                  <Button variant="destructive" size="sm" className="w-full font-bold">
                    Gestionar Inventario
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
