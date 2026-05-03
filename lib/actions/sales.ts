'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSales() {
  return prisma.dailySale.findMany({
    where: { deletedAt: null },
    include: {
      customer: true,
      saleItems: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

export async function getActiveProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    include: {
      recipeItems: {
        where: { deletedAt: null },
        include: { supply: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createSale(formData: FormData) {
  let customerId = formData.get('customerId') as string | null
  
  // Si el customerId es "none" o comienza con "none_", lo tratamos como null (Venta General)
  if (!customerId || customerId === 'none' || customerId.startsWith('none_')) {
    customerId = null
  }
  const itemsJson = formData.get('items') as string

  const items = JSON.parse(itemsJson) as { productId: string; quantity: number; unitPrice: number }[]

  let totalAmount = 0
  const supplyDeductions: { supplyId: string; quantity: number }[] = []

  for (const item of items) {
    totalAmount += item.quantity * item.unitPrice

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { recipeItems: { where: { deletedAt: null } } }
    })

    if (product) {
      for (const recipeItem of product.recipeItems) {
        const deduction = Number(recipeItem.quantityRequired) * item.quantity
        supplyDeductions.push({ supplyId: recipeItem.supplyId, quantity: deduction })
      }
    }
  }

  const sale = await prisma.dailySale.create({
    data: {
      customerId: customerId || null,
      totalAmount,
      saleItems: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        }))
      }
    }
  })

  for (const deduction of supplyDeductions) {
    const supply = await prisma.supply.findUnique({ where: { id: deduction.supplyId } })
    if (supply) {
      await prisma.supply.update({
        where: { id: deduction.supplyId },
        data: { currentStock: Number(supply.currentStock) - deduction.quantity }
      })
    }
  }

  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (customer) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { totalPurchases: Number(customer.totalPurchases) + totalAmount }
      })
    }
  }

  revalidatePath('/ventas')
  revalidatePath('/insumos')
  revalidatePath('/')
}

export async function deleteSale(id: string) {
  const sale = await prisma.dailySale.findUnique({
    where: { id },
    include: { saleItems: true }
  })

  if (sale) {
    for (const item of sale.saleItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { recipeItems: { where: { deletedAt: null } } }
      })

      if (product) {
        for (const recipeItem of product.recipeItems) {
          const returnQty = Number(recipeItem.quantityRequired) * item.quantity
          const supply = await prisma.supply.findUnique({ where: { id: recipeItem.supplyId } })
          if (supply) {
            await prisma.supply.update({
              where: { id: recipeItem.supplyId },
              data: { currentStock: Number(supply.currentStock) + returnQty }
            })
          }
        }
      }
    }

    if (sale.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: sale.customerId } })
      if (customer) {
        await prisma.customer.update({
          where: { id: sale.customerId },
          data: { totalPurchases: Number(customer.totalPurchases) - Number(sale.totalAmount) }
        })
      }
    }
  }

  await prisma.dailySale.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/ventas')
  revalidatePath('/insumos')
  revalidatePath('/')
}