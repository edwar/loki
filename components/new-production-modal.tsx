'use client'

import { useState } from 'react'
import {
  Dialog
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { prepareProduct } from '@/lib/actions/products'
import { sileo as toast } from 'sileo'

interface Product {
  id: string
  name: string
  yield: number
  recipeItems: {
    id: string
    quantityRequired: number
    supply: {
      id: string
      name: string
      currentStock: number
      unit: string
    } | null
  }[]
}

export function NewProductionModal({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [batches, setBatches] = useState<number>(1)
  const [actualYield, setActualYield] = useState<number>(0)

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleProductChange = (id: string) => {
    setSelectedProductId(id)
    const product = products.find((p) => p.id === id)
    if (product) {
      setActualYield(product.yield * batches)
    }
  }

  const handleBatchesChange = (val: number) => {
    setBatches(val)
    if (selectedProduct) {
      setActualYield(selectedProduct.yield * val)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || batches <= 0 || actualYield <= 0) return

    setLoading(true)
    try {
      await prepareProduct(selectedProductId, batches, actualYield)
      toast.success({ title: 'Producción registrada correctamente' })
      setOpen(false)
      // Reset form
      setSelectedProductId('')
      setBatches(1)
      setActualYield(0)
    } catch (error: any) {
      toast.error({ title: error.message || 'Error al registrar la producción' })
    } finally {
      setLoading(false)
    }
  }

  // Verificar si hay suficientes insumos para los lotes seleccionados
  const getInsuficientSupplies = () => {
    if (!selectedProduct) return []
    return selectedProduct.recipeItems.filter((item) => {
      if (!item.supply) return false
      return item.supply.currentStock < item.quantityRequired * batches
    })
  }

  const insuficientes = getInsuficientSupplies()
  const canProduce = selectedProductId && insuficientes.length === 0 && batches > 0

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-lg h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
      >
        <Plus size={20} className="mr-2" />
        Nueva Producción
      </Button>

      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Registrar Producción"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Producto a fabricar</label>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Selecciona un producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
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
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendimiento Real</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualYield}
                    onChange={(e) => setActualYield(parseFloat(e.target.value) || 0)}
                    className="h-12 rounded-lg font-bold text-primary"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Esperado: {selectedProduct.yield * batches} unidades
                  </p>
                </div>
              </div>
            )}

            {selectedProduct && selectedProduct.recipeItems.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-accent/5 overflow-hidden">
                <div className="bg-accent/10 px-4 py-2 border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Insumos Requeridos</p>
                </div>
                <div className="p-4 space-y-3">
                  {selectedProduct.recipeItems.map((item) => {
                    const required = item.quantityRequired * batches
                    const isOk = item.supply && item.supply.currentStock >= required
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isOk ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <AlertCircle size={14} className="text-rose-500" />
                          )}
                          <span className="text-sm font-medium">{item.supply?.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">
                            {required} {item.supply?.unit}
                          </p>
                          <p className={`text-[10px] ${isOk ? 'text-muted-foreground' : 'text-rose-500 font-bold'}`}>
                            Stock: {item.supply?.currentStock}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedProduct && selectedProduct.recipeItems.length === 0 && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5" size={18} />
                <p className="text-xs text-amber-700 font-medium">
                  Este producto no tiene una receta definida. Debes configurar los insumos en el catálogo antes de producir.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!canProduce || loading}
              className="w-full h-12 rounded-lg font-bold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Confirmar Producción</>
              )}
            </Button>
            {!canProduce && selectedProductId && selectedProduct?.recipeItems.length! > 0 && (
              <p className="text-center text-[10px] text-rose-500 font-bold mt-3 uppercase tracking-wider">
                Insumos insuficientes para completar esta orden
              </p>
            )}
          </div>
        </form>
      </Dialog>
    </>
  )
}
