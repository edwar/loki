'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, User, Phone, Mail, MapPin } from 'lucide-react'
import { deleteCustomer } from '@/lib/actions/customers'
import { Dialog } from '@/components/ui/dialog'
import { CustomerForm } from './customer-forms'

export function CustomerTable({ customers }: { customers: any[] }) {
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Cliente</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Contacto</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Ventas</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-accent/50 flex items-center justify-center opacity-50">
                    <User size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium">No hay clientes registrados</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-accent/30 group transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{customer.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin size={12} />
                      {customer.address || 'Sin dirección'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-muted-foreground" />
                      {customer.email || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone size={14} className="text-primary" />
                      {customer.phone || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-primary">{customer._count.sales}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compras</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => setEditingCustomer(customer)}
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <form action={deleteCustomer.bind(null, customer.id)}>
                      <Button type="submit" variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog 
        isOpen={!!editingCustomer} 
        onClose={() => setEditingCustomer(null)}
        title="Editar Información de Cliente"
      >
        <div className="mt-4">
          <CustomerForm 
            customer={editingCustomer} 
            onSuccess={() => setEditingCustomer(null)} 
          />
        </div>
      </Dialog>
    </>
  )
}
