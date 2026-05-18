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
      <CardHeader className='p-2'>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PieIcon size={20} />
          Distribución de Gastos
        </CardTitle>
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
                        <div className="bg-background/95 backdrop-blur-sm rounded-lg">
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