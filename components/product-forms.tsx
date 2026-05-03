'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProduct, updateProduct, addRecipeItem } from '@/lib/actions/products'
import { UNIDADES } from '@/lib/constants'
import { Plus } from 'lucide-react'

export function ProductForm({
  product,
  categories,
  onSuccess
}: {
  product?: { id: string; name: string; category: string | null; salePrice: number } | null
  categories: string[]
  onSuccess?: () => void
}) {
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? 0)
  const action = product ? updateProduct.bind(null, product.id) : createProduct

  const handleSubmit = async (formData: FormData) => {
    // If we have an onSuccess callback, we can assume the action is successful 
    // or we can just call it to close the modal.
    onSuccess?.()
  }

  return (
    <form
      action={async (formData) => {
        await action(formData)
        onSuccess?.()
      }}
      className="space-y-2"
    >
      <div className="grid gap-6 grid-cols-1">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre del Producto</label>
          <Input name="name" defaultValue={product?.name} required placeholder="Ej: Empanada de Carne" className="h-12" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
            <Input
              name="category"
              defaultValue={product?.category ?? ''}
              list="categories"
              placeholder="Ej: Empanadas"
              className="h-12"
            />
            <datalist id="categories">
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
            <input type="hidden" name="salePrice" value={salePrice} />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="px-10 rounded-lg">
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}

export function RecipeForm({
  productId,
  supplies
}: {
  productId: string,
  supplies: { id: string; name: string; unit: string }[]
}) {
  const [quantity, setQuantity] = useState(0)

  return (
    <form action={addRecipeItem} className="mt-2 p-4 bg-primary/3 rounded-lg border border-primary/10 backdrop-blur-md">
      <input type="hidden" name="productId" value={productId} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-1.5 items-end">
        {/* Labels Row */}
        <div className="hidden md:block md:col-span-5 lg:col-span-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 ml-1">Insumo</label>
        </div>
        <div className="hidden md:block md:col-span-3 lg:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 ml-1">Cantidad</label>
        </div>
        <div className="hidden md:block md:col-span-3 lg:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 ml-1">Unidad</label>
        </div>
        <div className="hidden md:block md:col-span-1 lg:col-span-1"></div>

        {/* Inputs Row */}
        <div className="md:col-span-5 lg:col-span-6">
          <label className="md:hidden text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 mb-1 block">Insumo</label>
          <Select name="supplyId" required>
            <SelectTrigger className="h-11 rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-primary/10">
              {supplies.map(s => (
                <SelectItem key={s.id} value={s.id} className="rounded-lg">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          <label className="md:hidden text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 mb-1 block">Cantidad</label>
          <NumericInput
            value={quantity}
            onChange={setQuantity}
            placeholder="0"
            className="h-11 rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm"
          />
          <input type="hidden" name="quantityRequired" value={quantity} />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <label className="md:hidden text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 mb-1 block">Unidad</label>
          <Select name="unit" required>
            <SelectTrigger className="h-11 rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-primary/10">
              {UNIDADES.map(u => (
                <SelectItem key={u} value={u} className="capitalize rounded-lg">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1 lg:col-span-1 flex justify-center lg:justify-start">
          <Button
            type="submit"
            size="icon"
            className="h-11 w-full lg:w-11 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
          </Button>
        </div>
      </div>
    </form>
  )
}
