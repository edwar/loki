'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAction } from './audit'
import { getServerSession } from 'next-auth'

async function getSession() {
  return getServerSession()
}

export async function generateFolio(): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { folio: true }
  })

  if (!lastInvoice) {
    return 'FAC-0001'
  }

  const numPart = lastInvoice.folio.replace('FAC-', '')
  const nextNum = parseInt(numPart, 10) + 1
  return `FAC-${nextNum.toString().padStart(4, '0')}`
}

export async function getInvoices() {
  return prisma.invoice.findMany({
    where: { deletedAt: null },
    include: {
      customer: true,
      invoiceItems: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      invoiceItems: {
        include: { product: true }
      }
    }
  })
}

export async function getCustomersForInvoice() {
  return prisma.customer.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' }
  })
}

export async function getActiveProductsForInvoice() {
  return prisma.product.findMany({
    where: { deletedAt: null, isActive: true, currentStock: { gt: 0 } },
    orderBy: { name: 'asc' }
  })
}

export async function getBusinessSettings() {
  let settings = await prisma.businessSettings.findFirst()
  
  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: {
        businessName: 'Mi Negocio',
        taxRate: 19,
        currency: 'COP'
      }
    })
  }
  
  return settings
}

export async function updateBusinessSettings(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No autorizado')
  }

  const businessName = formData.get('businessName') as string
  const tin = formData.get('tin') as string | null
  const address = formData.get('address') as string | null
  const phone = formData.get('phone') as string | null
  const email = formData.get('email') as string | null
  const taxRate = parseFloat(formData.get('taxRate') as string) || 16
  const currency = formData.get('currency') as string || 'COP'

  const settings = await prisma.businessSettings.findFirst()

  if (settings) {
    await prisma.businessSettings.update({
      where: { id: settings.id },
      data: { businessName, tin, address, phone, email, taxRate, currency }
    })
  } else {
    await prisma.businessSettings.create({
      data: { businessName, tin, address, phone, email, taxRate, currency }
    })
  }

  await logAction('UPDATE', 'business_settings', undefined, { businessName })
  revalidatePath('/facturas')
}

export async function createInvoice(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No autorizado')
  }

  const customerId = formData.get('customerId') as string | null
  const customerName = formData.get('customerName') as string
  const customerTin = formData.get('customerTin') as string | null
  const customerAddress = formData.get('customerAddress') as string | null
  const customerEmail = formData.get('customerEmail') as string | null
  const itemsJson = formData.get('items') as string
  const taxRate = parseFloat(formData.get('taxRate') as string) || 16
  const paymentMethod = formData.get('paymentMethod') as string | null
  const notes = formData.get('notes') as string | null

  const items = JSON.parse(itemsJson) as { productId: string; productName: string; quantity: number; unitPrice: number }[]
  
  let subtotal = 0
  for (const item of items) {
    subtotal += item.quantity * item.unitPrice
  }
  
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const folio = await generateFolio()

  const invoice = await prisma.invoice.create({
    data: {
      folio,
      customerId: customerId || null,
      customerName,
      customerTin,
      customerAddress,
      customerEmail,
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentMethod,
      notes,
      status: 'issued',
      paymentStatus: 'pending',
      invoiceItems: {
        create: items.map(item => ({
          productId: item.productId || null,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        }))
      }
    }
  })

  for (const item of items) {
    if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          currentStock: {
            decrement: item.quantity
          }
        }
      })
    }
  }

  await logAction('CREATE', 'invoice', invoice.id, { folio, total: total.toString() })
  revalidatePath('/facturas')
  revalidatePath('/productos')
  
  return invoice
}

export async function updateInvoiceStatus(id: string, status: string, paymentStatus?: string) {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No autorizado')
  }

  const data: { status: string; paymentStatus?: string } = { status }
  if (paymentStatus) {
    data.paymentStatus = paymentStatus
  }

  await prisma.invoice.update({
    where: { id },
    data
  })

  await logAction('UPDATE', 'invoice', id, { status })
  revalidatePath('/facturas')
}

export async function cancelInvoice(id: string) {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No autorizado')
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { invoiceItems: true }
  })

  if (!invoice) {
    throw new Error('Factura no encontrada')
  }

  await prisma.$transaction(async (tx) => {
    for (const item of invoice.invoiceItems) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: Number(item.quantity)
            }
          }
        })
      }
    }

    await tx.invoice.update({
      where: { id },
      data: { status: 'cancelled' }
    })
  })

  await logAction('UPDATE', 'invoice', id, { status: 'cancelled' })
  revalidatePath('/facturas')
  revalidatePath('/productos')
}

export async function deleteInvoice(id: string) {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No autorizado')
  }

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  await logAction('DELETE', 'invoice', id)
  revalidatePath('/facturas')
}