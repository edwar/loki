'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

interface DeleteSaleButtonProps {
  id: string
  onDelete: (id: string) => void
  loading?: boolean
}

export function DeleteSaleButton({ id, onDelete, loading }: DeleteSaleButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    onDelete(id)
    setShowConfirm(false)
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-lg transition-all text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 group"
      >
        <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
      </Button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="¿Eliminar esta venta?"
        description="Esta acción no se puede deshacer. El registro de la venta será eliminado permanentemente y el stock de los productos no será devuelto automáticamente."
        variant="danger"
      />
    </>
  )
}
