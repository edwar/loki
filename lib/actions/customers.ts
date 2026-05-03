'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { sales: true } }
    },
    orderBy: { createdAt: 'desc' },
  })

  return customers.map(c => ({
    ...c,
    totalPurchases: Number(c.totalPurchases)
  }))
}

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const address = formData.get('address') as string | null

  await prisma.customer.create({
    data: { name, email, phone, address },
  })

  revalidatePath('/clientes')
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const address = formData.get('address') as string | null

  await prisma.customer.update({
    where: { id },
    data: { name, email, phone, address },
  })

  revalidatePath('/clientes')
}

export async function deleteCustomer(id: string) {
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/clientes')
}