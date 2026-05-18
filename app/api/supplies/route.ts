import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId, unit, unitsPerPack, minStock } = body

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'El nombre y la unidad son obligatorios' },
        { status: 400 }
      )
    }

    const data: Prisma.SupplyCreateInput = {
      name,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      unit,
      unitsPerPack: unitsPerPack ? Number(unitsPerPack) : 1,
      minStock: minStock || 0,
      currentStock: 0,
      purchasePrice: 0
    }

    const supply = await prisma.supply.create({ data })

    return NextResponse.json(supply)
  } catch (error) {
    console.error('Error creating supply:', error)
    return NextResponse.json({ error: 'Error al crear el insumo' }, { status: 500 })
  }
}