'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Trash2, Edit2, Package } from 'lucide-react'
import { deleteSupply } from '@/lib/actions/supplies'
import { Dialog } from '@/components/ui/dialog'
import { SupplyForm } from './supply-forms'
import { ConfirmationModal } from './ui/confirmation-modal'

export function SupplyTable({
  supplies,
  suppliers
}: {
  supplies: any[]
  suppliers: any[]
}) {
  const [editingSupply, setEditingSupply] = useState<any>(null)
  const [deletingSupply, setDeletingSupply] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingSupply) return
    setIsDeleting(true)
    try {
      await deleteSupply(deletingSupply.id)
      setDeletingSupply(null)
    } catch (error) {
      console.error("Error deleting supply:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Nombre</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Categoría</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Stock</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Precio</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Valor Total</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center opacity-50">
                    <Package size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium">No hay insumos registrados</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            supplies.map((supply) => {
              const isLowStock = Number(supply.currentStock) < Number(supply.minStock)
              return (
                <TableRow key={supply.id} className="hover:bg-accent/30 group transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isLowStock ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      )} />
                      <div className="font-bold">{supply.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-accent/50 text-muted-foreground rounded-lg text-xs font-bold uppercase tracking-tighter">
                      {supply.category || 'Sin categoría'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-bold text-lg",
                        isLowStock ? "text-amber-600" : "text-foreground"
                      )}>
                        {Number(supply.currentStock)}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        {supply.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {formatCurrency(Number(supply.purchasePrice))}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(Number(supply.currentStock) * Number(supply.purchasePrice))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => setEditingSupply(supply)}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                      >
                        <Edit2 className='w-4 h-4 group-hover:text-primary' />
                      </Button>

                      <Button
                        onClick={() => setDeletingSupply(supply)}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
                      >
                        <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      <Dialog
        isOpen={!!editingSupply}
        onClose={() => setEditingSupply(null)}
        title="Editar Insumo"
      >
        <div className="mt-4">
          <SupplyForm
            supply={editingSupply}
            suppliers={suppliers}
            onSuccess={() => setEditingSupply(null)}
          />
        </div>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingSupply}
        onClose={() => setDeletingSupply(null)}
        onConfirm={handleDelete}
        title="Eliminar Insumo"
        description={`¿Estás seguro de que deseas eliminar "${deletingSupply?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Insumo"
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
