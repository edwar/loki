'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, X, Building2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { PropertyForm } from '@/components/property-form'
import { useRouter } from 'next/navigation'

export function ModalWrapper({ property }: { property?: any }) {
  const [showForm, setShowForm] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const modalContent = showForm ? (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowForm(false)} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-border/10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-border/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center shadow-inner">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Editar Información del Bien</h2>
              <p className="text-sm text-muted-foreground font-medium">Actualiza los detalles técnicos y de valoración de tu activo</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(false)}
            className="absolute top-8 right-8 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <PropertyForm
            property={property}
            onSuccess={() => {
              setShowForm(false)
              router.refresh()
            }}
          />
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowForm(true)}
        className="w-9 h-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all group"
      >
        <Edit2 className='w-4 h-4 group-hover:text-primary' />
      </Button>

      {createPortal(modalContent, document.body)}
    </>
  )
}