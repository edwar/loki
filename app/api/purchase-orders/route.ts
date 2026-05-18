import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supplierName, totalAmount, subtotal, discountPercentage, taxPercentage, purchaseDate, items } = body

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

    // Procesar cada item para crear o actualizar insumos
    const processedItems = await Promise.all(items.map(async (item: any) => {
      let supply = null

      // Si viene supplyId, usar ese supply directamente
      if (item.supplyId) {
        supply = await prisma.supply.findUnique({
          where: { id: item.supplyId, deletedAt: null }
        })
      }

      // Si no se encontró por ID, buscar por nombre (fallback)
      if (!supply && item.supplyName) {
        supply = await prisma.supply.findFirst({
          where: {
            name: { equals: item.supplyName, mode: 'insensitive' },
            deletedAt: null
          }
        })
      }

      if (supply) {
        // Actualizar stock y precio del insumo existente
        supply = await prisma.supply.update({
          where: { id: supply.id },
          data: {
            currentStock: { increment: item.quantity },
            purchasePrice: item.unitPrice,
            supplierId: supplier?.id || supply.supplierId
          }
        })
      } else {
        // Crear nuevo insumo si no existe
        supply = await prisma.supply.create({
          data: {
            name: item.supplyName || 'Sin nombre',
            unit: item.unit || 'unidad',
            currentStock: item.quantity,
            purchasePrice: item.unitPrice,
            supplierId: supplier?.id
          }
        })
      }

      return {
        supplyId: supply.id,
        supplyName: supply.name,
        quantity: item.quantity,
        unit: item.unit || 'unidad',
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      }
    }))

    // Crear la orden de compra con los items procesados
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplier: supplier ? { connect: { id: supplier.id } } : undefined,
        totalAmount,
        subtotal: subtotal || 0,
        discountPercentage: discountPercentage || 0,
        taxPercentage: taxPercentage || 0,
        status: 'completed',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        purchaseItems: {
          create: processedItems
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