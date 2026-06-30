'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { formatCurrency } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { createInvoice, updateInvoice } from '@/lib/actions/invoices'
import { useQuery } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  salePrice: number
  currentStock: number
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  tin: string | null
}

interface BusinessSettings {
  businessName: string
  tin: string | null
  taxRate: number
}

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customers: Customer[]
  products: Product[]
  businessSettings: BusinessSettings | null
  invoice?: any
}

interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export function InvoiceFormModal({ isOpen, onClose, onSuccess, customers, products, businessSettings, invoice }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [draftQuantities, setDraftQuantities] = useState<Record<string, string>>({})

  const isEditing = !!invoice
  const taxRate = businessSettings?.taxRate ?? 16

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await fetch('/api/payment-methods')
      if (!res.ok) return []
      return res.json()
    },
  })

  const customerOptions = [
    { value: 'publico', label: 'Público General' },
    ...customers.map(c => ({ value: c.id, label: c.name }))
  ]

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  useEffect(() => {
    if (isOpen && invoice) {
      setSelectedCustomerId(invoice.customerId || 'publico')
      setDraftQuantities({})
      if (invoice.invoiceItems?.length > 0) {
        const mapped = invoice.invoiceItems.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          productId: item.productId || '',
          productName: item.productName,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
        setItems(mapped)
        const drafts: Record<string, string> = {}
        mapped.forEach((i: InvoiceItem) => { drafts[i.id] = i.quantity.toString() })
        setDraftQuantities(drafts)
      }
    } else if (isOpen && !invoice) {
      setSelectedCustomerId('')
      setItems([])
      setDraftQuantities({})
    }
  }, [isOpen, invoice])

  const productOptions = products
    .filter(p => !items.find(i => i.productId === p.id))
    .map(p => ({ value: p.id, label: p.name }))

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const addItem = (product: Product) => {
    const id = crypto.randomUUID()
    setItems([...items, {
      id,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.salePrice
    }])
    setDraftQuantities(prev => ({ ...prev, [id]: '1' }))
  }

  const updateItem = (id: string, field: string, value: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        return updated
      }
      return item
    }))
  }

  const removeItem = (id: string) => {
    setItemToRemove(id)
  }

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      setItems(items.filter(item => item.id !== itemToRemove))
      setItemToRemove(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (items.length === 0) {
      alert('Agrega al menos un producto')
      return
    }

    const formData = new FormData(e.currentTarget)

    const customerName = selectedCustomerId === 'publico'
      ? 'Público General'
      : selectedCustomer?.name || 'Público General'

    formData.set('customerId', selectedCustomerId === 'publico' ? '' : selectedCustomerId)
    formData.set('customerName', customerName)
    formData.set('customerTin', selectedCustomer?.tin || '')
    formData.set('customerAddress', selectedCustomer?.address || '')
    formData.set('customerEmail', selectedCustomer?.email || '')
    formData.set('paymentMethod', paymentMethod)
    formData.set('items', JSON.stringify(items.map(({ id, productId, productName, quantity, unitPrice }) => ({
      productId, productName, quantity, unitPrice
    }))))
    formData.set('taxRate', taxRate.toString())

    setLoading(true)
    try {
      if (isEditing && invoice) {
        await updateInvoice(invoice.id, formData)
      } else {
        await createInvoice(formData)
      }
      onSuccess()
    } catch (error) {
      console.error(error)
      alert('Error al guardar factura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Factura' : 'Nueva Factura'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <Combobox
              options={customerOptions}
              value={selectedCustomerId}
              labelCreate="Crear nuevo cliente"
              onValueChange={setSelectedCustomerId}
              placeholder="Seleccionar cliente..."
              emptyMessage="No se encontraron clientes"
              allowCustom
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Pago</label>
            {paymentMethods.length > 8 ? (
              <Combobox
                options={paymentMethods.map((pm: any) => ({ value: pm.name, label: pm.name }))}
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                placeholder="Seleccionar..."
                className="w-full"
              />
            ) : (
              <Select name="paymentMethod" required value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm: any) => (
                    <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
            <div className="mb-4">
              <div className="w-full">
                <Combobox
                  options={productOptions}
                  value=""
                  onValueChange={(val) => {
                    const product = products.find(p => p.id === val)
                    if (product) addItem(product)
                  }}
                  placeholder="Buscar producto..."
                  className="w-full"
                />
              </div>
            </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Agrega productos a la factura
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2">Cantidad</div>
                <div className="col-span-2">Precio</div>
                <div className="col-span-2">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 font-semibold text-sm">{item.productName}</div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={draftQuantities[item.id] ?? item.quantity}
                      onChange={(e) => {
                        const raw = e.target.value
                        setDraftQuantities(prev => ({ ...prev, [item.id]: raw }))
                        if (raw !== '') {
                          const parsed = parseInt(raw)
                          if (!isNaN(parsed) && parsed >= 1) {
                            updateItem(item.id, 'quantity', parsed)
                          }
                        }
                      }}
                      onBlur={() => {
                        const draft = draftQuantities[item.id]
                        if (!draft || draft === '') {
                          setDraftQuantities(prev => ({ ...prev, [item.id]: '1' }))
                          updateItem(item.id, 'quantity', 1)
                        }
                      }}
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </div>
                  <div className="col-span-2 text-sm font-medium text-center py-1">
                    {formatCurrency(item.unitPrice)}
                  </div>
                  <div className="col-span-2 text-sm font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <Textarea
            name="notes"
            placeholder="Notas adicionales..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading || items.length === 0}>
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Factura' : 'Crear Factura'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}