import { getActiveProducts, getSales } from '@/lib/actions/sales'
import { getCustomers } from '@/lib/actions/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag, History, Plus } from 'lucide-react'
import { deleteSale } from '@/lib/actions/sales'
import { SaleForm } from '@/components/sales-form'
import { DeleteSaleButton } from './delete-sale-button'
import { EditSaleModal } from './edit-sale-modal'
import { ExportButton } from '@/components/ui/export-button'

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const [productsRaw, customersRaw, salesRaw] = await Promise.all([
    getActiveProducts(),
    getCustomers(),
    getSales()
  ])

  // Serialize Decimals for Client Components
  const products = productsRaw.map((p: any) => ({
    ...p,
    salePrice: Number(p.salePrice),
    currentStock: Number(p.currentStock),
    yield: Number(p.yield) || 1,
    recipeItems: p.recipeItems?.map((ri: any) => ({
      ...ri,
      quantityRequired: Number(ri.quantityRequired),
      supply: ri.supply ? {
        ...ri.supply,
        currentStock: Number(ri.supply.currentStock),
        minStock: Number(ri.supply.minStock),
        purchasePrice: Number(ri.supply.purchasePrice)
      } : null
    })) || []
  }))

  const customers = customersRaw.map((c: any) => ({
    ...c,
    totalPurchases: Number(c.totalPurchases)
  }))

  const sales = salesRaw.map((s: any) => ({
    ...s,
    totalAmount: Number(s.totalAmount),
    customer: s.customer ? {
      ...s.customer,
      totalPurchases: Number(s.customer.totalPurchases)
    } : null,
    saleItems: s.saleItems?.map((si: any) => ({
      ...si,
      quantity: Number(si.quantity),
      unitPrice: Number(si.unitPrice),
      subtotal: Number(si.subtotal),
      product: si.product ? {
        ...si.product,
        salePrice: Number(si.product.salePrice),
        currentStock: Number(si.product.currentStock),
        yield: Number(si.product.yield) || 1
      } : null
    })) || []
  }))

  const exportData = sales.map((sale: any) => ({
    'ID Venta': sale.id,
    'Fecha': formatDate(sale.createdAt),
    'Cliente': sale.customer?.name || "Venta General",
    'Monto Total ($)': sale.totalAmount,
    'Cantidad de Productos': sale.saleItems.reduce((acc: number, item: any) => acc + item.quantity, 0),
    'Detalle': sale.saleItems.map((si: any) => `${si.quantity}x ${si.product?.name}`).join(', ')
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Control de Ventas</h1>
          <p className="text-muted-foreground font-medium mt-1">Registro de transacciones y facturación en tiempo real.</p>
        </div>
      </div>

      {/* Main Grid: Form and History */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 min-w-0">
          {products.length === 0 ? (
            <Card variant="glass" className="py-12 border-dashed border-primary/20">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 rounded-lg bg-primary/5 flex items-center justify-center mx-auto">
                  <ShoppingBag size={32} className="text-primary/30" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg">No hay productos</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Crea productos en el catálogo antes de realizar una venta.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SaleForm products={products} customers={customers} />
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-7 space-y-6 min-w-0">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between border-b border-border/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <History size={20} className="text-primary" />
                </div>
                <CardTitle className="text-xl">Historial</CardTitle>
              </div>
              {sales.length > 0 && (
                <ExportButton 
                  data={exportData} 
                  filename={`Ventas_${new Date().toISOString().split('T')[0]}`} 
                  variant="outline" 
                  className="h-9 px-4 rounded-lg text-xs" 
                />
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-accent/5 hover:bg-accent/5 border-none">
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold pl-4 sm:pl-6">Fecha</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Cliente</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold text-right pr-4 sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                            <History size={24} className="text-muted-foreground opacity-30" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">No hay ventas registradas hoy.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale: any) => (
                      <TableRow key={sale.id} className="group hover:bg-accent/5 transition-colors border-border/10">
                        <TableCell className="py-4 pl-4 sm:pl-6">
                          <p className="text-xs font-bold text-foreground">{formatDate(sale.createdAt).split(',')[0]}</p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{formatDate(sale.createdAt).split(',')[1]}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm font-bold text-foreground">
                            {sale.customer?.name || "Venta General"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-tighter">
                            {sale.customer ? "Cliente Registrado" : "Sin cliente registrado"}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-black text-primary">
                            {formatCurrency(Number(sale.totalAmount))}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-4 sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24">
                          <div className="flex justify-end gap-2">
                            <EditSaleModal sale={sale} products={products} customers={customers} />
                            <DeleteSaleButton id={sale.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}