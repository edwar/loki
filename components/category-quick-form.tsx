'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sileo as toast } from 'sileo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Tag } from 'lucide-react'

interface CategoryQuickFormProps {
  type?: 'supply' | 'product'
  onCreated: (categoryId: string) => void
  onClose: () => void
}

export function CategoryQuickForm({ type = 'supply', onCreated, onClose }: CategoryQuickFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear categoría')
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      onCreated(data.id)
    } catch (err) {
      toast.error({ title: err instanceof Error ? err.message : 'Error al crear categoría' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">Nueva Categoría</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Al terminar volverás a Nuevo Insumo
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} className="w-10 h-10 p-0">
          <X size={20} />
        </Button>
      </div>

      <div className="py-6 space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Lácteos"
          className="h-11"
          autoFocus
          required
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !name.trim()} className="flex-1 h-12 font-semibold">
          <Tag size={16} className="mr-2" />
          {loading ? 'Creando...' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  )
}
