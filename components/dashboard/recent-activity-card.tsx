'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, DollarSign, Receipt, BarChart3 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface RecentItemRowProps {
  title: string
  date: Date
  amount: number
  icon: any
  isNegative?: boolean
}

function RecentItemRow({ title, date, amount, icon: Icon, isNegative }: RecentItemRowProps) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg hover:bg-accent/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-background border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <Icon size={20} className="text-primary/70" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <BarChart3 size={10} />
            {formatDate(date)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", isNegative ? "text-rose-500" : "text-foreground")}>
          {isNegative ? '-' : ''}{formatCurrency(amount)}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Exitosa</p>
      </div>
    </div>
  )
}

interface RecentActivityCardProps {
  recentSales: any[]
  recentExpenses: any[]
}

export function RecentActivityCard({ recentSales, recentExpenses }: RecentActivityCardProps) {
  const hasActivity = recentSales.length > 0 || recentExpenses.length > 0

  const router = useRouter()

  return (
    <div className="lg:col-span-8 space-y-6">
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="p-8 pb-0 flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold font-display tracking-tight">Actividad Reciente</CardTitle>
            <p className="text-sm text-muted-foreground font-medium mt-1">Ventas y egresos del día</p>
          </div>
          <Link href="/ventas">
            <Button variant="ghost" className="rounded-lg text-xs font-bold text-primary hover:bg-primary/5">
              Ver Todo <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
        <CardContent className="p-4 pt-6 space-y-2">
          {!hasActivity ? (
            <EmptyState
              icon={BarChart3}
              className='h-[200px]'
              title="No se detectó actividad"
              description="Registra tus ventas y gastos para ver la actividad reciente."
              actionLabel="Registrar Primera Venta"
              onAction={() => router.push('/ventas')}
              compact
            />
          ) : (
            <div className="space-y-1">
              {recentSales.map((sale) => (
                <RecentItemRow
                  key={sale.id}
                  title={sale.saleItems.map((si: any) => si.product.name).join(', ')}
                  date={sale.createdAt}
                  amount={Number(sale.totalAmount)}
                  icon={DollarSign}
                />
              ))}
              {recentExpenses.map((expense: any) => (
                <RecentItemRow
                  key={expense.id}
                  title={expense.type}
                  date={expense.date}
                  amount={Number(expense.amount)}
                  icon={Receipt}
                  isNegative
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}