import { getCategories } from '@/lib/actions/categories'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get('type') || undefined
    const categories = await getCategories(type)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, type = 'supply' } = await request.json()
    const trimmed = typeof name === 'string' ? name.trim() : ''
    if (!trimmed) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { name: trimmed } })
    if (existing) {
      if (!existing.deletedAt) {
        return NextResponse.json({ error: 'La categoría ya existe' }, { status: 409 })
      }
      const restored = await prisma.category.update({
        where: { id: existing.id },
        data: { deletedAt: null, type },
      })
      return NextResponse.json(restored)
    }

    const category = await prisma.category.create({ data: { name: trimmed, type } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
