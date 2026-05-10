'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Check, Trash2, Plus, Minus, ShoppingCart, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { DatePicker } from '@/components/ui/date-picker'

interface PurchaseItem {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  precioUnitario: number
  subtotal: number
}

import { UNIDADES } from '@/lib/constants'

interface Supplier {
  id: string
  name: string
}

interface PurchaseFormProps {
  suppliers: Supplier[]
  onSuccess?: () => void
  onClose?: () => void
}

export function PurchaseForm({ suppliers, onSuccess, onClose }: PurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: crypto.randomUUID(), nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }
  ])
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(0)
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null)
  const [localSuppliers, setLocalSuppliers] = useState(suppliers)

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const descuento = subtotal * (descuentoPorcentaje / 100)
    const subtotalConDescuento = subtotal - descuento
    const impuesto = subtotalConDescuento * (impuestoPorcentaje / 100)
    return { subtotal, total: subtotalConDescuento + impuesto }
  }

  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }])
  }

  const confirmRemoveItem = () => {
    if (indexToRemove === null) return
    const newItems = items.filter((_, i) => i !== indexToRemove)
    setItems(newItems.length > 0 ? newItems : [{ id: crypto.randomUUID(), nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }])
    setIndexToRemove(null)
  }

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'cantidad' || field === 'precioUnitario') {
      const rawQty = typeof newItems[index].cantidad === 'string' ? newItems[index].cantidad : String(newItems[index].cantidad)
      const qty = parseFloat(rawQty.replace(/\./g, '')) || 0
      const rawPrice = typeof newItems[index].precioUnitario === 'string' ? newItems[index].precioUnitario : String(newItems[index].precioUnitario)
      const price = parseFloat(rawPrice.replace(/\./g, '')) || 0
      newItems[index].subtotal = qty * price
    }

    setItems(newItems)
  }

  const handleSavePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const { subtotal, total } = calculateTotal()

      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName,
          totalAmount: total,
          subtotal,
          discountPercentage: descuentoPorcentaje,
          taxPercentage: impuestoPorcentaje,
          purchaseDate: new Date(purchaseDate),
          items: items.map((item) => {
            const rawQty = typeof item.cantidad === 'string' ? item.cantidad : String(item.cantidad)
            const rawPrice = typeof item.precioUnitario === 'string' ? item.precioUnitario : String(item.precioUnitario)
            return {
              supplyName: item.nombre,
              quantity: parseFloat(rawQty.replace(/\./g, '')) || 0,
              unit: item.unidad || 'unidad',
              unitPrice: parseFloat(rawPrice.replace(/\./g, '')) || 0,
              subtotal: item.subtotal,
            }
          }),
        }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la compra')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSupplierName('')
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setItems([{ id: crypto.randomUUID(), nombre: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }])
    setDescuentoPorcentaje(0)
    setImpuestoPorcentaje(0)
    setError(null)
  }

  const handleSupplierCreate = async (name: string) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (response.ok) {
        const newSupplier = await response.json()
        setLocalSuppliers(prev => [...prev, newSupplier])
        setSupplierName(newSupplier.name)
      }
    } catch (err) {
      console.error('Error creating supplier:', err)
    }
  }

  const { subtotal, total } = calculateTotal()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">Registrar Compra</h2>
          <p className="text-sm text-muted-foreground mt-1">Agrega insumos al inventario</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {/* Proveedor y Fecha */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Proveedor</label>
            <Combobox
              options={localSuppliers.map(s => ({ value: s.id, label: s.name }))}
              value={localSuppliers.find(s => s.name === supplierName)?.id || supplierName}
              onValueChange={(val) => {
                const s = localSuppliers.find(opt => opt.id === val)
                if (s) {
                  setSupplierName(s.name)
                } else {
                  setSupplierName(val)
                  handleSupplierCreate(val)
                }
              }}
              placeholder="Buscar o crear..."
              className="w-full"
              allowCustom
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha</label>
            <DatePicker
              value={purchaseDate}
              onChange={(date) => setPurchaseDate(date)}
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Items</h3>
            <Button onClick={handleAddItem} size="sm" className="h-9 rounded-lg">
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
              <div className="col-span-4">Producto</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-2">Unidad</div>
              <div className="col-span-3">Precio</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="p-3 bg-muted/30 rounded-lg space-y-3">
                {/* Mobile: stacked layout */}
                <div className="md:hidden space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Producto</label>
                    <Input
                      value={item.nombre}
                      onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                      placeholder="Nombre del insumo"
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cantidad</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.cantidad.toLocaleString('es-CO')}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '')
                          handleItemChange(index, 'cantidad', parseInt(raw, 10) || 0)
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-11 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unidad</label>
                      <Select value={item.unidad || 'unidad'} onValueChange={(v) => handleItemChange(index, 'unidad', v)}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <div className="col-span-4 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Precio</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.precioUnitario.toLocaleString('es-CO')}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '')
                          handleItemChange(index, 'precioUnitario', parseFloat(raw) || 0)
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-11 text-right"
                      />
                    </div>
                    <button
                      onClick={() => setIndexToRemove(index)}
                      className="h-11 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.subtotal > 0 && (
                    <div className="text-right text-xs text-muted-foreground">
                      Subtotal: <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  )}
                </div>

                {/* Desktop: inline layout */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      value={item.nombre}
                      onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                      placeholder="Nombre del insumo"
                      className="h-11"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={item.cantidad.toLocaleString('es-CO')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, '')
                        handleItemChange(index, 'cantidad', parseInt(raw, 10) || 0)
                      }}
                      onFocus={(e) => e.target.select()}
                      className="h-11 text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select value={item.unidad || 'unidad'} onValueChange={(v) => handleItemChange(index, 'unidad', v)}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={item.precioUnitario.toLocaleString('es-CO')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, '')
                        handleItemChange(index, 'precioUnitario', parseFloat(raw) || 0)
                      }}
                      onFocus={(e) => e.target.select()}
                      className="h-11 text-right"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => setIndexToRemove(index)}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Descuento (%)</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setDescuentoPorcentaje(Math.max(0, descuentoPorcentaje - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-all">
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={descuentoPorcentaje}
                onChange={(e) => setDescuentoPorcentaje(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center text-sm font-bold bg-transparent border-none focus:outline-none"
              />
              <button onClick={() => setDescuentoPorcentaje(Math.min(100, descuentoPorcentaje + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-all">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">IVA (%)</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setImpuestoPorcentaje(Math.max(0, impuestoPorcentaje - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-all">
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={impuestoPorcentaje}
                onChange={(e) => setImpuestoPorcentaje(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center text-sm font-bold bg-transparent border-none focus:outline-none"
              />
              <button onClick={() => setImpuestoPorcentaje(Math.min(100, impuestoPorcentaje + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-all">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button onClick={resetForm} variant="ghost" className="flex-1 h-12 rounded-lg">
          Limpiar
        </Button>
        <Button
          onClick={handleSavePurchase}
          disabled={loading || !supplierName || items.every(i => !i.nombre)}
          className="flex-1 h-12 font-semibold rounded-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2"><span className="animate-spin"><Plus size={16} /></span>Guardando...</span>
          ) : (
            <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Guardar Compra</span>
          )}
        </Button>
      </div>

      <ConfirmationModal
        isOpen={indexToRemove !== null}
        onClose={() => setIndexToRemove(null)}
        onConfirm={confirmRemoveItem}
        title="¿Quitar item?"
        description="Este item será removido de la orden de compra."
      />
    </div>
  )
}