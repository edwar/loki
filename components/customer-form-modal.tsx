'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCustomer, updateCustomer } from '@/lib/actions/customers'
import { PhoneInput } from '@/components/ui/phone-input'
import { X } from 'lucide-react'
import { useState } from 'react'

interface CustomerFormModalProps {
  customer?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function CustomerFormModal({ customer, onSuccess, onClose }: CustomerFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(customer?.name ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [address, setAddress] = useState(customer?.address ?? '')

  const isEditing = !!customer

  const submitHandler = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        await updateCustomer(customer.id, formData)
      } else {
        await createCustomer(formData)
      }
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
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos del cliente' : 'Agrega un nuevo cliente a tu base de datos'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form action={submitHandler} className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Juan Pérez"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Correo Electrónico</label>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teléfono</label>
            <PhoneInput
              name="phone"
              value={phone}
              onChange={setPhone}
              placeholder="300 000 0000"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección</label>
            <Input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle 123 #45-67"
              className="h-12"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium">
            {error}
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
            disabled={loading || !name.trim()}
            className="flex-1 h-12 font-semibold rounded-lg"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Registrar Cliente'}
          </Button>
        </div>
      </form>
    </div>
  )
}