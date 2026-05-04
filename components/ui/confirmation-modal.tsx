'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  variant = 'danger',
  loading = false
}: ConfirmationModalProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isMounted || !isOpen) return null

  const variantStyles = {
    danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    primary: "bg-primary hover:bg-primary/90 shadow-primary/20"
  }

  const iconStyles = {
    danger: "bg-rose-500/10 text-rose-500",
    warning: "bg-amber-500/10 text-amber-500",
    primary: "bg-primary/10 text-primary"
  }

  return createPortal(
    <div className="fixed inset-0 z-10001 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-card rounded-lg shadow-2xl overflow-hidden border border-border/10 animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center mb-6 shadow-inner", iconStyles[variant])}>
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col w-full gap-3">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn("h-12 font-bold rounded-lg shadow-lg transition-all active:scale-95", variantStyles[variant])}
            >
              {loading ? 'Procesando...' : confirmText}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="h-12 font-bold rounded-lg text-muted-foreground hover:bg-muted"
            >
              {cancelText}
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>,
    document.body
  )
}
