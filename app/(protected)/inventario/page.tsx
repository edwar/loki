import { getSupplies } from '@/lib/actions/supplies'
import { getSuppliers } from '@/lib/actions/suppliers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import { Package, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { SupplyTable } from '@/components/supply-table'
import { ExportButton } from '@/components/ui/export-button'
import { formatDate } from '@/lib/utils'
import { PurchaseFormWrapper } from '@/components/purchase-form-wrapper'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const [suppliesRaw, suppliers] = await Promise.all([
    getSupplies(),
    getSuppliers()
  ])

  const suppliersData = suppliers.map((s: any) => ({ id: s.id, name: s.name }))

  const supplies = suppliesRaw.map((s: any) => ({
    ...s,
    currentStock: Number(s.currentStock),
    minStock: Number(s.minStock),
    purchasePrice: Number(s.purchasePrice)
  }))

  const totalValue = supplies.reduce((sum: number, s: any) => sum + Number(s.currentStock) * Number(s.purchasePrice), 0)
  const lowStockCount = supplies.filter((s: any) => Number(s.currentStock) < Number(s.minStock)).length

  const exportData = supplies.map((supply: any) => ({
    'Nombre': supply.name,
    'Categoría': supply.category || 'N/A',
    'Unidad': supply.unit,
    'Stock Actual': supply.currentStock,
    'Stock Mínimo': supply.minStock,
    'Precio Unitario': supply.purchasePrice,
    'Valor Total': supply.currentStock * supply.purchasePrice,
    'Proveedor': supply.supplier?.name || 'N/A',
    'Última Actualización': formatDate(supply.updatedAt)
  }))

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Inventario</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Registra compras y controla tu inventario de insumos en un solo lugar.
          </p>
        </div>
        {supplies.length > 0 && (
          <ExportButton
            data={exportData}
            filename={`Inventario_${new Date().toISOString().split('T')[0]}`}
            variant="outline"
            className="h-12 px-6 rounded-lg font-bold"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Insumos Totales</p>
                <p className="text-3xl font-extrabold">{supplies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-violet-500/10 to-violet-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Valor de Inventario</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "rounded-lg border-none shadow-sm overflow-hidden relative group",
          lowStockCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
        )}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-current/10 rounded-full blur-2xl group-hover:bg-current/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg",
                lowStockCount > 0 ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
              )}>
                {lowStockCount > 0 ? <AlertCircle className="w-6 h-6 text-white" /> : <Package className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {lowStockCount > 0 ? 'Stock Bajo' : 'Inventario Óptimo'}
                </p>
                <p className="text-3xl font-extrabold">{lowStockCount > 0 ? lowStockCount : 'OK'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registro de Compra + Tabla en un solo layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario de Compra - lado izquierdo */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card className="rounded-lg border-primary/20 bg-primary/2 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Plus size={20} className="text-white" />
                  </div>
                  <div>
                    <CardTitle>Registrar Compra</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">Agrega insumos al inventario</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PurchaseFormWrapper suppliers={suppliersData} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabla de Inventario - lado derecho */}
        <div className="lg:col-span-2">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
            <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
              <CardTitle className="text-xl">Detalle de Existencias</CardTitle>
            </CardHeader>
            <CardContent className="p-0 [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent">
              <SupplyTable supplies={supplies} suppliers={suppliersData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}