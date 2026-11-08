'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const MODAL_EXIT_MS = 200

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mantiene el modal montado durante la animación de salida
  const [render, setRender] = useState(isOpen)
  useEffect(() => {
    if (isOpen) {
      setRender(true)
      return
    }
    const t = setTimeout(() => setRender(false), MODAL_EXIT_MS)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !render) return null
  const closing = !isOpen

  return createPortal(
    <div className={cn('fixed inset-0 z-9999 flex items-center justify-center', closing && 'pointer-events-none')}>
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          closing ? 'modal-backdrop-out' : 'modal-backdrop-in'
        )}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full max-w-3xl mx-4 max-h-[90vh] bg-card rounded-xl shadow-2xl flex flex-col',
          closing ? 'modal-panel-out' : 'modal-panel-in',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-border">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}