'use client'

import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/phone-input'
import { createSupplier, updateSupplier } from '@/lib/actions/suppliers'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useState } from 'react'

interface SupplierFormModalProps {
  supplier?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function SupplierFormModal({ supplier, onSuccess, onClose }: SupplierFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(supplier?.name ?? '')
  const [phone, setPhone] = useState(supplier?.phone ?? '')
  const [email, setEmail] = useState(supplier?.email ?? '')
  const [address, setAddress] = useState(supplier?.address ?? '')

  const isEditing = !!supplier

  const submitHandler = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        await updateSupplier(supplier.id, formData)
      } else {
        await createSupplier(formData)
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
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos del proveedor' : 'Agrega un nuevo proveedor a tu red'}
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
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre de la Empresa</label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Distribuidora S.A.S"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teléfono de Contacto</label>
            <PhoneInput
              name="phone"
              value={phone}
              onChange={setPhone}
              placeholder="300 000 0000"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Correo de Ventas</label>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ventas@proveedor.com"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección Física</label>
            <Input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Zona Industrial #12-34"
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
            variant="ghost"
            className="flex-1 h-12 rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 h-12 font-semibold rounded-lg"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Registrar Proveedor'}
          </Button>
        </div>
      </form>
    </div>
  )
}