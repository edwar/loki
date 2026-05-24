import { getSupplies } from '@/lib/actions/supplies'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const suppliesRaw = await getSupplies()
    const supplies = suppliesRaw.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category?.name || null,
      unit: s.unit,
      currentStock: Number(s.currentStock),
      minStock: Number(s.minStock),
      purchasePrice: Number(s.purchasePrice),
      supplier: s.supplier,
      updatedAt: s.updatedAt.toISOString()
    }))
    return NextResponse.json(supplies)
  } catch (error) {
    console.error('Error fetching supplies:', error)
    return NextResponse.json({ error: 'Error al obtener insumos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId, unit, unitsPerPack, minStock } = body

    const supply = await prisma.supply.create({
      data: {
        name,
        categoryId: categoryId || null,
        unit,
        unitsPerPack: unitsPerPack || 1,
        minStock: minStock || 1,
        currentStock: 0,
        purchasePrice: 0,
      },
    })

    revalidatePath('/inventario')
    return NextResponse.json(supply, { status: 201 })
  } catch (error) {
    console.error('Error creating supply:', error)
    return NextResponse.json({ error: 'Error al guardar el insumo' }, { status: 500 })
  }
}
