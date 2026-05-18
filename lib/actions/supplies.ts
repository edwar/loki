'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSupplies() {
  return prisma.supply.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSupply(formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string | null
  const categoryId = formData.get('categoryId') as string | null
  const unit = formData.get('unit') as string
  const currentStock = parseFloat(formData.get('currentStock') as string) || 0
  const minStock = parseFloat(formData.get('minStock') as string) || 0
  const purchasePrice = parseFloat(formData.get('purchasePrice') as string) || 0

  await prisma.supply.create({
    data: {
      name,
      sku,
      categoryId: categoryId || null,
      unit,
      currentStock,
      minStock,
      purchasePrice,
    },
  })

  revalidatePath('/inventario')
}

export async function updateSupply(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string | null
  const categoryId = formData.get('categoryId') as string | null
  const unit = formData.get('unit') as string
  const currentStock = parseFloat(formData.get('currentStock') as string) || 0
  const minStock = parseFloat(formData.get('minStock') as string) || 0
  const purchasePrice = parseFloat(formData.get('purchasePrice') as string) || 0

  await prisma.supply.update({
    where: { id },
    data: {
      name,
      sku,
      categoryId: categoryId || null,
      unit,
      currentStock,
      minStock,
      purchasePrice,
    },
  })

  revalidatePath('/inventario')
}

export async function deleteSupply(id: string) {
  await prisma.supply.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/inventario')
}