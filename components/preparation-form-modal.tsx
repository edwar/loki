'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPreparation, updatePreparation } from '@/lib/actions/preparations'
import { sileo as toast } from 'sileo'
import { X, FlaskConical } from 'lucide-react'

interface Supply {
  id: string
  name: string
  unit: string
  currentStock: number
  purchasePrice: number
  unitsPerPack: number
}

interface PreparationData {
  id: string
  name: string
  description: string | null
  unit: string
  yield: number
  notes: string | null
}

interface PreparationFormModalProps {
  preparation?: PreparationData | null
  supplies: Supply[]
  onSuccess?: () => void
  onClose?: () => void
}

export function PreparationFormModal({ preparation, onSuccess, onClose }: PreparationFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(preparation?.name ?? '')
  const [description, setDescription] = useState(preparation?.description ?? '')
  const [unit, setUnit] = useState(preparation?.unit ?? 'kg')
  const [yieldAmount, setYieldAmount] = useState(preparation?.yield ?? 1)
  const [notes, setNotes] = useState(preparation?.notes ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('description', description)
      formData.set('unit', unit)
      formData.set('yield', String(yieldAmount))
      formData.set('notes', notes)

      if (preparation) {
        await updatePreparation(preparation.id, formData)
        toast.success({ title: 'Preparación actualizada' })
      } else {
        await createPreparation(formData)
        toast.success({ title: 'Preparación creada' })
      }

      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{preparation ? 'Editar Preparación' : 'Nueva Preparación'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {preparation ? 'Actualiza los datos de la preparación' : 'Define una preparación intermedia para tu catálogo'}
          </p>
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
            placeholder="Ej: Mermelada de Fresa"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción de la preparación"
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unidad</label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['kg', 'g', 'L', 'mL', 'ud', 'pza', 'paq'].map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendimiento (por lote)</label>
            <NumericInput
              value={yieldAmount}
              onChange={setYieldAmount}
              min={0}
              className="h-11"
            />
            <p className="text-[10px] text-muted-foreground">Cantidad que se obtiene por lote</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notas de Preparación</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones, tips, o cualquier nota sobre cómo preparar..."
            className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
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
          {loading ? 'Guardando...' : (
            <span className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              {preparation ? 'Guardar Cambios' : 'Crear Preparación'}
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
