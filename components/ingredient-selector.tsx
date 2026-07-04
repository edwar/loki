'use client'

import { Combobox } from '@/components/ui/combobox'
import { NumericInput } from '@/components/ui/numeric-input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface IngredientSelectorProps {
  type: 'supply' | 'preparation'
  onTypeChange: (type: 'supply' | 'preparation') => void
  supplyOptions: Option[]
  preparationOptions: Option[]
  selectedSupplyId: string
  onSupplyChange: (id: string) => void
  selectedPrepId: string
  onPrepChange: (id: string) => void
  quantity: number
  onQuantityChange: (qty: number) => void
  unit: string
  onUnitChange: (unit: string) => void
  onSubmit: () => void
  canSubmit: boolean
  submitIcon?: React.ReactNode
  units?: string[]
}

export function IngredientSelector({
  type,
  onTypeChange,
  supplyOptions,
  preparationOptions,
  selectedSupplyId,
  onSupplyChange,
  selectedPrepId,
  onPrepChange,
  quantity,
  onQuantityChange,
  unit,
  onUnitChange,
  onSubmit,
  canSubmit,
  submitIcon,
  units = ['kg', 'g', 'L', 'mL', 'ud', 'pza', 'paq'],
}: IngredientSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border/30 overflow-hidden">
          <button
            type="button"
            onClick={() => onTypeChange('supply')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              type === 'supply'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Insumos
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('preparation')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              type === 'preparation'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Preparaciones
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2 p-3 bg-primary/3 rounded-lg border border-primary/10">
        {type === 'supply' ? (
          <div className="flex-1">
            <Combobox
              options={supplyOptions}
              value={selectedSupplyId}
              onValueChange={onSupplyChange}
              placeholder="Buscar insumo..."
              className="[&>button]:h-10"
            />
          </div>
        ) : (
          <div className="flex-1">
            <Combobox
              options={preparationOptions}
              value={selectedPrepId}
              onValueChange={onPrepChange}
              placeholder="Buscar preparación..."
              className="[&>button]:h-10"
            />
          </div>
        )}
        <NumericInput
          value={quantity}
          onChange={onQuantityChange}
          placeholder="Cant."
          className="h-10 w-20 text-center text-xs"
        />
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger className="h-10 w-20 text-xs">
            <SelectValue placeholder="Ud" />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          className="h-10 w-10 shrink-0 rounded-lg"
          disabled={!canSubmit}
        >
          {submitIcon || <Plus size={16} strokeWidth={3} />}
        </Button>
      </div>
    </div>
  )
}
