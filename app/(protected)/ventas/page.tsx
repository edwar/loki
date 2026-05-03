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
  const [products, customers, sales] = await Promise.all([
    getActiveProducts(),
    getCustomers(),
    getSales()
  ])

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Ventas</h1>
          <p className="text-muted-foreground font-medium mt-1">Registra y gestiona las transacciones de tu negocio en tiempo real.</p>
        </div>
      </div>

      {/* Main Grid: Form and History */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5">
          {products.length === 0 ? (
            <Card variant="glass" className="py-12">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-accent/50 flex items-center justify-center mx-auto">
                  <ShoppingBag size={32} className="text-muted-foreground opacity-50" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold">No hay productos disponibles</p>
                  <p className="text-sm text-muted-foreground">Crea productos en el catálogo primero.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <NewSaleForm products={products} customers={customers} />
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <History size={20} className="text-primary" />
                </div>
                <CardTitle>Historial de Ventas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                        No hay ventas registradas hoy.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-bold text-xs uppercase tracking-tighter">
                          {formatDate(sale.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {sale.customer?.name || (
                            <span className="text-muted-foreground/40 italic">Consumidor Final</span>
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatCurrency(Number(sale.totalAmount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={deleteSale.bind(null, sale.id)}>
                            <Button type="submit" variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500">
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