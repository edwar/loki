'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import { X } from 'lucide-react'

const EXPENSE_TYPES = [
  'Arriendo',
  'Servicios Públicos',
  'Sueldos',
  'Marketing',
  'Transporte',
  'Mantenimiento',
  'Otros'
]

interface ExpenseFormModalProps {
  expense?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function ExpenseFormModal({ expense, onSuccess, onClose }: ExpenseFormModalProps) {
  const [amount, setAmount] = useState(expense?.amount ?? 0)
  const [date, setDate] = useState(
    expense?.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState(expense?.type ?? 'Otros')
  const [description, setDescription] = useState(expense?.description ?? '')

  const isEditing = !!expense

  const submitHandler = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        await updateExpense(expense.id, formData)
      } else {
        await createExpense(formData)
      }
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos del gasto' : 'Registra un nuevo costo operativo'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form action={submitHandler} className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo de Gasto</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-lg">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {EXPENSE_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="type" value={type} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monto</label>
            <NumericInput value={amount} onChange={setAmount} className="h-12" />
            <input type="hidden" name="amount" value={amount} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha</label>
            <DatePicker
              name="date"
              value={date}
              onChange={setDate}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción (Opcional)</label>
            <Input
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de internet mes de mayo"
              className="h-12"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1 h-12 rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || amount <= 0}
            className="flex-1 h-12 font-semibold rounded-lg"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Registrar Gasto'}
          </Button>
        </div>
      </form>
    </div>
  )
}