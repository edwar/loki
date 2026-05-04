'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteSale } from '@/lib/actions/sales'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

export function DeleteSaleButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteSale(id)
      setShowConfirm(false)
    } catch (error) {
      console.error('Error deleting sale:', error)
    } finally {
      setLoading(false)
    }
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
      />
    </>
  )
}
