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
import { PieChart as PieIcon, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '../ui/button'

interface ExpensesChartProps {
  data: { name: string; value: number }[]
}

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
]

export function ExpensesChart({ data }: ExpensesChartProps) {
  const hasData = data && data.length > 0

  return (
    <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold font-display">Distribución de Gastos</CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Por categoría en el periodo seleccionado</p>
        </div>
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
          <PieIcon size={20} />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <div className="h-[300px] w-full">
          {!hasData ? (
            <EmptyState
              icon={Receipt}
              title="Sin gastos registrados"
              description="Registra tus gastos para ver la distribución por categoría."
              actionLabel={<>
                <PieIcon size={12} className='mr-2' />
                Ir a Gastos
              </>}
              onAction={() => window.location.href = '/gastos'}
              compact
            />
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
                  animationDuration={1000}
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