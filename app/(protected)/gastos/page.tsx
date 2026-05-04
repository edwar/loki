import { getExpenses } from '@/lib/actions/expenses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, Receipt } from 'lucide-react'
import { NewExpenseSection } from '@/components/new-expense-section'
import { ExpenseTable } from '@/components/expense-table'

export const dynamic = 'force-dynamic'

export default async function GastosPage() {
  const expensesRaw = await getExpenses()

  // Serialize Decimals for Client Components
  const expenses = expensesRaw.map((e: any) => ({
    ...e,
    amount: Number(e.amount)
  }))
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Control de Gastos</h1>
          <p className="text-muted-foreground font-medium mt-1">Registra y monitorea los costos indirectos de tu operación.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-lg border-none bg-linear-to-br from-rose-500/10 to-rose-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Total Gastos del Mes</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-blue-500/10 to-blue-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Registros Recientes</p>
                <p className="text-3xl font-extrabold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Expense Form */}
      <NewExpenseSection />

      {/* Table Section */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
        <CardHeader className="px-8 py-6 mb-0 flex flex-row items-center justify-between border-b border-border/30 bg-primary/5">
          <CardTitle className="text-xl">Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent">
          <ExpenseTable expenses={expenses} />
        </CardContent>
      </Card>
    </div>
  )
}