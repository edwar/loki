'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Loader2 } from 'lucide-react'
import { sileo as toast } from 'sileo'
import { createUser } from '@/lib/actions/users'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function NewUserModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
    }

    if (!data.name || !data.email || !data.password || !data.role) {
      toast.warning({ title: 'Completa todos los campos obligatorios' })
      setLoading(false)
      return
    }

    const result = await createUser(data)

    if (result.success) {
      toast.success({ title: 'Usuario creado exitosamente' })
      setOpen(false)
    } else {
      toast.error({ title: result.error || 'Error al crear usuario' })
    }

    setLoading(false)
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="rounded-lg h-10 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
      >
        <UserPlus size={16} className="mr-2" />
        Invitar Usuario
      </Button>

      <Dialog 
        isOpen={open} 
        onClose={() => setOpen(false)}
        title="Nuevo Usuario"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Nombre</label>
            <Input id="name" name="name" required className="h-10 rounded-lg bg-background/50" placeholder="Ej. Juan Pérez" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Correo Electrónico</label>
            <Input id="email" name="email" type="email" required className="h-10 rounded-lg bg-background/50" placeholder="juan@empresa.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Contraseña Temporal</label>
            <Input id="password" name="password" type="password" required className="h-10 rounded-lg bg-background/50" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Rol de Acceso</label>
            <Select name="role" defaultValue="employee">
              <SelectTrigger className="h-10 rounded-lg bg-background/50">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border/50 shadow-xl">
                <SelectItem value="employee" className="rounded-md focus:bg-accent cursor-pointer font-medium">Empleado (Básico)</SelectItem>
                <SelectItem value="manager" className="rounded-md focus:bg-accent cursor-pointer font-medium">Gerente (Intermedio)</SelectItem>
                <SelectItem value="admin" className="rounded-md focus:bg-accent cursor-pointer font-medium">Administrador (Total)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-lg h-10">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-lg h-10 font-bold">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
