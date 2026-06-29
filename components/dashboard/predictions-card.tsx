'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { PredictionResult } from '@/lib/predictions'

interface PredictionsCardProps {
  predictions: PredictionResult
}

export function PredictionsCard({ predictions }: PredictionsCardProps) {
  const { next7d, next30d, trend, confidence, rSquared } = predictions

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10', label: 'Alza' },
    down: { icon: TrendingDown, color: 'text-rose-500 bg-rose-500/10', label: 'Baja' },
    stable: { icon: Minus, color: 'text-blue-500 bg-blue-500/10', label: 'Estable' },
  }

  const { icon: TrendIcon, color: trendColor, label: trendLabel } = trendConfig[trend]

  const confidenceConfig = {
    high: { color: 'bg-emerald-500', width: 'w-full' },
    medium: { color: 'bg-amber-500', width: 'w-2/3' },
    low: { color: 'bg-muted-foreground', width: 'w-1/3' },
  }

  const { color: confColor, width: confWidth } = confidenceConfig[confidence]

  const confLabel = confidence === 'high' ? 'Alta' : confidence === 'medium' ? 'Media' : 'Baja'

  return (
    <Card className="rounded-lg border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="p-2">
        <CardTitle className="font-bold text-sm flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          Pronóstico de Ventas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <TrendIcon size={16} />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tendencia: {trendLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Próximos 7 días</p>
            <p className="text-lg font-bold">{formatCurrency(Math.round(next7d))}</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Próximos 30 días</p>
            <p className="text-lg font-bold">{formatCurrency(Math.round(next30d))}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Confianza</span>
            <span className="text-[10px] font-bold">{confLabel}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', confColor, confWidth)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
