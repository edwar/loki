'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
      setShowConfirm(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting property:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4 text-rose-500" />
      </button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="¿Eliminar este bien?"
        description="Esta acción no se puede deshacer. El bien será eliminado permanentemente de tu registro."
      />
    </>
  )
}