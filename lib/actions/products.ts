'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      recipeItems: {
        where: { deletedAt: null },
        include: { supply: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string | null
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0

  await prisma.product.create({
    data: {
      name,
      category,
      salePrice,
    },
  })

  revalidatePath('/productos')
}

export async function addRecipeItem(formData: FormData) {
  const productId = formData.get('productId') as string
  const supplyId = formData.get('supplyId') as string
  const quantityRequired = parseFloat(formData.get('quantityRequired') as string) || 0
  const unit = formData.get('unit') as string

  await prisma.recipeItem.create({
    data: {
      productId,
      supplyId,
      quantityRequired,
      unit,
    },
  })

  revalidatePath('/productos')
}

export async function deleteRecipeItem(id: string) {
  await prisma.recipeItem.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/productos')
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string | null
  const salePrice = parseFloat(formData.get('salePrice') as string) || 0

  await prisma.product.update({
    where: { id },
    data: {
      name,
      category,
      salePrice,
    },
  })

  revalidatePath('/productos')
}

export async function deleteProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/productos')
}