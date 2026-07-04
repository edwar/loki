'use client'

import { useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Trash2, Edit2, ChevronDown, Plus, BookOpen, FlaskConical } from 'lucide-react'
import { NumericInput } from '@/components/ui/numeric-input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IngredientSelector } from '@/components/ingredient-selector'
import { deletePreparation, removeIngredient, updateIngredient, addIngredient } from '@/lib/actions/preparations'
import { sileo as toast } from 'sileo'

interface Supply {
  id: string
  name: string
  unit: string
  currentStock: number
  purchasePrice: number
  unitsPerPack: number
}

interface SubPrep {
  id: string
  name: string
  unit: string
  currentStock: number
  costPrice: number
}

interface Ingredient {
  id: string
  quantity: number
  unit: string
  supply?: { id: string; name: string; unit: string; currentStock: number; purchasePrice: number } | null
  subPreparation?: SubPrep | null
}

interface Preparation {
  id: string
  name: string
  description: string | null
  unit: string
  yield: number
  currentStock: number
  minStock: number
  costPrice: number
  notes: string | null
  ingredients: Ingredient[]
}

export function PreparationCard({
  preparation,
  supplies,
  allPreparations,
  index,
  onEdit,
  onProduce,
}: {
  preparation: Preparation
  supplies: Supply[]
  allPreparations: Preparation[]
  index: number
  onEdit: () => void
  onProduce: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [ingredientType, setIngredientType] = useState<'supply' | 'preparation'>('supply')
  const [selectedSupplyId, setSelectedSupplyId] = useState('')
  const [selectedPrepId, setSelectedPrepId] = useState('')
  const [qty, setQty] = useState(0)
  const [unit, setUnit] = useState(preparation.unit)
  const [prepToDelete, setPrepToDelete] = useState<string | null>(null)
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null)
  const [editQty, setEditQty] = useState(0)
  const [editUnit, setEditUnit] = useState('')
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['preparations'] })

  const recipeCost = preparation.ingredients.reduce((acc, ing) => {
    const qty = Number(ing.quantity) || 0
    if (ing.supply) return acc + qty * (Number(ing.supply.purchasePrice) || 0)
    if (ing.subPreparation) return acc + qty * (Number(ing.subPreparation.costPrice) || 0)
    return acc
  }, 0)

  const handleAddIngredient = async () => {
    const formData = new FormData()
    formData.set('preparationId', preparation.id)
    formData.set('type', ingredientType)
    formData.set('quantity', String(qty))
    formData.set('unit', unit)

    if (ingredientType === 'supply') {
      if (!selectedSupplyId) return
      formData.set('supplyId', selectedSupplyId)
    } else {
      if (!selectedPrepId) return
      formData.set('subPreparationId', selectedPrepId)
    }

    startTransition(async () => {
      try {
        await addIngredient(formData)
        toast.success({ title: 'Ingrediente agregado' })
        setSelectedSupplyId('')
        setSelectedPrepId('')
        setQty(0)
        invalidate()
      } catch (e: any) {
        toast.error({ title: e.message || 'Error al agregar ingrediente' })
      }
    })
  }



  return (
    <>
      <Card
        className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-all duration-500 animate-fade-in p-0"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardHeader
          className={`relative mb-0 px-4 md:px-5 py-4 flex flex-row items-start md:items-center justify-between gap-2 cursor-pointer hover:bg-primary/2 transition-colors group/header ${isExpanded ? 'border-b border-border/30' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 shrink-0 mt-0.5 md:mt-0 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover/header:scale-110 transition-transform shadow-sm">
              <FlaskConical size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg truncate">{preparation.name}</CardTitle>
              {preparation.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{preparation.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md shrink-0">
                  {preparation.unit}
                </span>
                <div className="flex items-center gap-2 pl-2 border-l border-border/30">
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Stock</span>
                  <span className={cn(
                    "text-xs font-black",
                    preparation.currentStock > 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {preparation.currentStock} {preparation.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-2 border-l border-border/30">
                  <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Costo</span>
                  <span className="text-xs font-black text-rose-500">{formatCurrency(preparation.costPrice)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {preparation.ingredients.length > 0 && (
              <Button
                onClick={onProduce}
                size="sm"
                className="h-8 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 sm:px-3 px-0 sm:w-auto w-8"
              >
                <Plus size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Producir</span>
              </Button>
            )}
            {preparation.notes && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg sm:px-3 px-0 sm:w-auto w-8"
              >
                <BookOpen size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Notas</span>
              </Button>
            )}
            <div className="flex gap-1 md:gap-2 pl-1.5 md:pl-2 border-l border-border/30">
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
              >
                <Edit2 className='w-4 h-4 group-hover:text-primary' />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPrepToDelete(preparation.id)}
                className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
              >
                <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
              </Button>
            </div>
            <button
              type="button"
              className="h-8 w-8 p-0 rounded-lg hover:bg-accent transition-all"
            >
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-5 bg-primary/1 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="space-y-4">
              {preparation.ingredients.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border border-border/30 bg-background/50">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Costo Total</p>
                    <p className="text-sm font-black text-foreground">{formatCurrency(recipeCost)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Costo Unitario</p>
                    <p className="text-sm font-black text-rose-500">{formatCurrency(preparation.costPrice)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Rendimiento</p>
                    <p className="text-sm font-black text-amber-500">{preparation.yield} {preparation.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Stock</p>
                    <p className={cn(
                      "text-sm font-black",
                      preparation.currentStock > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {preparation.currentStock} {preparation.unit}
                    </p>
                  </div>
                </div>
              )}

              <IngredientSelector
                type={ingredientType}
                onTypeChange={setIngredientType}
                supplyOptions={supplies.map(s => ({
                  value: s.id,
                  label: `${s.name} (${s.unit} - ${formatCurrency(s.purchasePrice)}/${s.unit})`,
                }))}
                preparationOptions={allPreparations
                  .filter(p => p.id !== preparation.id)
                  .map(p => ({
                    value: p.id,
                    label: `${p.name} (${formatCurrency(p.costPrice)}/${p.unit})`,
                  }))}
                selectedSupplyId={selectedSupplyId}
                onSupplyChange={setSelectedSupplyId}
                selectedPrepId={selectedPrepId}
                onPrepChange={setSelectedPrepId}
                quantity={qty}
                onQuantityChange={setQty}
                unit={unit}
                onUnitChange={setUnit}
                onSubmit={handleAddIngredient}
                canSubmit={!!(ingredientType === 'supply' ? selectedSupplyId : selectedPrepId) && qty > 0}
                submitIcon={ingredientType === 'supply' ? <Plus size={16} strokeWidth={3} /> : <FlaskConical size={16} strokeWidth={3} />}
              />

              {preparation.ingredients.length === 0 ? (
                <div className="py-6 text-center rounded-lg bg-accent/10 border border-dashed border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">No has definido ingredientes para esta preparación.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/5 hover:bg-accent/5">
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Ingrediente</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Tipo</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Cantidad</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold text-right">Costo Est.</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preparation.ingredients.map((ing) => {
                        const cost = (Number(ing.quantity) || 0) * (
                          ing.supply ? (Number(ing.supply.purchasePrice) || 0)
                          : ing.subPreparation ? (Number(ing.subPreparation.costPrice) || 0)
                          : 0
                        )
                        return (
                          <TableRow key={ing.id} className="group/row hover:bg-accent/5">
                            <TableCell className="py-2.5 font-semibold text-sm">
                              {ing.supply?.name || ing.subPreparation?.name || 'Desconocido'}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                ing.supply ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {ing.supply ? 'Insumo' : 'Preparación'}
                              </span>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-accent/50 text-muted-foreground rounded-md">
                                {Number(ing.quantity)} {ing.unit}
                              </span>
                            </TableCell>
                            <TableCell className="py-2.5 text-right font-medium text-xs">
                              {formatCurrency(cost)}
                            </TableCell>
                            <TableCell className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditIngredient(ing)
                                    setEditQty(Number(ing.quantity))
                                    setEditUnit(ing.unit)
                                  }}
                                  className="h-6 w-6 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                                >
                                  <Edit2 className='w-4 h-4' />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(ing.id).then(() => { invalidate(); toast.warning({ title: 'Ingrediente quitado' }) })}
                                  className="h-6 w-6 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <ConfirmationModal
        isOpen={prepToDelete !== null}
        onClose={() => setPrepToDelete(null)}
        onConfirm={() => {
          if (!prepToDelete) return
          startTransition(async () => {
            await deletePreparation(prepToDelete)
            setPrepToDelete(null)
            invalidate()
          })
        }}
        title="¿Eliminar preparación?"
        description="Esta preparación será removida. Esta acción no se puede deshacer."
        confirmText="Eliminar Preparación"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={editIngredient !== null}
        onClose={() => setEditIngredient(null)}
        onConfirm={() => {
          if (!editIngredient) return
          startTransition(async () => {
            await updateIngredient(editIngredient.id, editQty, editUnit)
            setEditIngredient(null)
            invalidate()
          })
        }}
        title="Editar Ingrediente"
        description=""
        confirmText="Guardar Cambios"
        variant="primary"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-bold text-foreground mb-1">
              {editIngredient?.supply?.name || editIngredient?.subPreparation?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {editIngredient?.supply
                ? `${formatCurrency(Number(editIngredient.supply.purchasePrice))} / ${editIngredient.supply.unit}`
                : editIngredient?.subPreparation
                  ? `${formatCurrency(Number(editIngredient.subPreparation.costPrice))} / ${editIngredient.subPreparation.unit}`
                  : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground">Cantidad</label>
              <NumericInput value={editQty} onChange={setEditQty} className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground">Unidad</label>
              <Select value={editUnit} onValueChange={setEditUnit}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {['kg', 'g', 'L', 'mL', 'ud', 'pza', 'paq'].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  )
}
