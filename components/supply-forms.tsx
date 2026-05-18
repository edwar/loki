'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSupply, updateSupply } from '@/lib/actions/supplies'
import { UNIDADES } from '@/lib/constants'
import { getUnitType } from '@/lib/conversions'

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
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories?type=supply')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  useEffect(() => {
    if (supply?.categoryId) {
      setCategoryId(supply.categoryId)
    }
  }, [supply?.categoryId])
  
  const unitType = getUnitType(displayUnit)
  const showUnitsPerPack = !unitType && ['pack', 'caja', 'bolsa', 'cubeta', 'par', 'docena'].includes(displayUnit)

  const getNormalizedUnit = (selectedUnit: string): string => {
    const type = getUnitType(selectedUnit)
    if (type === 'peso') return 'gramo'
    if (type === 'volumen') return 'mililitro'
    return selectedUnit
  }

  const action = supply ? updateSupply.bind(null, supply.id) : createSupply

  const handleSubmit = async (formData: FormData) => {
    const normalizedUnit = getNormalizedUnit(displayUnit)
    formData.set('unit', normalizedUnit)
    formData.set('unitsPerPack', showUnitsPerPack ? unitsPerPack.toString() : '1')
    formData.set('categoryId', categoryId || '')
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
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Stock Inicial</label>
              <NumericInput value={currentStock} onChange={setCurrentStock} />
              <input type="hidden" name="currentStock" value={currentStock} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Precio de Compra Inicial</label>
              <NumericInput value={purchasePrice} onChange={setPurchasePrice} />
              <input type="hidden" name="purchasePrice" value={purchasePrice} />
            </div>
          </>
        )}
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
              Se guardará como: {getNormalizedUnit(displayUnit)}
            </p>
          )}
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
