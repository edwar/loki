import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, unit, minStock, supplierId } = body

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'El nombre y la unidad son obligatorios' },
        { status: 400 }
      )
    }

    const supply = await prisma.supply.create({
      data: {
        name,
        category: category || null,
        unit,
        minStock: minStock || 0,
        currentStock: 0,
        purchasePrice: 0,
        supplierId: supplierId || null
      }
    })

    return NextResponse.json(supply)
  } catch (error) {
    console.error('Error creating supply:', error)
    return NextResponse.json({ error: 'Error al crear el insumo' }, { status: 500 })
  }
}