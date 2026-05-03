import { getActiveProducts, getSales } from '@/lib/actions/sales'
import { getCustomers } from '@/lib/actions/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag, History, Plus } from 'lucide-react'
import { deleteSale } from '@/lib/actions/sales'
import { NewSaleForm } from '@/components/sales-form'

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const [productsRaw, customers, salesRaw] = await Promise.all([
    getActiveProducts(),
    getCustomers(),
    getSales()
  ])

  // Serialize Decimals for Client Components
  const products = productsRaw.map((p: any) => ({
    ...p,
    salePrice: Number(p.salePrice),
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

  const sales = salesRaw.map((s: any) => ({
    ...s,
    totalAmount: Number(s.totalAmount)
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display">Ventas</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">Registro de transacciones en tiempo real.</p>
        </div>
      </div>

      {/* Main Grid: Form and History */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5">
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
            <NewSaleForm products={products} customers={customers} />
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-border/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <History size={20} className="text-primary" />
                </div>
                <CardTitle className="text-xl">Historial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/5 hover:bg-accent/5 border-none">
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold pl-6">Fecha</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Cliente</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold text-right pr-6">Acción</TableHead>
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
                        <TableCell className="py-4 pl-6">
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
                        <TableCell className="py-4 text-right pr-6">
                          <form action={deleteSale.bind(null, sale.id)}>
                            <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 hover:text-rose-500">
                              <Trash2 size={16} />
                            </Button>
                          </form>
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