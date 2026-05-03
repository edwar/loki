import { getActiveProducts, getSales } from '@/lib/actions/sales'
import { getCustomers } from '@/lib/actions/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag } from 'lucide-react'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Ventas</h1>
        <p className="text-zinc-500">Registra ventas y controla el inventario</p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay productos disponibles.</p>
            <p className="text-sm">Crea productos en la sección de Productos primero.</p>
          </CardContent>
        </Card>
      ) : (
        <NewSaleForm products={products} customers={customers} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500">
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customer?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sale.saleItems.map(si => `${si.quantity}x ${si.product.name}`).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(sale.totalAmount))}</TableCell>
                    <TableCell>
                      <form action={deleteSale.bind(null, sale.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-red-600">
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
  )
}