'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'mueble', label: 'Mueble' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'otro', label: 'Otro' },
]

export function BienesForm() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    purchaseValue: '',
    currentValue: '',
    purchaseDate: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          address: formData.address || null,
          purchaseValue: parseFloat(formData.purchaseValue) || 0,
          currentValue: parseFloat(formData.currentValue) || 0,
          purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : null,
          description: formData.description || null,
        }),
      })
      
      setShowForm(false)
      setFormData({
        name: '',
        type: '',
        address: '',
        purchaseValue: '',
        currentValue: '',
        purchaseDate: '',
        description: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-2xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Bien
      </Button>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-2xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Bien
      </Button>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Nuevo Bien
            </h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Oficina principal"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Tipo</label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Dirección</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Calle 123, Ciudad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Valor Compra</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchaseValue}
                  onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Valor Actual</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Fecha de Compra</label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional..."
                className="flex w-full px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl transition-all duration-200"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black"
              >
                {loading ? 'Guardando...' : 'Crear Bien'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}