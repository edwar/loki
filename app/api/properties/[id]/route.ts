import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, address, purchaseValue, currentValue, purchaseDate, description } = body

    const property = await prisma.property.update({
      where: { id },
      data: {
        name,
        type,
        address,
        purchaseValue,
        currentValue,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        description,
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json({ error: 'Error updating property' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Soft delete
    const property = await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Error deleting property' }, { status: 500 })
  }
}