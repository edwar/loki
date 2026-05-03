import { getExpenses, deleteExpense } from '@/lib/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createExpense } from '@/lib/actions/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const expenseTypes = [
  'Transporte',
  'Nómina',
  'Servicios',
  'Mantenimiento',
  'Impuestos',
  'Arriendo',
  'Otros'
]

function ExpenseForm() {
  return (
    <form action={createExpense} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {expenseTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Monto</label>
          <Input name="amount" type="number" step="100" required className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha</label>
          <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <Input name="description" className="mt-1" placeholder="Descripción opcional" />
        </div>
      </div>
      <Button type="submit">Registrar Gasto</Button>
    </form>
  )
}

export default async function GastosPage() {
  const expenses = await getExpenses()
  const today = new Date().toISOString().split('T')[0]
  
  const todayTotal = expenses
    .filter(e => e.date.toISOString().split('T')[0] === today)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const monthTotal = expenses
    .filter(e => {
      const expDate = new Date(e.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Gastos</h1>
        <p className="text-gray-500 dark:text-slate-400">Controla los gastos operativos de tu negocio</p>
        <p className="text-zinc-500">Controla tus gastos indirectos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gastos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500">
                    No hay gastos registrados
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-zinc-100 rounded text-sm">{expense.type}</span>
                    </TableCell>
                    <TableCell>{expense.description || '-'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(expense.amount))}</TableCell>
                    <TableCell>
                      <form action={deleteExpense.bind(null, expense.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}