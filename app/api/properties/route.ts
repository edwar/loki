import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Error fetching properties' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, address, purchaseValue, currentValue, purchaseDate, description } = body

    const property = await prisma.property.create({
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
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Error creating property' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Error deleting property' }, { status: 500 })
  }
}