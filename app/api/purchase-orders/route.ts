import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertUnits, getUnitType } from '@/lib/conversions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supplierName, totalAmount, subtotal, discountPercentage, taxPercentage, purchaseDate, items } = body

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

    const processedItems = await Promise.all(items.map(async (item: any) => {
      let supply = null

      if (item.supplyId) {
        supply = await prisma.supply.findUnique({
          where: { id: item.supplyId, deletedAt: null }
        })
      }

      if (!supply && item.supplyName) {
        supply = await prisma.supply.findFirst({
          where: {
            name: { equals: item.supplyName, mode: 'insensitive' },
            deletedAt: null
          }
        })
      }

      const targetUnit = supply ? supply.unit : (getUnitType(item.unit) ? 'mililitro' : item.unit || 'unidad')

      const purchaseUnit = item.purchaseUnit || item.unit || targetUnit

      // Calcular cantidad total: soporta "5 paquetes × 250ml = 1250ml"
      let totalQuantityInPurchaseUnit = Number(item.quantity) || 0
      if (item.unitQty && Number(item.unitQty) > 0) {
        totalQuantityInPurchaseUnit = totalQuantityInPurchaseUnit * Number(item.unitQty)
      }

      // Convertir a la unidad base del insumo
      let baseQuantity = totalQuantityInPurchaseUnit
      let baseUnitPrice = Number(item.unitPrice) || 0

      if (purchaseUnit !== targetUnit) {
        // Mismo tipo de unidad (ej. L → ml)
        const unitFactor = convertUnits(1, purchaseUnit, targetUnit)
        if (unitFactor && unitFactor > 0) {
          baseQuantity = totalQuantityInPurchaseUnit * unitFactor
          baseUnitPrice = baseUnitPrice / unitFactor
        } else if (supply?.conversionFactor && Number(supply.conversionFactor) > 0) {
          // Distinto tipo (ej. ml → g), usar factor de conversión del insumo
          const factor = Number(supply.conversionFactor)
          baseQuantity = totalQuantityInPurchaseUnit * factor
          baseUnitPrice = baseUnitPrice / factor
        }
      }

      if (supply) {
        supply = await prisma.supply.update({
          where: { id: supply.id },
          data: {
            currentStock: { increment: baseQuantity },
            purchasePrice: baseUnitPrice,
            supplierId: supplier?.id || supply.supplierId
          }
        })
      } else {
        supply = await prisma.supply.create({
          data: {
            name: item.supplyName || 'Sin nombre',
            unit: targetUnit,
            currentStock: baseQuantity,
            purchasePrice: baseUnitPrice,
            supplierId: supplier?.id
          }
        })
      }

      return {
        supplyId: supply.id,
        supplyName: supply.name,
        quantity: baseQuantity,
        unit: targetUnit,
        unitPrice: baseUnitPrice,
        subtotal: item.subtotal
      }
    }))

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