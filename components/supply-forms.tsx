'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSupply, updateSupply } from '@/lib/actions/supplies'
import { UNIDADES } from '@/lib/constants'
import { getUnitType, convertUnits } from '@/lib/conversions'

interface Category {
  id: string
  name: string
}

export function SupplyForm({ 
  supply, 
  onSuccess 
}: { 
  supply?: any
  onSuccess?: () => void
}) {
  const [currentStock, setCurrentStock] = useState(supply?.currentStock ?? 0)
  const [minStock, setMinStock] = useState(supply?.minStock ?? 0)
  const [purchasePrice, setPurchasePrice] = useState(supply?.purchasePrice ?? 0)
  const [displayUnit, setDisplayUnit] = useState(supply?.unit ?? 'unidad')
  const [unitsPerPack, setUnitsPerPack] = useState(supply?.unitsPerPack ?? 1)
  const [categoryId, setCategoryId] = useState<string>(supply?.categoryId || '')
  const [conversionFactor, setConversionFactor] = useState(supply?.conversionFactor?.toString() || '')
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'supply'],
    queryFn: async () => {
      const res = await fetch('/api/categories?type=supply')
      if (!res.ok) throw new Error('Error al cargar categorías')
      return res.json()
    },
    staleTime: Infinity,
  })
  
  const unitType = getUnitType(displayUnit)
  const showUnitsPerPack = !unitType && ['pack', 'caja', 'bolsa', 'cubeta', 'par', 'docena'].includes(displayUnit)
  const normalizedUnit = unitType === 'peso' ? 'gramo' : unitType === 'volumen' ? 'mililitro' : displayUnit

  const action = supply ? updateSupply.bind(null, supply.id) : createSupply

  const handleSubmit = async (formData: FormData) => {
    formData.set('unit', normalizedUnit)
    formData.set('unitsPerPack', showUnitsPerPack ? unitsPerPack.toString() : '1')
    formData.set('categoryId', categoryId || '')
    formData.set('conversionFactor', conversionFactor || '')

    // Convertir precio a la unidad base (ej: precio por litro → precio por ml)
    if (displayUnit !== normalizedUnit) {
      const factor = convertUnits(1, displayUnit, normalizedUnit)
      if (factor && factor > 0) {
        const basePrice = (formData.get('purchasePrice') as string)
          ? parseFloat(formData.get('purchasePrice') as string) / factor
          : 0
        formData.set('purchasePrice', basePrice.toString())
      }
    }

    await action(formData)
    onSuccess?.()
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Nombre del Insumo</label>
          <Input name="name" defaultValue={supply?.name} required placeholder="Ej: Harina de Trigo" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Categoría</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!supply && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Stock Inicial</label>
            <NumericInput value={currentStock} onChange={setCurrentStock} />
            <input type="hidden" name="currentStock" value={currentStock} />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Precio de Compra</label>
          <NumericInput value={purchasePrice} onChange={setPurchasePrice} />
          <input type="hidden" name="purchasePrice" value={purchasePrice} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Stock Mínimo</label>
          <NumericInput value={minStock} onChange={setMinStock} />
          <input type="hidden" name="minStock" value={minStock} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Unidad</label>
          <Select value={displayUnit} onValueChange={setDisplayUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES.map(u => (
                <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {unitType && (
            <p className="text-[10px] text-muted-foreground">
              Se guardará como: {normalizedUnit}
            </p>
          )}
          <div className="mt-4 p-3 bg-muted/30 border border-border/50 rounded-lg space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">
              Factor de Conversión (opcional)
            </label>
            <p className="text-[10px] text-muted-foreground">
              Solo si compras en una unidad diferente a como se guarda. Ej: guardas en gramos pero compras en mililitros.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">1 ml comprado =</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={conversionFactor}
                onChange={(e) => setConversionFactor(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg bg-background border border-border text-sm text-center"
                placeholder="1.0"
              />
              <span className="text-sm text-muted-foreground">{normalizedUnit} en receta</span>
            </div>
          </div>
        </div>
        {showUnitsPerPack && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">
              Unidades por {displayUnit}
            </label>
            <NumericInput value={unitsPerPack} onChange={setUnitsPerPack} />
            <p className="text-[10px] text-muted-foreground">
              Ej: Una {displayUnit} contiene X unidades
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-10 rounded-lg">
          {supply ? 'Guardar Cambios' : 'Crear Insumo'}
        </Button>
      </div>
    </form>
  )
}
