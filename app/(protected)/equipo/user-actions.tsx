'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sileo as toast } from 'sileo'
import { deleteUser, updateUserRole } from '@/lib/actions/users'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function UserRoleSelect({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    setLoading(true)
    const res = await updateUserRole(user.id, newRole)
    if (res.success) {
      toast.success({ title: 'Rol actualizado exitosamente' })
    } else {
      toast.error({ title: res.error || 'Error al actualizar el rol' })
    }
    setLoading(false)
  }

  return (
    <Select value={user.role} onValueChange={handleRoleChange} disabled={loading}>
      <SelectTrigger className="h-8 w-36 text-xs rounded-lg border-border/50 bg-background/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg border-border/50 shadow-xl">
        <SelectItem value="employee" className="text-xs">Empleado</SelectItem>
        <SelectItem value="manager" className="text-xs">Gerente</SelectItem>
        <SelectItem value="admin" className="text-xs font-bold text-primary">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function DeleteUserButton({ id, currentUserId }: { id: string, currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (id === currentUserId) {
      toast.error({ title: 'No puedes eliminar tu propia cuenta' })
      return
    }

    setLoading(true)
    const res = await deleteUser(id)
    if (res.success) {
      toast.success({ title: 'Usuario eliminado del equipo' })
      setOpen(false)
    } else {
      toast.error({ title: res.error || 'Error al eliminar usuario' })
    }
    setLoading(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
        disabled={id === currentUserId}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={14} />
      </Button>

      <ConfirmationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar usuario?"
        description="El usuario perderá el acceso a la plataforma de inmediato. Los registros creados por él se mantendrán intactos."
        variant="danger"
        loading={loading}
      />
    </>
  )
}
