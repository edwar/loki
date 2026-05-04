'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAction } from './audit'

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
  
  if (!customerId || customerId === 'none' || customerId.startsWith('none_')) {
    customerId = null
  }
  const itemsJson = formData.get('items') as string
  const items = JSON.parse(itemsJson) as { productId: string; quantity: number; unitPrice: number }[]

  let totalAmount = 0
  const supplyDeductions: { supplyId: string; quantity: number }[] = []
  const productStockUpdates: { productId: string; quantity: number }[] = []

  for (const item of items) {
    totalAmount += item.quantity * item.unitPrice

    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    })

    if (product) {
      productStockUpdates.push({ productId: product.id, quantity: item.quantity })
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.dailySale.create({
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

    for (const update of productStockUpdates) {
      await tx.product.update({
        where: { id: update.productId },
        data: { currentStock: { decrement: update.quantity } }
      })
    }

    if (customerId) {
      const customer = await tx.customer.findUnique({ where: { id: customerId } })
      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalPurchases: { increment: totalAmount } }
        })
      }
    }
  })

  revalidatePath('/ventas')
  revalidatePath('/productos')
  revalidatePath('/insumos')
  revalidatePath('/')
}

export async function updateSale(id: string, formData: FormData) {
  const oldSale = await prisma.dailySale.findUnique({
    where: { id },
    include: { saleItems: true }
  })

  if (!oldSale) throw new Error('Venta no encontrada')

  await prisma.$transaction(async (tx) => {
    // 1. Revertir impactos antiguos (Devolver a stock de PRODUCTO)
    for (const item of oldSale.saleItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: item.quantity } }
      })
    }

    if (oldSale.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: oldSale.customerId } })
      if (customer) {
        await tx.customer.update({
          where: { id: oldSale.customerId },
          data: { totalPurchases: { decrement: oldSale.totalAmount } }
        })
      }
    }

    // 2. Procesar nuevos datos
    let customerId = formData.get('customerId') as string | null
    if (!customerId || customerId === 'none' || customerId.startsWith('none_')) {
      customerId = null
    }
    const itemsJson = formData.get('items') as string
    const items = JSON.parse(itemsJson) as { productId: string; quantity: number; unitPrice: number }[]

    let totalAmount = 0
    const supplyDeductions: { supplyId: string; quantity: number }[] = []
    const productStockUpdates: { productId: string; quantity: number }[] = []

    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      })
      
      if (product) {
        productStockUpdates.push({ productId: product.id, quantity: item.quantity })
      }
    }

    // 3. Aplicar cambios
    await tx.dailySale.update({
      where: { id },
      data: {
        customerId: customerId || null,
        totalAmount,
        saleItems: {
          deleteMany: {},
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
          }))
        }
      }
    })

    for (const update of productStockUpdates) {
      await tx.product.update({
        where: { id: update.productId },
        data: { currentStock: { decrement: update.quantity } }
      })
    }

    if (customerId) {
      const customer = await tx.customer.findUnique({ where: { id: customerId } })
      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalPurchases: { increment: totalAmount } }
        })
      }
    }
  })

  revalidatePath('/ventas')
  revalidatePath('/productos')
  revalidatePath('/insumos')
  revalidatePath('/')
}

export async function deleteSale(id: string) {
  const sale = await prisma.dailySale.findUnique({
    where: { id },
    include: { saleItems: true }
  })

  if (!sale) throw new Error('Venta no encontrada')

  await prisma.$transaction(async (tx) => {
    // 1. Devolver stock a los productos
    for (const item of sale.saleItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: item.quantity } }
      })
    }

    // 2. Revertir total del cliente
    if (sale.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: sale.customerId } })
      if (customer) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: { totalPurchases: { decrement: sale.totalAmount } }
        })
      }
    }

    // 3. Marcar como eliminada
    await tx.dailySale.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  })

  await logAction('DELETE', 'SALE', id, { totalAmount: Number(sale.totalAmount), customerId: sale.customerId })

  revalidatePath('/ventas')
  revalidatePath('/productos')
  revalidatePath('/insumos')
  revalidatePath('/')
}