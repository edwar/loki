import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { FacturasClient } from './facturas-client'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

function toPlain(obj: any): any {
  if (obj === null || obj === undefined) return undefined
  if (obj instanceof Decimal) return Number(obj.toString())
  if (typeof obj === 'bigint') return Number(obj)
  if (Array.isArray(obj)) return obj.map(toPlain)
  if (obj instanceof Date) return obj.toISOString()
  if (typeof obj === 'object') {
    const plain: any = {}
    for (const [key, val] of Object.entries(obj)) {
      if (val instanceof Decimal) {
        plain[key] = Number(val.toString())
      } else if (typeof val === 'object' && val !== null) {
        plain[key] = toPlain(val)
      } else if (typeof val !== 'function') {
        plain[key] = val
      }
    }
    return plain
  }
  return obj
}

export default async function FacturasPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  const [invoices, businessSettings, customers, products] = await Promise.all([
    prisma.invoice.findMany({
      where: { deletedAt: null },
      include: {
        customer: { select: { id: true, name: true } },
        invoiceItems: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.businessSettings.findFirst(),
    prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    }),
    prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <FacturasClient 
      invoices={toPlain(invoices)}
      customers={toPlain(customers)}
      products={toPlain(products)}
      businessSettings={toPlain(businessSettings)}
    />
  )
}