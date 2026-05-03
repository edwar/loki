import { getCustomers, deleteCustomer } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createCustomer } from '@/lib/actions/customers'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Phone, Mail, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

function CustomerForm() {
  return (
    <form action={createCustomer} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input name="name" required className="mt-1" placeholder="Nombre del cliente" />
        </div>
        <div>
          <label className="text-sm font-medium">Teléfono</label>
          <Input name="phone" className="mt-1" placeholder="3001234567" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" className="mt-1" placeholder="cliente@email.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Dirección</label>
          <Input name="address" className="mt-1" placeholder="Dirección" />
        </div>
      </div>
      <Button type="submit">Crear Cliente</Button>
    </form>
  )
}

export default async function ClientesPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Clientes</h1>
        <p className="text-gray-500 dark:text-slate-400">Gestiona tu base de clientes</p>
        <p className="text-zinc-500">Gestiona tus clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500">
                    No hay clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone size={14} className="text-zinc-400" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail size={14} className="text-zinc-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(Number(customer.totalPurchases))}</TableCell>
                    <TableCell>{customer._count.sales}</TableCell>
                    <TableCell>
                      <form action={deleteCustomer.bind(null, customer.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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