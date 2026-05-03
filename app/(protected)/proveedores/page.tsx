import { getSuppliers, deleteSupplier } from '@/lib/actions/suppliers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createSupplier } from '@/lib/actions/suppliers'
import { Trash2, Phone, Mail, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

function SupplierForm() {
  return (
    <form action={createSupplier} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input name="name" required className="mt-1" placeholder="Nombre del proveedor" />
        </div>
        <div>
          <label className="text-sm font-medium">Teléfono</label>
          <Input name="phone" className="mt-1" placeholder="3001234567" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" className="mt-1" placeholder="proveedor@email.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Dirección</label>
          <Input name="address" className="mt-1" placeholder="Dirección" />
        </div>
      </div>
      <Button type="submit">Crear Proveedor</Button>
    </form>
  )
}

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Proveedores</h1>
        <p className="text-zinc-500">Gestiona tus proveedores</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-500">
                    No hay proveedores registrados
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone size={14} className="text-zinc-400" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail size={14} className="text-zinc-400" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin size={14} className="text-zinc-400" />
                            {supplier.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier._count.purchases}</TableCell>
                    <TableCell>
                      <form action={deleteSupplier.bind(null, supplier.id)}>
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