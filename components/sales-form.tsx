'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, Minus, Trash2, ShoppingBag, User } from 'lucide-react'
import { createSale, updateSale } from '@/lib/actions/sales'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { sileo as toast } from 'sileo'

type Product = {
  id: string
  name: string
  salePrice: any
  recipeItems: { id: string; supply: { name: string }; quantityRequired: any; unit: string }[]
}

type Customer = {
  id: string
  name: string
}

interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export function SaleForm({
  products,
  customers,
  sale,
  onSuccess
}: {
  products: Product[];
  customers: Customer[];
  sale?: any;
  onSuccess?: () => void;
}) {
  const [items, setItems] = useState<SaleItem[]>(
    sale?.saleItems.map((si: any) => ({
      productId: si.productId,
      productName: si.product?.name || 'Producto',
      quantity: Number(si.quantity),
      unitPrice: Number(si.unitPrice)
    })) || []
  )
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    const existingItemIndex = items.findIndex(item => item.productId === selectedProduct.id)

    if (existingItemIndex !== -1) {
      // Si ya existe, actualizamos la cantidad
      const newItems = [...items]
      newItems[existingItemIndex].quantity += quantity
      setItems(newItems)
    } else {
      // Si no existe, lo añadimos
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

  const [indexToRemove, setIndexToRemove] = useState<number | null>(null)

  const removeItem = () => {
    if (indexToRemove === null) return
    setItems(items.filter((_, i) => i !== indexToRemove))
    setIndexToRemove(null)
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (formData: FormData) => {
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
              description: 'Se sincronizará automáticamente cuando vuelva la conexión a internet.' 
            })
            setItems([])
            onSuccess?.()
          } catch (error) {
            toast.error({ title: 'Error al guardar localmente' })
          }
          return
        }

        await createSale(formData)
        setItems([])
        onSuccess?.()
      })
    }
  }

  return (
    <form action={handleSubmit}>
      {sale ? (
        // Edit mode: flat layout inside the modal, no Card wrapper
        <div className="space-y-6">
          {/* Item Adder Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Producto</label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="h-11 rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-primary/10">
                    <SelectGroup>
                      <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Tus Productos</SelectLabel>
                      {products.map(p => {
                        const price = Number(p.salePrice)
                        const formattedPrice = price >= 1000
                          ? `${(price / 1000) % 1 === 0 ? price / 1000 : (price / 1000).toFixed(1)}k`
                          : price.toString()

                        return (
                          <SelectItem key={p.id} value={p.id} className="rounded-lg group">
                            <div className="flex justify-between items-center w-full gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs font-bold text-primary/60 group-hover:text-white group-data-highlighted:text-white transition-colors">
                                {formattedPrice}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1 md:flex-initial space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cant.</label>
                  <div className="flex items-center bg-background/60 rounded-lg border border-primary/5 p-1 h-11 shadow-sm">
                    <Button
                      disabled={quantity === 0}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                    >
                      <Minus size={14} />
                    </Button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity === 0 ? '0' : quantity.toString()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        const parsed = parseInt(val, 10)
                        setQuantity(isNaN(parsed) ? 0 : parsed)
                      }}
                      className="w-12 text-center font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      onFocus={(e) => e.target.select()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
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
                  className="h-11 w-11 rounded-lg shadow-lg shadow-primary/5 hover:shadow-primary/20 transition-all active:scale-95 shrink-0"
                >
                  <Plus size={20} strokeWidth={3} />
                </Button>
              </div>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-1.5 ml-1">Insumos Requeridos</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.recipeItems.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic ml-1">Sin receta definida</span>
                  ) : (
                    selectedProduct.recipeItems.map(ri => (
                      <span key={ri.id} className="text-[10px] font-bold px-2 py-0.5 bg-background/50 border border-primary/5 text-primary/70 rounded-md">
                        {ri.supply.name}: {Number(ri.quantityRequired) * quantity} {ri.unit}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Items List (Receipt Style) */}
          {items.length > 0 && (
            <div className="border-t border-border/10">
              <div className="max-h-[300px] overflow-y-auto px-6 py-4 space-y-3 bg-primary/1">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatCurrency(item.unitPrice)} / u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIndexToRemove(index)}
                        className="h-7 w-7 p-0 rounded-md transition-all hover:bg-rose-500/10 hover:text-rose-500 group"
                      >
                        <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkout Section */}
          {items.length > 0 && (
            <div className="p-6 pt-0 space-y-4">
              <div className="p-4 bg-primary rounded-lg shadow-xl shadow-primary/20 text-white flex justify-between items-end relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl" />

                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Total a Cobrar</p>
                  <h2 className="text-4xl font-extrabold tracking-tighter">
                    {formatCurrency(total)}
                  </h2>
                </div>
                <ShoppingBag size={40} className="opacity-20 -mr-2 relative z-10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative group md:col-span-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors pointer-events-none">
                    <User size={18} />
                  </div>
                  <Select name="customerId" defaultValue={sale?.customerId || "none"}>
                    <SelectTrigger className="h-12 pl-10 rounded-lg bg-background border-border/40 hover:border-primary/20 transition-all">
                      <SelectValue placeholder="Venta General / Consumidor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="none">Venta General (Sin Cliente)</SelectItem>
                      <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Tipos Comunes</SelectLabel>
                        <SelectItem value="none_informal">Vendedor Informal</SelectItem>
                        <SelectItem value="none_tienda">Tienda / Almacén</SelectItem>
                        <SelectItem value="none_restaurante">Restaurante / Cafetería</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Clientes Registrados</SelectLabel>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="md:col-span-1 h-12 rounded-lg text-md font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 bg-primary text-white"
                >
                  {isPending ? 'Procesando...' : sale ? 'Actualizar' : 'Vender'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Standalone mode: Card wrapper for the 'Nueva Venta' section
        <Card className="rounded-lg overflow-hidden border-primary/20 bg-primary/2 shadow-xl backdrop-blur-md">
          <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-border/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <CardTitle className="text-xl">Nueva Venta</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Item Adder Section */}
            <div className="p-6 space-y-2">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Producto</label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="h-11 rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-primary/10">
                      <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Tus Productos</SelectLabel>
                        {products.map(p => {
                          const price = Number(p.salePrice)
                          const formattedPrice = price >= 1000
                            ? `${(price / 1000) % 1 === 0 ? price / 1000 : (price / 1000).toFixed(1)}k`
                            : price.toString()
                          return (
                            <SelectItem key={p.id} value={p.id} className="rounded-lg group">
                              <div className="flex justify-between items-center w-full gap-2">
                                <span>{p.name}</span>
                                <span className="text-xs font-bold text-primary/60 group-hover:text-white group-data-highlighted:text-white transition-colors">{formattedPrice}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 md:flex-initial space-y-1.5 mb-[5px]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cant.</label>
                    <div className="flex items-center justify-between bg-background/60 rounded-lg border border-primary/5 p-1 h-11 shadow-sm">
                      <Button disabled={quantity === 0} type="button" variant="ghost" size="icon" onClick={() => setQuantity(Math.max(0, quantity - 1))} className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90">
                        <Minus size={14} />
                      </Button>
                      <input type="text" inputMode="numeric" value={quantity === 0 ? '0' : quantity.toString()} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); const parsed = parseInt(val, 10); setQuantity(isNaN(parsed) ? 0 : parsed) }} className="w-12 text-center font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-0" onFocus={(e) => e.target.select()} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90">
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  <Button type="button" onClick={addItem} variant="secondary" size="icon" className="h-11 w-11 mb-[5px] rounded-lg shadow-lg shadow-primary/5 hover:shadow-primary/20 transition-all active:scale-95 shrink-0">
                    <Plus size={20} strokeWidth={3} />
                  </Button>
                </div>
              </div>
              {selectedProduct && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-1.5 ml-1">Insumos Requeridos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.recipeItems.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground italic ml-1">Sin receta definida</span>
                    ) : (
                      selectedProduct.recipeItems.map(ri => (
                        <span key={ri.id} className="text-[10px] font-bold px-2 py-0.5 bg-background/50 border border-primary/5 text-primary/70 rounded-md">
                          {ri.supply.name}: {Number(ri.quantityRequired) * quantity} {ri.unit}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-border/10">
                <div className="max-h-[300px] overflow-y-auto px-6 py-4 space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group animate-in slide-in-from-left-2 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">{item.quantity}x</div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-none">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatCurrency(item.unitPrice)} / u</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIndexToRemove(index)} className="h-7 w-7 p-0 rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-500 group">
                          <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {items.length > 0 && (
              <div className="p-6 pt-0 space-y-4">
                <div className="p-4 bg-primary rounded-lg shadow-xl shadow-primary/20 text-white flex justify-between items-end relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Total a Cobrar</p>
                    <h2 className="text-4xl font-extrabold tracking-tighter">{formatCurrency(total)}</h2>
                  </div>
                  <ShoppingBag size={40} className="opacity-20 -mr-2 relative z-10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative group md:col-span-2">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors pointer-events-none">
                      <User size={18} />
                    </div>
                    <Select name="customerId" defaultValue={sale?.customerId || "none"}>
                      <SelectTrigger className="h-12 pl-10 rounded-lg bg-background border-border/40 hover:border-primary/20 transition-all">
                        <SelectValue placeholder="Venta General / Consumidor" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="none">Venta General (Sin Cliente)</SelectItem>
                        <SelectGroup>
                          <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Tipos Comunes</SelectLabel>
                          <SelectItem value="none_informal">Vendedor Informal</SelectItem>
                          <SelectItem value="none_tienda">Tienda / Almacén</SelectItem>
                          <SelectItem value="none_restaurante">Restaurante / Cafetería</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">Clientes Registrados</SelectLabel>
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isPending} className="md:col-span-1 h-12 rounded-lg text-md font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 bg-primary text-white">
                    {isPending ? 'Procesando...' : 'Vender'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <ConfirmationModal
        isOpen={indexToRemove !== null}
        onClose={() => setIndexToRemove(null)}
        onConfirm={removeItem}
        title="¿Quitar producto?"
        description="Este producto será removido de la lista actual de la venta."
      />
    </form>
  )
}