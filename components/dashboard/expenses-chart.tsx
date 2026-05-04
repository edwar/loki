'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { PieChart as PieIcon } from 'lucide-react'

interface ExpensesChartProps {
  data: { name: string; value: number }[]
}

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
]

export function ExpensesChart({ data }: ExpensesChartProps) {
  const hasData = data.length > 0

  return (
    <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold font-display">Distribución de Gastos</CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Por categoría este mes</p>
        </div>
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
          <PieIcon size={20} />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <div className="h-[300px] w-full">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center">
                <PieIcon className="text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Sin datos de gastos registrados aún.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            {payload[0].name}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(payload[0].value))}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
