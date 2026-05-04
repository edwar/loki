'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface SalesChartProps {
  data: { date: string; amount: number }[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold font-display">Flujo de Ventas</CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Historial de los últimos 30 días</p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <TrendingUp size={20} />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
                }}
                minTickGap={30}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          {new Date(payload[0].payload.date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(Number(payload[0].value))}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
