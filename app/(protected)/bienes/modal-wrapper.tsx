'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus, X, Building2, Calculator } from 'lucide-react'
import { createPortal } from 'react-dom'

const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno', depreciation: 0 },
  { value: 'edificio', label: 'Edificio', depreciation: 5 },
  { value: 'vehiculo', label: 'Vehículo', depreciation: 20 },
  { value: 'equipo', label: 'Equipo', depreciation: 10 },
  { value: 'mueble', label: 'Mueble', depreciation: 10 },
  { value: 'maquinaria', label: 'Maquinaria', depreciation: 10 },
  { value: 'otro', label: 'Otro', depreciation: 10 },
]

function calculateCurrentValue(purchaseValue: number, purchaseDate: string, annualDepreciation: number): number {
  if (!purchaseDate || purchaseValue <= 0) return purchaseValue
  
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const years = (now.getTime() - purchase.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  
  if (years <= 0) return purchaseValue
  
  // Depreciación compuesta: Valor * (1 - tasa)^años
  const currentValue = purchaseValue * Math.pow(1 - annualDepreciation / 100, years)
  return Math.max(0, currentValue)
}

function getYearsSincePurchase(purchaseDate: string): number {
  if (!purchaseDate) return 0
  const purchase = new Date(purchaseDate)
  const now = new Date()
  return Math.max(0, (now.getTime() - purchase.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export function ModalWrapper() {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [customDepreciation, setCustomDepreciation] = useState(false)
  const [calculatedValue, setCalculatedValue] = useState<number>(0)
  const [yearsElapsed, setYearsElapsed] = useState<number>(0)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    purchaseValue: '',
    depreciationRate: '10',
    purchaseDate: '',
    description: '',
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (formData.purchaseValue && formData.purchaseDate) {
      const rate = customDepreciation 
        ? parseFloat(formData.depreciationRate) || 0 
        : PROPERTY_TYPES.find(t => t.value === formData.type)?.depreciation || 10
      
      const value = calculateCurrentValue(
        parseFloat(formData.purchaseValue) || 0,
        formData.purchaseDate,
        rate
      )
      setCalculatedValue(value)
      setYearsElapsed(getYearsSincePurchase(formData.purchaseDate))
    } else {
      setCalculatedValue(0)
      setYearsElapsed(0)
    }
  }, [formData.purchaseValue, formData.purchaseDate, formData.type, formData.depreciationRate, customDepreciation])

  const defaultDepreciation = PROPERTY_TYPES.find(t => t.value === formData.type)?.depreciation || 10

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
          currentValue: calculatedValue,
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
        depreciationRate: '10',
        purchaseDate: '',
        description: '',
      })
      window.location.reload()
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <button 
        className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
      >
        <Plus size={18} />
        <span>Nuevo Bien</span>
      </button>
    )
  }

  const modalContent = showForm ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black dark:bg-white p-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white dark:text-black">Nuevo Bien</h2>
              <p className="text-sm text-white/60 dark:text-black/60">Agregar activo a tu empresa</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Nombre del Bien</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Camioneta Ford"
                className="h-12"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Tipo de Activo</label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.depreciation}% anual)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Dirección / Ubicación</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Av. Principal 123"
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Valor de Compra</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchaseValue}
                    onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                    placeholder="0.00"
                    className="h-12 pl-8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Fecha de Adquisición</label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Toggle depreciación personalizada */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customDep"
                checked={customDepreciation}
                onChange={(e) => setCustomDepreciation(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="customDep" className="text-sm text-gray-600 dark:text-slate-400">
                Usar tasa de depreciación diferente
              </label>
            </div>

            {customDepreciation && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Tasa de Depreciación Anual (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.depreciationRate}
                  onChange={(e) => setFormData({ ...formData, depreciationRate: e.target.value })}
                  placeholder="10"
                  className="h-12"
                />
              </div>
            )}

            {/* Valor calculado */}
            {formData.purchaseValue && formData.purchaseDate && (
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Calculator size={18} />
                  <span className="text-sm font-medium">Cálculo de Depreciación</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-slate-500">Años transcurridos</p>
                    <p className="font-medium text-gray-700 dark:text-slate-300">{yearsElapsed.toFixed(1)} años</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-slate-500">Tasa aplicada</p>
                    <p className="font-medium text-gray-700 dark:text-slate-300">
                      {customDepreciation ? `${formData.depreciationRate}%` : `${defaultDepreciation}%`}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-gray-500 dark:text-slate-500 text-sm">Valor Actual (calculado)</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${calculatedValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Descripción (opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalles adicionales..."
                className="flex w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-2xl transition-all duration-200 resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                {loading ? 'Guardando...' : 'Agregar Bien'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="h-12 px-6 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
        >
          <X className="w-5 h-5 text-white dark:text-black" />
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button 
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
      >
        <Plus size={18} />
        <span>Nuevo Bien</span>
      </button>
      
      {createPortal(modalContent, document.body)}
    </>
  )
}