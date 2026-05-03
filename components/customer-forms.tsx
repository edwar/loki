'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCustomer, updateCustomer } from '@/lib/actions/customers'
import { PhoneInput } from '@/components/ui/phone-input'

export function CustomerForm({ 
  customer, 
  onSuccess 
}: { 
  customer?: any
  onSuccess?: () => void
}) {
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer

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
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
          <Input name="name" defaultValue={customer?.name} required placeholder="Ej: Juan Pérez" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Correo Electrónico</label>
          <Input name="email" type="email" defaultValue={customer?.email ?? ''} placeholder="juan@ejemplo.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teléfono</label>
          <PhoneInput name="phone" defaultValue={customer?.phone ?? ''} placeholder="300 000 0000" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección</label>
          <Input name="address" defaultValue={customer?.address ?? ''} placeholder="Ej: Calle 123 #45-67" className="h-12" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-10 h-12 rounded-lg">
          {customer ? 'Actualizar Cliente' : 'Registrar Cliente'}
        </Button>
      </div>
    </form>
  )
}
