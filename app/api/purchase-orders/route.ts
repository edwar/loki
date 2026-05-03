import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supplierName, totalAmount, subtotal, discountPercentage, taxPercentage, purchaseDate, aiExtractedData, items } = body

    // Buscar o crear el proveedor
    let supplier = await prisma.supplier.findFirst({
      where: {
        name: { contains: supplierName, mode: 'insensitive' },
        deletedAt: null
      }
    })

    if (!supplier && supplierName) {
      supplier = await prisma.supplier.create({
        data: { name: supplierName }
      })
    }

    // Crear la orden de compra
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplier: supplier ? { connect: { id: supplier.id } } : undefined,
        totalAmount,
        subtotal: subtotal || 0,
        discountPercentage: discountPercentage || 0,
        taxPercentage: taxPercentage || 0,
        status: 'completed',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        aiExtractedData,
        purchaseItems: {
          create: items.map((item: any) => ({
            supplyName: item.supplyName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        purchaseItems: true
      }
    })

    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return NextResponse.json({ error: 'Error creating purchase order' }, { status: 500 })
  }
}