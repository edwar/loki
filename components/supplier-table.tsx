'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Building2, Phone, Mail, MapPin, ShoppingCart } from 'lucide-react'
import { deleteSupplier } from '@/lib/actions/suppliers'
import { Dialog } from '@/components/ui/dialog'
import { SupplierForm } from './supplier-forms'

import { ConfirmationModal } from './ui/confirmation-modal'

export function SupplierTable({ suppliers }: { suppliers: any[] }) {
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingSupplier) return
    setIsDeleting(true)
    try {
      await deleteSupplier(deletingSupplier.id)
      setDeletingSupplier(null)
    } catch (error) {
      console.error("Error deleting supplier:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Proveedor</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Contacto</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Compras</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center opacity-50">
                    <Building2 size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium">No hay proveedores registrados</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-accent/30 group transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{supplier.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin size={12} />
                      {supplier.address || 'Sin dirección'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-muted-foreground" />
                      {supplier.email || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone size={14} className="text-primary" />
                      {supplier.phone || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary font-extrabold shadow-sm">
                      {supplier._count.purchases}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Facturas</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setEditingSupplier(supplier)}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                    >
                      <Edit2 className='w-4 h-4 group-hover:text-primary' />
                    </Button>
                    <Button
                      onClick={() => setDeletingSupplier(supplier)}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
                    >
                      <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        title="Editar Proveedor"
      >
        <div className="mt-4">
          <SupplierForm
            supplier={editingSupplier}
            onSuccess={() => setEditingSupplier(null)}
          />
        </div>
      </Dialog>
      <ConfirmationModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Eliminar Proveedor"
        description={`¿Estás seguro de que deseas eliminar a "${deletingSupplier?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Proveedor"
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
