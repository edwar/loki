'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  return prisma.indirectCost.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    take: 50
  })
}

export async function createExpense(formData: FormData) {
  const type = formData.get('type') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const description = formData.get('description') as string | null
  const dateStr = formData.get('date') as string

  await prisma.indirectCost.create({
    data: {
      type,
      amount,
      description,
      date: dateStr ? new Date(dateStr) : new Date()
    }
  })

  revalidatePath('/gastos')
}

export async function deleteExpense(id: string) {
  await prisma.indirectCost.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/gastos')
}