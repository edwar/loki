'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserCompany } from './companies'

export async function getPaymentMethods() {
  const company = await getUserCompany()
  if (!company) return []

  return prisma.paymentMethod.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createPaymentMethod(formData: FormData) {
  const company = await getUserCompany()
  if (!company) throw new Error('Sin compañía')

  const name = formData.get('name') as string
  if (!name?.trim()) throw new Error('El nombre es requerido')

  const existing = await prisma.paymentMethod.findUnique({
    where: { companyId_name: { companyId: company.id, name: name.trim() } },
  })
  if (existing) throw new Error('Ya existe un método de pago con ese nombre')

  await prisma.paymentMethod.create({
    data: {
      name: name.trim(),
      companyId: company.id,
    },
  })

  revalidatePath('/facturas')
  revalidatePath('/configuracion')
}

export async function deletePaymentMethod(id: string) {
  const company = await getUserCompany()
  if (!company) throw new Error('Sin compañía')

  const method = await prisma.paymentMethod.findFirst({
    where: { id, companyId: company.id },
  })
  if (!method) throw new Error('Método de pago no encontrado')

  await prisma.paymentMethod.delete({ where: { id } })

  revalidatePath('/facturas')
  revalidatePath('/configuracion')
}
