'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSupply, updateSupply } from '@/lib/actions/supplies'
import { UNIDADES } from '@/lib/constants'

export function SupplyForm({ 
  supply, 
  suppliers,
  onSuccess 
}: { 
  supply?: any
  suppliers: { id: string, name: string }[]
  onSuccess?: () => void
}) {
  const [currentStock, setCurrentStock] = useState(supply?.currentStock ?? 0)
  const [minStock, setMinStock] = useState(supply?.minStock ?? 0)
  const [purchasePrice, setPurchasePrice] = useState(supply?.purchasePrice ?? 0)
  
  const action = supply ? updateSupply.bind(null, supply.id) : createSupply

  return (
    <form 
      action={async (formData) => {
        await action(formData)
        onSuccess?.()
      }} 
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre del Insumo</label>
          <Input name="name" defaultValue={supply?.name} required placeholder="Ej: Harina de Trigo" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</label>
          <Input name="category" defaultValue={supply?.category ?? ''} placeholder="Ej: Abarrotes" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock Actual</label>
          <NumericInput value={currentStock} onChange={setCurrentStock} />
          <input type="hidden" name="currentStock" value={currentStock} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock Mínimo</label>
          <NumericInput value={minStock} onChange={setMinStock} />
          <input type="hidden" name="minStock" value={minStock} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Precio de Compra</label>
          <NumericInput value={purchasePrice} onChange={setPurchasePrice} />
          <input type="hidden" name="purchasePrice" value={purchasePrice} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unidad</label>
          <Select name="unit" defaultValue={supply?.unit ?? 'unidad'}>
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES.map(u => (
                <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Proveedor Predeterminado</label>
          <Select name="supplierId" defaultValue={supply?.supplierId ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin proveedor</SelectItem>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-10 rounded-lg">
          {supply ? 'Guardar Cambios' : 'Crear Insumo'}
        </Button>
      </div>
    </form>
  )
}
