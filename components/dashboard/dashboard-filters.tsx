'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'

const RANGES = [
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 90 días', value: '90d' },
  { label: 'Este año', value: 'year' },
  { label: 'Todo el tiempo', value: 'all' },
]

export function DashboardFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentRange = searchParams.get('range') || '30d'

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="w-full md:w-auto flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/50 border border-border/50 text-muted-foreground">
        <Calendar size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Periodo</span>
      </div>
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="h-10 w-full md:w-[180px] rounded-lg bg-background/60 border-primary/5 hover:border-primary/20 transition-all shadow-sm font-medium">
          <SelectValue placeholder="Seleccionar periodo" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-primary/10">
          {RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value} className="rounded-lg">
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
