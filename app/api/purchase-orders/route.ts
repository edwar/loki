import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertUnits } from '@/lib/conversions'

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

      // Normalizar unidad a la mínima expresión (litro → mililitro, kilogramo → gramo)
      const normalizeUnit = (u: string) => {
        const type = u === 'litro' || u === 'mililitro' ? 'volumen' : u === 'kilogramo' || u === 'gramo' ? 'peso' : null
        if (type === 'volumen') return 'mililitro'
        if (type === 'peso') return 'gramo'
        return u
      }

      const targetUnit = supply ? supply.unit : normalizeUnit(item.unit || 'unidad')

      // Convertir precio por unidad de presentación a precio por unidad base
      // Ej: 20L de leche a $20.000 → $1.000/L → $1/ml
      let baseUnitPrice = item.unitPrice
      if (item.unit && targetUnit !== item.unit) {
        const factor = convertUnits(1, item.unit, targetUnit)
        if (factor && factor > 0) {
          baseUnitPrice = item.unitPrice / factor
        }
      }

      if (supply) {
        supply = await prisma.supply.update({
          where: { id: supply.id },
          data: {
            currentStock: { increment: item.quantity },
            purchasePrice: baseUnitPrice,
            supplierId: supplier?.id || supply.supplierId
          }
        })
      } else {
        supply = await prisma.supply.create({
          data: {
            name: item.supplyName || 'Sin nombre',
            unit: targetUnit,
            currentStock: item.quantity,
            purchasePrice: baseUnitPrice,
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