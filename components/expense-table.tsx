'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Trash2, Edit2, Wallet, Calendar } from 'lucide-react'
import { deleteExpense } from '@/lib/actions/expenses'
import { Dialog } from '@/components/ui/dialog'
import { ExpenseForm } from './expense-forms'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

export function ExpenseTable({ expenses }: { expenses: any[] }) {
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await deleteExpense(deletingId)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Fecha</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Tipo</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Descripción</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Monto</TableHead>
            <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center opacity-50">
                    <Wallet size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium">No hay gastos registrados</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-accent/30 group transition-colors">
                <TableCell className="py-4 font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="opacity-50" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1 bg-violet-500/10 text-violet-600 rounded-lg text-xs font-bold uppercase tracking-tighter">
                    {expense.type}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {expense.description || '-'}
                </TableCell>
                <TableCell className="font-bold text-lg text-rose-500">
                  {formatCurrency(Number(expense.amount))}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setEditingExpense(expense)}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button 
                      onClick={() => setDeletingId(expense.id)}
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Editar Gasto"
      >
        <div className="mt-4">
          <ExpenseForm
            expense={editingExpense}
            onSuccess={() => setEditingExpense(null)}
          />
        </div>
      </Dialog>

      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="¿Eliminar este gasto?"
        description="Esta acción no se puede deshacer. El registro del gasto será eliminado permanentemente."
      />
    </>
  )
}
