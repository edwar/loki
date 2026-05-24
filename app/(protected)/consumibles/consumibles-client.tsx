'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NumericInput } from '@/components/ui/numeric-input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, Plus, Trash2, AlertCircle } from 'lucide-react'
import { registerConsumableUsage } from '@/lib/actions/consumables'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState } from '@/components/ui/empty-state'

interface Supply {
  id: string
  name: string
  currentStock: number
  unit: string
  purchasePrice: number
}

interface HistoryItem {
  id: string
  supplyName: string
  quantity: number
  reason: string
  notes: string | null
  createdAt: string
}

interface ConsumiblesClientProps {
  supplies: Supply[]
  history: HistoryItem[]
}

export function ConsumiblesClient({ supplies: initialSupplies, history: initialHistory }: ConsumiblesClientProps) {
  const queryClient = useQueryClient()
  const [selectedSupplyId, setSelectedSupplyId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('sale')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: supplies } = useQuery<Supply[]>({
    queryKey: ['consumables-supplies'],
    queryFn: async () => {
      const res = await fetch('/api/consumables')
      if (!res.ok) throw new Error('Error al cargar consumibles')
      const data = await res.json()
      return data.supplies
    },
    initialData: initialSupplies,
  })

  const { data: history } = useQuery<HistoryItem[]>({
    queryKey: ['consumables-history'],
    queryFn: async () => {
      const res = await fetch('/api/consumables')
      if (!res.ok) throw new Error('Error al cargar historial')
      const data = await res.json()
      return data.history
    },
    initialData: initialHistory,
  })

  const selectedSupply = (supplies ?? []).find((s: Supply) => s.id === selectedSupplyId)

  const registerMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.set('supplyId', selectedSupplyId)
      formData.set('quantity', quantity.toString())
      formData.set('reason', reason)
      if (notes) formData.set('notes', notes)
      await registerConsumableUsage(formData)
    },
    onSuccess: () => {
      setSelectedSupplyId('')
      setQuantity(1)
      setReason('sale')
      setNotes('')
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables-history'] })
      queryClient.invalidateQueries({ queryKey: ['consumables-supplies'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplyId) return
    registerMutation.mutate()
  }

  const getReasonLabel = (r: string) => {
    switch (r) {
      case 'sale': return 'Venta'
      case 'damage': return 'Dañado'
      case 'loss': return 'Pérdida'
      default: return r
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Consumibles</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Registra el uso de vasos, servilletas, bolsas y otros.
          </p>
        </div>
      </div>

      {/* Register Form */}
      <Card className="rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Registrar Consumo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Consumible</label>
                <Select value={selectedSupplyId} onValueChange={setSelectedSupplyId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecciona un consumible" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No hay consumibles registrados.<br />
                        Crea uno en Insumos con categoría "Consumibles".
                      </div>
                    ) : (
                      supplies.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{s.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({s.currentStock} {s.unit})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cantidad</label>
                <NumericInput
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={selectedSupply?.currentStock || 999}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Motivo</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="damage">Dañado</SelectItem>
                    <SelectItem value="loss">Pérdida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Se cayó el paquete, cliente no aceptó, etc."
                className="w-full h-12 px-4 rounded-lg border border-border/50 bg-background/50"
              />
            </div>

            {selectedSupply && (
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <span className="text-muted-foreground">Stock actual: </span>
                <span className="font-bold">{selectedSupply.currentStock} {selectedSupply.unit}</span>
                <span className="text-muted-foreground ml-4">Se descontará: </span>
                <span className="font-bold text-rose-500">{quantity} {selectedSupply.unit}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={registerMutation.isPending || !selectedSupplyId || quantity < 1}
              className="w-full h-12 font-bold rounded-lg"
            >
              <Plus size={20} className="mr-2" />
              {registerMutation.isPending ? 'Registrando...' : 'Registrar Consumo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Historial de Consumo</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package size={40} className="mx-auto mb-2 opacity-50" />
              <p>No hay registros de consumo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      item.reason === 'sale' ? "bg-emerald-500/10 text-emerald-500" :
                      item.reason === 'damage' ? "bg-rose-500/10 text-rose-500" :
                      "bg-amber-500/10 text-amber-500"
                    )}>
                      {item.reason === 'sale' ? <Plus size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.supplyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} unidades • {getReasonLabel(item.reason)}
                        {item.notes && ` • ${item.notes}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}