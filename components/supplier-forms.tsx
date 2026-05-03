'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSupplier, updateSupplier } from '@/lib/actions/suppliers'

export function SupplierForm({ 
  supplier, 
  onSuccess 
}: { 
  supplier?: any
  onSuccess?: () => void
}) {
  const action = supplier ? updateSupplier.bind(null, supplier.id) : createSupplier

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
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre de la Empresa</label>
          <Input name="name" defaultValue={supplier?.name} required placeholder="Ej: Distribuidora S.A.S" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teléfono de Contacto</label>
          <Input name="phone" defaultValue={supplier?.phone ?? ''} placeholder="+57 300 000 0000" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Correo de Ventas</label>
          <Input name="email" type="email" defaultValue={supplier?.email ?? ''} placeholder="ventas@proveedor.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección Física</label>
          <Input name="address" defaultValue={supplier?.address ?? ''} placeholder="Ej: Zona Industrial #12-34" className="h-12" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-10 h-12 rounded-lg shadow-lg shadow-primary/20">
          {supplier ? 'Actualizar Proveedor' : 'Registrar Proveedor'}
        </Button>
      </div>
    </form>
  )
}
