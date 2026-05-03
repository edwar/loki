'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
  return prisma.supplier.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { purchases: true } }
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSupplier(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const address = formData.get('address') as string | null

  await prisma.supplier.create({
    data: { name, email, phone, address },
  })

  revalidatePath('/proveedores')
}

export async function updateSupplier(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const address = formData.get('address') as string | null

  await prisma.supplier.update({
    where: { id },
    data: { name, email, phone, address },
  })

  revalidatePath('/proveedores')
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/proveedores')
}