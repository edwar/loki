'use client'

import { useState } from 'react'
import { Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { SaleForm } from '@/components/sales-form'

interface EditSaleModalProps {
  sale: any
  products: any[]
  customers: any[]
}

export function EditSaleModal({ sale, products, customers }: EditSaleModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-lg transition-all text-muted-foreground hover:bg-primary/10 hover:text-primary group"
      >
        <Edit2 className='w-4 h-4 group-hover:text-primary' />
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-lg transition-all text-muted-foreground hover:bg-primary/10 hover:text-primary group"
      >
        <Edit2 className='w-4 h-4 group-hover:text-primary' />
      </Button>

      {createPortal(
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-card rounded-lg shadow-2xl overflow-hidden border border-border/10 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group">
                  <Edit2 className='w-4 h-4 group-hover:text-primary' />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Editar Venta</h3>
                  <p className="text-muted-foreground text-sm">Modifica los productos o el cliente de esta transacción.</p>
                </div>
              </div>

              <SaleForm
                products={products}
                customers={customers}
                sale={sale}
                onSuccess={() => setIsOpen(false)}
              />
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
