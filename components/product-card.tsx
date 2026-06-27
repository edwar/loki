'use client'

import { useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Trash2, ShoppingBag, Edit2, ChevronDown, Plus, Package } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UNIDADES_POR_TIPO } from '@/lib/constants'
import { getUnitType } from '@/lib/conversions'
import { deleteProduct, deleteRecipeItem, prepareProduct, updateRecipeItem, consumeProduct } from '@/lib/actions/products'
import { RecipeForm } from './product-forms'
import { NumericInput } from './ui/numeric-input'
import { ConfirmationModal } from './ui/confirmation-modal'
import { sileo as toast } from 'sileo'

export function ProductCard({
  product,
  categories,
  allSupplies,
  index,
  onEdit
}: {
  product: any
  categories: string[]
  allSupplies: any[]
  index: number
  onEdit: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isProducing, setIsProducing] = useState(false)
  const [isConsuming, setIsConsuming] = useState(false)
  const [consumeQuantity, setConsumeQuantity] = useState(1)
  const [recipeItemToDelete, setRecipeItemToDelete] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [editingRecipeItem, setEditingRecipeItem] = useState<any | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [editUnit, setEditUnit] = useState<string>('')
  const [actualYield, setActualYield] = useState<number>(0)
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const recipeCost = product.recipeItems.reduce((acc: number, item: any) => {
    const qty = Number(item.quantityRequired) || 0
    const price = Number(item.supply?.purchasePrice) || 0
    return acc + (qty * price)
  }, 0)

  const handleOpenProduce = () => {
    if (product.maxPossibleBatches <= 0) return
    setActualYield(1)
    setIsProducing(true)
  }

  const handleConfirmProduce = () => {
    if (product.maxPossibleBatches <= 0) return
    startTransition(async () => {
      await prepareProduct(product.id, 1, actualYield)
      setIsProducing(false)
      invalidateProducts()
    })
  }

  const handleConfirmConsume = () => {
    if (consumeQuantity <= 0 || Number(product.currentStock) < consumeQuantity) return
    startTransition(async () => {
      await consumeProduct(product.id, consumeQuantity)
      setIsConsuming(false)
      setConsumeQuantity(1)
      toast.warning({ title: `Consumo registrado: ${consumeQuantity} ${product.name}` })
      invalidateProducts()
    })
  }

  return (
    <>
      <Card
        className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-all duration-500 animate-fade-in p-0"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardHeader
          className={`mb-0 px-4 md:px-5 py-4 flex flex-row items-start md:items-center justify-between gap-2 cursor-pointer hover:bg-primary/2 transition-colors group/header ${isExpanded ? 'border-b border-border/30' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 shrink-0 mt-0.5 md:mt-0 rounded-lg bg-accent/50 flex items-center justify-center group-hover/header:scale-110 transition-transform shadow-sm">
              <ShoppingBag size={18} className="text-primary/70" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg truncate">{product.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md shrink-0">
                  {product.category || 'Sin categoría'}
                </span>
                <div className="flex items-center gap-3 sm:gap-2 sm:ml-2 sm:pl-3 sm:border-l border-border/30 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed sm:border-solid">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">Stock Disponible</span>
                    <span className={cn(
                      "text-xs font-black",
                      product.currentStock > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {Number(product.currentStock)} uds
                    </span>
                  </div>
                  <div className="flex flex-col ml-3">
                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold" title="Basado en el inventario actual de insumos">Capacidad (Insumos)</span>
                    <span className={cn(
                      "text-xs font-black",
                      product.maxPossibleBatches > 0 ? "text-amber-500" : "text-muted-foreground/30"
                    )}>
                      {product.maxPossibleBatches} lotes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1 md:gap-2 mr-1 md:mr-2 pr-2 md:pr-4 border-r border-border/30">
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
                onClick={() => setProductToDelete(product.id)}
                className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
              >
                <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
              </Button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
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
              {product.recipeItems.length > 0 && (
                <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4",
                  product.maxPossibleBatches > 0
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-muted/50 border-border/40"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg shrink-0 flex items-center justify-center",
                      product.maxPossibleBatches > 0
                        ? "bg-amber-500/20 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Plus size={20} />
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-bold",
                        product.maxPossibleBatches > 0 ? "text-amber-900 dark:text-amber-100" : "text-foreground"
                      )}>
                        Producción de Lotes
                      </p>
                      <p className={cn(
                        "text-xs",
                        product.maxPossibleBatches > 0 ? "text-amber-700/70 dark:text-amber-400/70" : "text-muted-foreground"
                      )}>
                        {product.maxPossibleBatches > 0
                          ? `Suficientes insumos para ${product.maxPossibleBatches} lote(s).`
                          : "Insumos insuficientes para esta receta."}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleOpenProduce}
                    disabled={product.maxPossibleBatches <= 0}
                    className={cn(
                      "w-full sm:w-auto font-bold shadow-lg",
                      product.maxPossibleBatches > 0
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed shadow-none"
                    )}
                  >
                    Producir 1 Lote
                  </Button>
                </div>
              )}

              {Number(product.currentStock) > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-rose-500/20 text-rose-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                        Registrar Consumo
                      </p>
                      <p className="text-xs text-rose-700/70 dark:text-rose-400/70">
                        Descuenta unidades del stock (ají, salsas, etc.)
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setConsumeQuantity(1); setIsConsuming(true) }}
                    variant="outline"
                    className="w-full sm:w-auto font-bold border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    Registrar Consumo
                  </Button>
                </div>
              )}

              {product.recipeItems.length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-border/30 bg-background/50">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Costo del Lote</p>
                    <p className="text-sm font-black text-foreground">{formatCurrency(recipeCost)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Margen de Utilidad</p>
                    <p className="text-sm font-black text-emerald-500">{product.profitMargin ?? 30}%</p>
                  </div>
                  <div className="col-span-2 p-3 rounded-lg bg-accent/30 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      El precio de venta se calculará al registrar la producción, basado en el costo real del lote y el margen de utilidad.
                    </p>
                  </div>
                </div>
              )}

              {allSupplies.length > 0 && (
                <RecipeForm productId={product.id} supplies={allSupplies} onSuccess={invalidateProducts} />
              )}

              {product.recipeItems.length === 0 ? (
                <div className="py-6 text-center rounded-lg bg-accent/10 border border-dashed border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">No has definido insumos para este producto aún.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/5 hover:bg-accent/5">
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Insumo</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Consumo por Receta</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold text-right">Costo Est.</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.recipeItems.map((item: any) => {
                        const cost = (Number(item.quantityRequired) || 0) * (Number(item.supply?.purchasePrice) || 0)
                        return (
                          <RecipeItemRow
                            key={item.id}
                            item={item}
                            cost={cost}
                            onEdit={(item) => {
                              setEditQuantity(Number(item.quantityRequired))
                              setEditUnit(item.unit)
                              setEditingRecipeItem(item)
                            }}
                            onDelete={(id) => setRecipeItemToDelete(id)}
                          />
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

      {/* Production Modal */}
      <ConfirmationModal
        isOpen={isProducing}
        onClose={() => setIsProducing(false)}
        onConfirm={handleConfirmProduce}
        title={`Producir ${product.name}`}
        description=""
        confirmText="Confirmar Producción"
        variant="warning"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Se consumirán los materiales necesarios para producir <strong>1 lote</strong> de la receta y se registrarán las unidades obtenidas.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground">
              Unidades Obtenidas
            </label>
            <p className="text-xs text-foreground/60 mb-2">
              Ingresa cuántas unidades salieron de este lote de producción.
            </p>
            <NumericInput
              value={actualYield}
              onChange={setActualYield}
              className="h-14 text-lg font-black text-center border-amber-500/30 focus-visible:ring-amber-500/20"
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Consumption Modal */}
      <ConfirmationModal
        isOpen={isConsuming}
        onClose={() => setIsConsuming(false)}
        onConfirm={handleConfirmConsume}
        title={`Registrar Consumo — ${product.name}`}
        description="Descuenta unidades del stock actual. El stock no se reabastece automáticamente."
        confirmText="Registrar Consumo"
        variant="danger"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span className="text-sm font-bold text-foreground">Stock Disponible:</span>
            <span className="text-sm font-black text-emerald-500">{Number(product.currentStock)} uds</span>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground">
              Unidades a Consumir
            </label>
            <NumericInput
              value={consumeQuantity}
              onChange={setConsumeQuantity}
              min={1}
              max={Number(product.currentStock)}
              className="h-14 text-lg font-black text-center border-rose-500/30 focus-visible:ring-rose-500/20"
            />
            {consumeQuantity > Number(product.currentStock) && (
              <p className="text-xs text-rose-500">Supera el stock disponible</p>
            )}
          </div>
        </div>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (!productToDelete) return
          startTransition(async () => {
            await deleteProduct(productToDelete)
            setProductToDelete(null)
            invalidateProducts()
          })
        }}
        title="¿Eliminar producto?"
        description="Este producto será removido. Esta acción no se puede deshacer."
        confirmText="Eliminar Producto"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={recipeItemToDelete !== null}
        onClose={() => setRecipeItemToDelete(null)}
        onConfirm={() => {
          if (!recipeItemToDelete) return
          const id = recipeItemToDelete
          setRecipeItemToDelete(null)
          startTransition(async () => {
            await deleteRecipeItem(id)
            toast.warning({ title: 'Insumo quitado de la receta' })
            invalidateProducts()
          })
        }}
        title="¿Quitar insumo de la receta?"
        description="Este insumo será removido de la receta del producto. Esta acción no se puede deshacer."
        confirmText="Quitar Insumo"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={editingRecipeItem !== null}
        onClose={() => setEditingRecipeItem(null)}
        onConfirm={() => {
          if (!editingRecipeItem) return
          startTransition(async () => {
            await updateRecipeItem(editingRecipeItem.id, editQuantity, editUnit)
            setEditingRecipeItem(null)
            invalidateProducts()
          })
        }}
        title="Editar Insumo"
        description=""
        confirmText="Guardar Cambios"
        variant="primary"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-bold text-foreground mb-1">{editingRecipeItem?.supply?.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(Number(editingRecipeItem?.supply?.purchasePrice) || 0)} / {editingRecipeItem?.supply?.unit}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground">
                Cantidad
              </label>
              <NumericInput
                value={editQuantity}
                onChange={setEditQuantity}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground">
                Unidad
              </label>
              {(() => {
                const supplyUnit = editingRecipeItem?.supply?.unit
                const unitType = supplyUnit ? getUnitType(supplyUnit) : null
                const availableUnits = unitType ? UNIDADES_POR_TIPO[unitType] : UNIDADES_POR_TIPO.sinConversion || ['unidad', 'pack', 'caja', 'bolsa']
                return (
                  <Select value={editUnit} onValueChange={setEditUnit}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((u: string) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              })()}
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  )
}

function RecipeItemRow({ item, cost, onEdit, onDelete }: {
  item: any
  cost: number
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}) {
  return (
    <TableRow className="group/row hover:bg-accent/5">
      <TableCell className="py-2.5 font-semibold text-sm">
        {item.supply.name}
        <span className="block text-[10px] text-muted-foreground font-normal">
          {formatCurrency(Number(item.supply?.purchasePrice) || 0)} / {item.supply?.unit}
        </span>
      </TableCell>
      <TableCell className="py-2.5">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-accent/50 text-muted-foreground rounded-md">
          {Number(item.quantityRequired)} {item.unit}
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
            onClick={() => onEdit(item)}
            className="h-6 w-6 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
          >
            <Edit2 className='w-4 h-4 group-hover:text-primary' />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-6 w-6 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
          >
            <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}