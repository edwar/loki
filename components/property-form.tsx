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
import { Building2, Calculator } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

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

  const currentValue = purchaseValue * Math.pow(1 - annualDepreciation / 100, years)
  return Math.max(0, currentValue)
}

function getYearsSincePurchase(purchaseDate: string): number {
  if (!purchaseDate) return 0
  const purchase = new Date(purchaseDate)
  const now = new Date()
  return Math.max(0, (now.getTime() - purchase.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export function PropertyForm({ 
  property, 
  onSuccess 
}: { 
  property?: any
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [customDepreciation, setCustomDepreciation] = useState(false)
  const [calculatedValue, setCalculatedValue] = useState<number>(0)
  const [yearsElapsed, setYearsElapsed] = useState<number>(0)
  const [formData, setFormData] = useState({
    name: property?.name || '',
    type: property?.type || '',
    address: property?.address || '',
    purchaseValue: property?.purchaseValue?.toString() || '',
    depreciationRate: '10',
    purchaseDate: property?.purchaseDate ? new Date(property.purchaseDate).toISOString().split('T')[0] : '',
    description: property?.description || '',
  })

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
      const url = property ? `/api/properties?id=${property.id}` : '/api/properties'
      const method = property ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
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

      if (response.ok) {
        onSuccess?.()
        if (!property) {
          setFormData({
            name: '',
            type: '',
            address: '',
            purchaseValue: '',
            depreciationRate: '10',
            purchaseDate: '',
            description: '',
          })
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Nombre del Bien</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Camioneta Ford"
            className="h-12 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Tipo de Activo</label>
          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
            <SelectTrigger className="h-12 rounded-lg">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="rounded-lg">
                  {type.label} ({type.depreciation}% anual)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Dirección / Ubicación</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Ej: Av. Principal 123"
          className="h-12 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Valor de Compra</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 font-bold">$</span>
            <Input
              type="number"
              step="0.01"
              value={formData.purchaseValue}
              onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
              placeholder="0.00"
              className="h-12 pl-10 rounded-lg"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Fecha de Adquisición</label>
          <DatePicker
            value={formData.purchaseDate}
            onChange={(date) => setFormData({ ...formData, purchaseDate: date })}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-1">
        <input
          type="checkbox"
          id="customDep"
          checked={customDepreciation}
          onChange={(e) => setCustomDepreciation(e.target.checked)}
          className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/20 cursor-pointer"
        />
        <label htmlFor="customDep" className="text-sm font-medium text-foreground/60 cursor-pointer hover:text-foreground transition-colors">
          Usar tasa de depreciación personalizada
        </label>
      </div>

      {customDepreciation && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Tasa Anual (%)</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.depreciationRate}
            onChange={(e) => setFormData({ ...formData, depreciationRate: e.target.value })}
            placeholder="10"
            className="h-12 rounded-lg"
          />
        </div>
      )}

      {formData.purchaseValue && formData.purchaseDate && (
        <div className="bg-primary/5 rounded-lg p-6 space-y-4 border border-primary/10 shadow-inner">
          <div className="flex items-center gap-3 text-primary">
            <Calculator size={20} className="stroke-[2.5]" />
            <span className="text-sm font-bold uppercase tracking-widest">Resumen de Valoración</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Tiempo Transcurrido</p>
              <p className="text-lg font-bold text-foreground">{yearsElapsed.toFixed(1)} años</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Depreciación Aplicada</p>
              <p className="text-lg font-bold text-foreground">
                {customDepreciation ? `${formData.depreciationRate}%` : `${defaultDepreciation}%`}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-primary/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Valor Actual Estimado</p>
            <p className="text-3xl font-black text-emerald-500 drop-shadow-sm">
              ${calculatedValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-foreground/60 ml-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detalles, estado actual, notas..."
          className="flex w-full px-4 py-3 text-sm bg-background border border-input rounded-lg transition-all duration-200 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
          rows={3}
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 font-bold rounded-lg shadow-lg shadow-primary/20 text-lg"
        >
          {loading ? 'Procesando...' : property ? 'Guardar Cambios' : 'Agregar Bien'}
        </Button>
      </div>
    </form>
  )
}
