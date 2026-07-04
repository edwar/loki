'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { producePreparation } from '@/lib/actions/preparations'
import { formatCurrency } from '@/lib/utils'
import { sileo as toast } from 'sileo'

interface Supply {
  id: string
  name: string
  unit: string
  currentStock: number
  purchasePrice: number
  unitsPerPack: number
}

interface Ingredient {
  id: string
  quantity: number
  unit: string
  supply?: { id: string; name: string; unit: string; currentStock: number; purchasePrice: number } | null
  subPreparation?: { id: string; name: string; unit: string; currentStock: number; costPrice: number } | null
}

interface Preparation {
  id: string
  name: string
  unit: string
  yield: number
  costPrice: number
  ingredients: Ingredient[]
}

interface PreparationProductionModalProps {
  isOpen: boolean
  onClose: () => void
  preparationId: string
  preparations: Preparation[]
  supplies: Supply[]
}

export function PreparationProductionModal({
  isOpen,
  onClose,
  preparationId,
  preparations,
}: PreparationProductionModalProps) {
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState(1)
  const [actualQuantity, setActualQuantity] = useState(0)

  const preparation = preparations.find((p) => p.id === preparationId)

  const handleBatchesChange = (val: number) => {
    setBatches(val)
    if (preparation) {
      setActualQuantity(preparation.yield * val)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preparation || batches <= 0 || actualQuantity <= 0) return

    setLoading(true)
    try {
      await producePreparation(preparationId, batches, actualQuantity)
      toast.success({ title: 'Producción registrada correctamente' })
      onClose()
      setBatches(1)
      setActualQuantity(0)
    } catch (error: any) {
      toast.error({ title: error.message || 'Error al registrar la producción' })
    } finally {
      setLoading(false)
    }
  }

  const getInsufficientItems = () => {
    if (!preparation) return []
    return preparation.ingredients.filter((ing) => {
      if (ing.supply) {
        return ing.supply.currentStock < ing.quantity * batches
      }
      if (ing.subPreparation) {
        return ing.subPreparation.currentStock < ing.quantity * batches
      }
      return false
    })
  }

  const insuficientes = getInsufficientItems()
  const canProduce = preparation && insuficientes.length === 0 && batches > 0

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Producir Preparación"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {preparation && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <p className="text-sm font-bold">{preparation.name}</p>
              <p className="text-xs text-muted-foreground">
                Costo unitario: {formatCurrency(preparation.costPrice)} / {preparation.unit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Número de Lotes</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={batches}
                onChange={(e) => handleBatchesChange(parseInt(e.target.value) || 0)}
                className="h-12 rounded-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cantidad Obtenida</label>
              <NumericInput
                value={actualQuantity}
                onChange={setActualQuantity}
                className="h-12 rounded-lg font-bold text-primary"
              />
              {preparation && (
                <p className="text-[10px] text-muted-foreground italic">
                  Esperado: {preparation.yield * batches} {preparation.unit}
                </p>
              )}
            </div>
          </div>

          {preparation && preparation.ingredients.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-accent/5 overflow-hidden">
              <div className="bg-accent/10 px-4 py-2 border-b border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest">Ingredientes Requeridos</p>
              </div>
              <div className="p-4 space-y-3">
                {preparation.ingredients.map((ing) => {
                  const required = ing.quantity * batches
                  const isOk = ing.supply
                    ? ing.supply.currentStock >= required
                    : ing.subPreparation
                      ? ing.subPreparation.currentStock >= required
                      : false
                  const name = ing.supply?.name || ing.subPreparation?.name || 'Desconocido'
                  return (
                    <div key={ing.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isOk ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <AlertCircle size={14} className="text-rose-500" />
                        )}
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">
                          {required} {ing.unit}
                        </p>
                        <p className={`text-[10px] ${isOk ? 'text-muted-foreground' : 'text-rose-500 font-bold'}`}>
                          Stock: {ing.supply?.currentStock ?? ing.subPreparation?.currentStock ?? 0}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {preparation && preparation.ingredients.length === 0 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5" size={18} />
              <p className="text-xs text-amber-700 font-medium">
                Esta preparación no tiene ingredientes definidos. Debes agregar insumos antes de producir.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            className="flex-1 h-12 rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canProduce || loading || (preparation?.ingredients?.length ?? 0) === 0}
            className="flex-1 h-12 rounded-lg font-bold shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Confirmar Producción</>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
