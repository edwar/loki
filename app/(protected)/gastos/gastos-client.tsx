'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Trash2, Edit2, Wallet, Calendar, Plus, TrendingDown, Receipt } from 'lucide-react'
import { deleteExpense } from '@/lib/actions/expenses'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Modal } from '@/components/ui/modal'
import { ExpenseFormModal } from '@/components/expense-form-modal'
import { EmptyState } from '@/components/ui/empty-state'

interface Expense {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
}

interface GastosClientProps {
  expenses: Expense[]
}

export function GastosClient({ expenses }: GastosClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleOpenNew = () => {
    setEditingExpense(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await deleteExpense(deletingId)
      setDeletingId(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Control de Gastos</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Registra y monitorea los costos indirectos de tu operación.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Gasto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-rose-500/10 to-rose-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Total Gastos del Mes</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-blue-500/10 to-blue-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Registros</p>
                <p className="text-3xl font-extrabold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No hay gastos registrados"
          description="Comienza registrando tus costos operativos."
          actionLabel={<><Plus size={18} /> Registrar Primer Gasto</>}
          onAction={handleOpenNew}
        />
      ) : (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl">Historial de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Fecha</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Tipo</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Descripción</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Monto</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
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
                    <TableCell className="sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(expense)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <Button
                          onClick={() => setDeletingId(expense.id)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <ExpenseFormModal
            expense={editingExpense}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="¿Eliminar este gasto?"
        description="Esta acción no se puede deshacer. El registro del gasto será eliminado permanentemente."
        confirmText="Eliminar Gasto"
        variant="danger"
      />
    </div>
  )
}