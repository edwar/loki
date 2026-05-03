import { getSupplies } from '@/lib/actions/supplies'
import { getSuppliers } from '@/lib/actions/suppliers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import { Package, Plus, Search, TrendingUp, AlertCircle } from 'lucide-react'
import { SupplyForm } from '@/components/supply-forms'
import { SupplyTable } from '@/components/supply-table'

export const dynamic = 'force-dynamic'

export default async function InsumosPage() {
  const [suppliesRaw, suppliers] = await Promise.all([
    getSupplies(),
    getSuppliers()
  ])

  // Serialize Decimals for Client Components
  const supplies = suppliesRaw.map((s: any) => ({
    ...s,
    currentStock: Number(s.currentStock),
    minStock: Number(s.minStock),
    purchasePrice: Number(s.purchasePrice)
  }))

  const totalValue = supplies.reduce((sum: number, s: any) => sum + Number(s.currentStock) * Number(s.purchasePrice), 0)
  const lowStockCount = supplies.filter((s: any) => Number(s.currentStock) < Number(s.minStock)).length

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Gestión de Insumos</h1>
        <p className="text-muted-foreground font-medium mt-1">Controla tu inventario y niveles de stock en tiempo real.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Insumos Totales</p>
                <p className="text-3xl font-extrabold">{supplies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-gradient-to-br from-violet-500/10 to-violet-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Valor de Inventario</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "rounded-3xl border-none shadow-sm overflow-hidden relative group",
          lowStockCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
        )}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-current/10 rounded-full blur-2xl group-hover:bg-current/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                lowStockCount > 0 ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
              )}>
                {lowStockCount > 0 ? <AlertCircle className="w-6 h-6 text-white" /> : <Package className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {lowStockCount > 0 ? 'Stock Bajo' : 'Inventario Óptimo'}
                </p>
                <p className="text-3xl font-extrabold">{lowStockCount > 0 ? lowStockCount : 'OK'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Supply Dialog/Card */}
      <Card className="rounded-lg border-primary/20 bg-primary/[0.02]">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Plus size={20} className="text-white" />
            </div>
            <CardTitle>Agregar Nuevo Insumo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <SupplyForm suppliers={suppliers} />
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Detalle de Existencias</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <SupplyTable supplies={supplies} suppliers={suppliers} />
        </CardContent>
      </Card>
    </div>
  )
}