import { getSupplies, deleteSupply } from '@/lib/actions/supplies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Trash2, AlertTriangle, Package, Plus, Search } from 'lucide-react'
import { createSupply, updateSupply } from '@/lib/actions/supplies'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function SupplyForm({ 
  supply, 
  suppliers 
}: { 
  supply?: { id: string; name: string; sku: string | null; category: string | null; unit: string; currentStock: number; minStock: number; purchasePrice: number; supplierId: string | null } | null
  suppliers: { id: string; name: string }[]
}) {
  const action = supply ? updateSupply.bind(null, supply.id) : createSupply
  
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Nombre del insumo</label>
          <Input name="name" defaultValue={supply?.name} required placeholder="Harina, carne, aceite..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">SKU / Código</label>
          <Input name="sku" defaultValue={supply?.sku ?? ''} placeholder="SKU-001" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Categoría</label>
          <Input name="category" defaultValue={supply?.category ?? ''} placeholder="Harinas, carnes, especias..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Unidad de medida</label>
          <Input name="unit" defaultValue={supply?.unit ?? 'unidad'} placeholder="kg, unidad, litro" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Stock actual</label>
          <Input name="currentStock" type="number" step="0.01" defaultValue={supply?.currentStock ?? 0} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Stock mínimo (alerta)</label>
          <Input name="minStock" type="number" step="0.01" defaultValue={supply?.minStock ?? 0} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Precio de compra</label>
          <Input name="purchasePrice" type="number" step="100" defaultValue={supply?.purchasePrice ?? 0} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">Proveedor</label>
          <Select name="supplierId" defaultValue={supply?.supplierId ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin proveedor</SelectItem>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="px-6">
          <Plus size={18} className="mr-2" />
          {supply ? 'Actualizar' : 'Agregar Insumo'}
        </Button>
        {supply && (
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

export default async function InsumosPage() {
  const [supplies, suppliers] = await Promise.all([
    getSupplies(),
    prisma.supplier.findMany({ where: { deletedAt: null }, select: { id: true, name: true } })
  ])

  const totalValue = supplies.reduce((sum, s) => sum + Number(s.currentStock) * Number(s.purchasePrice), 0)
  const lowStockCount = supplies.filter(s => Number(s.currentStock) < Number(s.minStock)).length

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Insumos</h1>
        <p className="text-gray-500 dark:text-slate-400">Gestiona el inventario de tu negocio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Total de insumos</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{supplies.length}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Valor en inventario</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn("card-hover", lowStockCount > 0 && "border-amber-300")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Stock bajo</p>
                <p className={cn("text-2xl font-bold", lowStockCount > 0 ? "text-amber-600" : "text-[var(--foreground)]")}>{lowStockCount}</p>
              </div>
              <div className={cn("p-3 rounded-xl", lowStockCount > 0 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-emerald-100 dark:bg-emerald-900/30")}>
                <AlertTriangle className={cn("w-6 h-6", lowStockCount > 0 ? "text-amber-600" : "text-emerald-600")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Nuevo Insumo</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplyForm suppliers={suppliers} />
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventario</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">{supplies.length} productos registrados</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold">Categoría</TableHead>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold">Precio</TableHead>
                <TableHead className="font-semibold">Valor Total</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-[var(--muted-foreground)] mb-3 opacity-50" />
                      <p className="text-[var(--muted-foreground)]">No hay insumos registrados</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Agrega tu primer insumo arriba</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                supplies.map((supply) => {
                  const isLowStock = Number(supply.currentStock) < Number(supply.minStock)
                  return (
                    <TableRow key={supply.id} className="hover:bg-[var(--accent)]/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isLowStock && (
                            <AlertTriangle size={16} className="text-amber-500" />
                          )}
                          {supply.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-[var(--muted)] rounded-full text-xs font-medium">
                          {supply.category || 'Sin categoría'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-semibold",
                          isLowStock ? "text-amber-600" : "text-[var(--foreground)]"
                        )}>
                          {Number(supply.currentStock)} {supply.unit}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(supply.purchasePrice))}</TableCell>
                      <TableCell className="text-[var(--muted-foreground)]">
                        {formatCurrency(Number(supply.currentStock) * Number(supply.purchasePrice))}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <form action={deleteSupply.bind(null, supply.id)}>
                            <Button type="submit" variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                              <Trash2 size={18} />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}