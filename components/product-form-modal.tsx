'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { Plus, X } from 'lucide-react'

interface ProductFormModalProps {
  product?: { id: string; name: string; category: string | null; salePrice: number; yield: number } | null
  categories: string[]
  onSuccess?: () => void
  onClose?: () => void
}

export function ProductFormModal({ product, categories, onSuccess, onClose }: ProductFormModalProps) {
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? 0)
  const [yieldAmount, setYieldAmount] = useState(product?.yield ?? 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoryInput, setCategoryInput] = useState(product?.category ?? '')

  const isEditing = !!product
  const action = isEditing ? updateProduct.bind(null, product.id) : createProduct

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('salePrice', salePrice.toString())
    formData.set('yield', yieldAmount.toString())
    if (categoryInput) {
      formData.set('category', categoryInput)
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

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
            <Input
              name="category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              list="product-categories"
              placeholder="Ej: Empanadas"
              className="h-12"
            />
            <datalist id="product-categories">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Precio de Venta</label>
            <NumericInput
              value={salePrice}
              onChange={setSalePrice}
              placeholder="0"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendimiento (Porción/Lote)</label>
            <NumericInput
              value={yieldAmount}
              onChange={setYieldAmount}
              placeholder="1"
              className="h-12"
            />
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
            variant="secondary"
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