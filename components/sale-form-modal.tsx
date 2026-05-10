'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, Trash2, X } from 'lucide-react'
import { createSale, updateSale } from '@/lib/actions/sales'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { sileo as toast } from 'sileo'

interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface SaleFormModalProps {
  products: any[]
  customers: any[]
  sale?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function SaleFormModal({ products, customers, sale, onSuccess, onClose }: SaleFormModalProps) {
  const [items, setItems] = useState<SaleItem[]>(
    sale?.saleItems?.map((si: any) => ({
      productId: si.productId,
      productName: si.product?.name || 'Producto',
      quantity: Number(si.quantity),
      unitPrice: Number(si.unitPrice)
    })) || []
  )
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null)

  const selectedProduct = products.find((p: any) => p.id === selectedProductId)

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const existingItemIndex = items.findIndex(item => item.productId === selectedProduct.id)

    if (existingItemIndex !== -1) {
      const newItems = [...items]
      newItems[existingItemIndex].quantity += quantity
      setItems(newItems)
    } else {
      setItems([...items, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: Number(selectedProduct.salePrice)
      }])
    }

    setSelectedProductId('')
    setQuantity(1)
  }

  const removeItem = () => {
    if (indexToRemove === null) return
    setItems(items.filter((_, i) => i !== indexToRemove))
    setIndexToRemove(null)
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const itemsJson = JSON.stringify(items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice
    })))
    formData.set('items', itemsJson)

    if (sale) {
      startTransition(async () => {
        if (!navigator.onLine) {
          toast.error({ title: 'No puedes editar ventas en modo offline' })
          return
        }
        await updateSale(sale.id, formData)
        onSuccess?.()
        onClose?.()
      })
    } else {
      startTransition(async () => {
        if (!navigator.onLine) {
          try {
            const { savePendingSale } = await import('@/lib/offline-sync')
            await savePendingSale({
              customerId: formData.get('customerId') as string,
              items: itemsJson
            })
            toast.warning({
              title: 'Venta Guardada Localmente',
              description: 'Se sincronizará automáticamente cuando vuelva la conexión.'
            })
            setItems([])
            onSuccess?.()
            onClose?.()
          } catch (error) {
            toast.error({ title: 'Error al guardar localmente' })
          }
          return
        }

        await createSale(formData)
        setItems([])
        onSuccess?.()
        onClose?.()
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{sale ? 'Editar Venta' : 'Nueva Venta'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sale ? 'Modifica los productos o el cliente' : 'Registra una nueva transacción'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 flex flex-col justify-end gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Producto</label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectGroup>
                    <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Tus Productos</SelectLabel>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id} className="rounded-lg">
                        <div className="flex justify-between items-center w-full gap-2">
                          <span>{p.name}</span>
                          <span className="text-xs font-bold text-primary/60">{formatCurrency(Number(p.salePrice))}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex flex-col justify-end gap-1 flex-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block h-5">Cant.</label>
                <div className="flex items-center rounded-lg border p-1 h-12">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    className="h-9 w-9 rounded-lg"
                  >
                    <Minus size={14} />
                  </Button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantity.toString()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      const parsed = parseInt(val, 10)
                      setQuantity(isNaN(parsed) ? 0 : parsed)
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full md:w-12 text-center font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-9 w-9 rounded-lg"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                onClick={addItem}
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-lg shrink-0"
              >
                <Plus size={20} strokeWidth={2.5} />
              </Button>
            </div>
          </div>

          {selectedProduct && selectedProduct.recipeItems && selectedProduct.recipeItems.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Insumos requeridos</p>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.recipeItems.map((ri: any) => (
                  <span key={ri.id} className="text-[11px] font-bold px-2 py-1 bg-background border border-border/50 rounded-md">
                    {ri.supply?.name}: {Number(ri.quantityRequired) * quantity} {ri.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Items</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3 md:items-end w-full md:w-auto">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="text-sm font-bold">{item.productName}</p>
                      <p className="text-[11px] text-muted-foreground">{formatCurrency(item.unitPrice)} / u</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    <button
                      type="button"
                      onClick={() => setIndexToRemove(index)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-primary rounded-lg text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total a Cobrar</p>
              <p className="text-3xl font-extrabold">{formatCurrency(total)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cliente (opcional)</label>
              <Select name="customerId" defaultValue={sale?.customerId || "none"}>
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Venta General / Consumidor" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="none">Venta General (Sin Cliente)</SelectItem>
                  <SelectGroup>
                    <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Clientes Registrados</SelectLabel>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

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
            disabled={isPending || items.length === 0}
            className="flex-1 h-12 font-semibold rounded-lg"
          >
            {isPending ? 'Procesando...' : sale ? 'Actualizar' : 'Vender'}
          </Button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={indexToRemove !== null}
        onClose={() => setIndexToRemove(null)}
        onConfirm={removeItem}
        title="¿Quitar producto?"
        description="Este producto será removido de la lista actual de la venta."
      />
    </div>
  )
}