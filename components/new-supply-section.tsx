'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupplyForm } from './supply-forms'
import { Plus, ChevronDown } from 'lucide-react'

export function NewSupplySection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="rounded-lg border-primary/20 bg-primary/2 overflow-hidden transition-all duration-500 group p-0">
      <CardHeader 
        className={`px-4 py-4 mb-0 cursor-pointer hover:bg-primary/5 transition-colors ${isOpen ? 'border-b border-primary/10' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <CardTitle>Agregar Nuevo Insumo</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Click para {isOpen ? 'ocultar' : 'registrar un nuevo insumo en la bodega'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
            <ChevronDown
              size={18}
              className={`text-muted-foreground transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="px-4 py-6 animate-in fade-in slide-in-from-top-1 duration-300">
          <SupplyForm supply={null} onSuccess={() => setIsOpen(false)} />
        </CardContent>
      )}
    </Card>
  )
}
