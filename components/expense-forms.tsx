'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createExpense, updateExpense } from '@/lib/actions/expenses'

const EXPENSE_TYPES = [
  'Arriendo',
  'Servicios Públicos',
  'Sueldos',
  'Marketing',
  'Transporte',
  'Mantenimiento',
  'Otros'
]

export function ExpenseForm({ 
  expense, 
  onSuccess 
}: { 
  expense?: any
  onSuccess?: () => void
}) {
  const [amount, setAmount] = useState(expense?.amount ?? 0)
  
  const action = expense ? updateExpense.bind(null, expense.id) : createExpense

  return (
    <form 
      action={async (formData) => {
        await action(formData)
        onSuccess?.()
      }} 
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo de Gasto</label>
          <Select name="type" defaultValue={expense?.type ?? 'Otros'}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monto</label>
          <NumericInput value={amount} onChange={setAmount} className="h-12" />
          <input type="hidden" name="amount" value={amount} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha</label>
          <Input 
            name="date" 
            type="date" 
            defaultValue={expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
            className="h-12" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción (Opcional)</label>
          <Input 
            name="description" 
            defaultValue={expense?.description ?? ''} 
            placeholder="Ej: Pago de internet mes de mayo" 
            className="h-12" 
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-10 h-12 rounded-lg shadow-lg shadow-primary/20">
          {expense ? 'Actualizar Gasto' : 'Registrar Gasto'}
        </Button>
      </div>
    </form>
  )
}
