import { getExpenses } from '@/lib/actions/expenses'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const expensesRaw = await getExpenses()
    const expenses = expensesRaw.map((e: any) => ({
      id: e.id,
      type: e.type,
      amount: Number(e.amount),
      description: e.description,
      date: e.date.toISOString()
    }))
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
  }
}
