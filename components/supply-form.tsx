'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { X, Package } from 'lucide-react'
import { UNIDADES } from '@/lib/constants'

interface SupplyFormProps {
  onSuccess?: () => void
  onClose?: () => void
}

export function SupplyForm({ onSuccess, onClose }: SupplyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('unidad')
  const [minStock, setMinStock] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: category || null,
          unit,
          minStock
        })
      })

      if (!response.ok) throw new Error('Error al guardar')

      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el insumo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">Nuevo Insumo</h2>
          <p className="text-sm text-muted-foreground mt-1">Registra un insumo para el inventario</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Harina de trigo"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Harinas, Lácteos, etc."
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unidad</label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIDADES.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock Mínimo</label>
          <NumericInput value={minStock} onChange={setMinStock} />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-12 rounded-lg">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !name}
          className="flex-1 h-12 font-semibold rounded-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">Guardando...</span>
          ) : (
            <span className="flex items-center gap-2"><Package className="w-4 h-4" />Crear Insumo</span>
          )}
        </Button>
      </div>
    </form>
  )
}