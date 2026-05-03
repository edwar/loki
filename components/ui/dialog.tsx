'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  React.useEffect(() => {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 pb-0 flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold tracking-tight font-display">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-accent/50 text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
