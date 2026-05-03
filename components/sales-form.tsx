'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { createSale } from '@/lib/actions/sales'

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

export function NewSaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return

    setItems([...items, {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: Number(selectedProduct.salePrice)
    }])

    setSelectedProductId('')
    setQuantity(1)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = (formData: FormData) => {
    formData.set('items', JSON.stringify(items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice
    }))))
    startTransition(() => createSale(formData))
    setItems([])
  }

  return (
    <form action={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Nueva Venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Producto</label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(Number(p.salePrice))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addItem} variant="outline">
                <Plus size={16} /> Agregar
              </Button>
            </div>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-zinc-50 rounded text-sm">
              <p className="font-medium mb-1">Receta (se descontará del inventario):</p>
              <div className="text-zinc-600">
                {selectedProduct.recipeItems.length === 0 ? (
                  <span className="text-zinc-400">Sin receta definida</span>
                ) : (
                  selectedProduct.recipeItems.map(ri => (
                    <span key={ri.id}>{ri.supply.name}: {Number(ri.quantityRequired) * quantity} {ri.unit}, </span>
                  ))
                )}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Producto</th>
                    <th className="p-3 text-left font-medium">Cantidad</th>
                    <th className="p-3 text-left font-medium">Precio</th>
                    <th className="p-3 text-left font-medium">Subtotal</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.productName}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      <td className="p-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xl font-bold">Total: {formatCurrency(total)}</div>
              <div className="flex gap-2">
                <Select name="customerId" defaultValue="none">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Cliente (opcional)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Registrar Venta'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}