'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import type { PredictionResult } from '@/lib/predictions'

interface SalesChartProps {
  data: { date: string; amount: number }[]
  predictions?: PredictionResult | null
}

export function SalesChart({ data, predictions }: SalesChartProps) {
  const chartData = predictions
    ? buildChartData(data, predictions)
    : data.map(d => ({ ...d, predicted: null }))

  return (
    <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <div className="space-y-1 flex items-center gap-2">
          <TrendingUp size={20} />
          <CardTitle className="text-base font-bold flex items-center gap-2">Flujo de Ventas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    const dataPoint = payload[0].payload
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          {new Date(dataPoint.date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(Number(payload[0].value))}
                        </p>
                        {dataPoint.predicted && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">* Proyectado</p>
                        )}
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
              {predictions && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  connectNulls={true}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function buildChartData(data: { date: string; amount: number }[], predictions: PredictionResult) {
  const lastDate = new Date(data[data.length - 1].date)
  const dailyAvg = predictions.next30d / 30

  const result = data.map(d => ({ ...d, predicted: null as number | null }))

  for (let i = 1; i <= 7; i++) {
    const d = new Date(lastDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    result.push({ date: dateStr, amount: 0, predicted: Math.round(dailyAvg) })
  }

  return result
}
