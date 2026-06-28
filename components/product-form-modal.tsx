'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { cn } from '@/lib/utils'
import { calculateMargin } from '@/lib/pricing'
import { Plus, X } from 'lucide-react'

interface ProductFormModalProps {
  product?: { id: string; name: string; category: string | null; profitMargin: number; yield: number; salePrice: number } | null
  categories: string[]
  unitCost?: number
  onSuccess?: () => void
  onClose?: () => void
}

export function ProductFormModal({ product, categories, unitCost = 0, onSuccess, onClose }: ProductFormModalProps) {
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? 0)
  const [yieldAmount, setYieldAmount] = useState(product?.yield ?? 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState(product?.category ?? '')

  // Calcular margen desde el precio de venta usando el costo real del producto
  const calculatedMargin = unitCost > 0 && salePrice > 0
    ? calculateMargin(salePrice, unitCost)
    : 0

  const isEditing = !!product
  const action = isEditing ? updateProduct.bind(null, product.id) : createProduct

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const marginToSave = calculatedMargin > 0 ? calculatedMargin : (product?.profitMargin ?? 30)
    formData.set('profitMargin', marginToSave.toString())
    formData.set('salePrice', salePrice.toString())
    formData.set('yield', yieldAmount.toString())
    if (category) {
      formData.set('category', category)
    }

    try {
      await action(formData)
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
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos del producto' : 'Agrega un producto al catálogo'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre del Producto</label>
            <Input
              name="name"
              defaultValue={product?.name}
              required
              placeholder="Ej: Empanada de Carne"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Precio de Venta Unitario</label>
            <NumericInput
              value={salePrice}
              onChange={setSalePrice}
              placeholder="0"
              className="h-12"
            />
            {unitCost > 0 && salePrice > 0 && (
              <p className={cn(
                "text-xs font-bold",
                calculatedMargin >= 30 ? "text-emerald-500" : calculatedMargin >= 20 ? "text-amber-500" : "text-rose-500"
              )}>
                Margen de utilidad: {calculatedMargin.toFixed(1)}%
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendimiento Esperado (uds/lote)</label>
            <NumericInput
              value={yieldAmount}
              onChange={setYieldAmount}
              placeholder="1"
              min={1}
              className="h-12"
            />
            <p className="text-[10px] text-muted-foreground">
              Se actualizará automáticamente al registrar una producción.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-border">
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
            disabled={loading}
            className="flex-1 h-12 font-semibold rounded-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin"><Plus size={16} /></span>Guardando...</span>
            ) : (
              isEditing ? 'Guardar Cambios' : 'Crear Producto'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}