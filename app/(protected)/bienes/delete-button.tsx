'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este bien?')) return

    try {
      await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4 text-rose-500" />
    </button>
  )
}