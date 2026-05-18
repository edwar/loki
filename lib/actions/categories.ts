'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategories(type?: string) {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
      ...(type ? { type } : {})
    },
    orderBy: { name: 'asc' }
  })
}

export async function getSupplyCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null, type: 'supply' },
    orderBy: { name: 'asc' }
  })
}

export async function getProductCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null, type: 'product' },
    orderBy: { name: 'asc' }
  })
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string || 'supply'

  await prisma.category.create({
    data: { name, type }
  })

  revalidatePath('/categorias')
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string

  await prisma.category.update({
    where: { id },
    data: { name }
  })

  revalidatePath('/categorias')
}

export async function deleteCategory(id: string) {
  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/categorias')
}