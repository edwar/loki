import { getExpenses } from '@/lib/actions/expenses'
import { GastosClient } from './gastos-client'

export const dynamic = 'force-dynamic'

export default async function GastosPage() {
  const expensesRaw = await getExpenses()

  const expenses = expensesRaw.map((e: any) => ({
    id: e.id,
    type: e.type,
    amount: Number(e.amount),
    description: e.description,
    date: e.date.toISOString()
  }))

  return <GastosClient expenses={expenses} />
}