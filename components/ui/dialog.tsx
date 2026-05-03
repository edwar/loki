'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-lg bg-card/80 backdrop-blur-xl border border-border/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 pb-4 flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold tracking-tight font-display">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative p-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}
