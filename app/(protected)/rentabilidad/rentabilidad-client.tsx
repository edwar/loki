'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Package,
  Percent,
  BarChart3,
  Settings,
  ChefHat
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

interface ProductProfitability {
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

interface CategoryProfitability {
  category: string
  productCount: number
  totalRevenue: number
  totalCost: number
  totalMargin: number
  avgMarginPercentage: number
}

interface ProfitabilityData {
  products: ProductProfitability[]
  categories: CategoryProfitability[]
  alerts: { productId: string; productName: string; marginPercentage: number }[]
  averageMargin: number
  totalProducts: number
  profitableProducts: number
  unprofitableProducts: number
}

interface Props {
  data: ProfitabilityData
  threshold: number
}

export function RentabilidadClient({ data, threshold }: Props) {
  const [sortBy, setSortBy] = useState<'margin' | 'name' | 'price'>('margin')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = [...new Set(data.products.map(p => p.category).filter(Boolean))] as string[]

  const filteredProducts = data.products
    .filter(p => p.hasRecipe)
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'margin') return b.marginPercentage - a.marginPercentage
      if (sortBy === 'price') return b.salePrice - a.salePrice
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Métricas de Rentabilidad</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Análisis de costos, márgenes y rentabilidad por producto.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/productos" className='w-full md:w-auto'>
            <Button className="font-bold w-full sm:w-auto">
              Gestión de Recetas
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Margen Promedio</p>
                <p className="text-3xl font-extrabold">{data.averageMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Productos Rentables</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{data.profitableProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-rose-500/10 to-rose-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Productos con Pérdida</p>
                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{data.unprofitableProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-amber-500/10 to-amber-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Con Recetas</p>
                <p className="text-3xl font-extrabold">{data.products.filter(p => p.hasRecipe).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <Card className="rounded-lg border-amber-500/20 bg-amber-500/3 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Alertas de Margen Bajo</CardTitle>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  Productos con margen menor al {threshold}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.alerts.map(alert => (
                <div key={alert.productId} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-amber-500/10">
                  <span className="text-sm font-bold">{alert.productName}</span>
                  <span className="text-xs font-extrabold px-2 py-1 bg-rose-500/10 text-rose-600 rounded-lg">
                    {alert.marginPercentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
            <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl">Rentabilidad por Producto</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'margin' | 'name' | 'price')}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Ordenar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="margin">Ordenar por margen</SelectItem>
                      <SelectItem value="price">Ordenar por precio</SelectItem>
                      <SelectItem value="name">Ordenar por nombre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Producto</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Precio Venta</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Costo</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Margen</TableHead>
                    <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">% Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <EmptyState
                          icon={ChefHat}
                          title="Sin productos con recetas"
                          description="Agrega recetas a tus productos para analizar su rentabilidad."
                          compact
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="py-4">
                          <div>
                            <p className="text-sm font-bold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category || 'Sin categoría'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className="text-sm font-medium">{formatCurrency(product.salePrice)}</span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className="text-sm font-medium text-muted-foreground">{formatCurrency(product.costPerUnit)}</span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className={cn(
                            "text-sm font-bold",
                            product.isProfitable ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {formatCurrency(product.margin)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className={cn(
                            "text-sm font-bold px-2 py-1 rounded-lg",
                            product.marginPercentage >= threshold ? "bg-emerald-500/10 text-emerald-500" :
                              product.marginPercentage >= 0 ? "bg-amber-500/10 text-amber-500" :
                                "bg-rose-500/10 text-rose-500"
                          )}>
                            {product.marginPercentage.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Category Chart */}
        <div>
          <Card className="rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 size={20} />
                Rentabilidad por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.categories.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="Sin datos de categorías"
                  description="Las categorías aparecerán aquí cuando tengas productos con recetas."
                  compact
                />
              ) : (
                <div className="space-y-4">
                  {data.categories.sort((a, b) => b.avgMarginPercentage - a.avgMarginPercentage).map(cat => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">{cat.category}</span>
                        <span className={cn(
                          "text-xs font-bold",
                          cat.avgMarginPercentage >= threshold ? "text-emerald-500" :
                            cat.avgMarginPercentage >= 0 ? "text-amber-500" :
                              "text-rose-500"
                        )}>
                          {cat.avgMarginPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            cat.avgMarginPercentage >= threshold ? "bg-emerald-500" :
                              cat.avgMarginPercentage >= 0 ? "bg-amber-500" :
                                "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(Math.max(cat.avgMarginPercentage, 0), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{cat.productCount} productos</span>
                        <span>{formatCurrency(cat.totalMargin)} margen</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="rounded-lg mt-4">
            <CardContent className="p-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Margen ≥ {threshold}% (Saludable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Margen 0-{threshold}% (Atención)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">Margen &lt; 0% (Pérdida)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* No Recipe Products */}
      {data.products.filter(p => !p.hasRecipe).length > 0 && (
        <Card className="rounded-lg border-muted">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-muted-foreground">
              Productos sin Receta ({data.products.filter(p => !p.hasRecipe).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Estos productos no tienen ingredientes asignados. Agrega una receta para calcular su rentabilidad.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.products.filter(p => !p.hasRecipe).map(product => (
                <Link key={product.id} href="/productos">
                  <span className="px-3 py-1.5 bg-muted/50 rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                    {product.name}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}