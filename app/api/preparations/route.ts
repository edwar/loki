import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calculateCostPrice(ingredients: any[], yieldAmount: number): number {
  const total = ingredients.reduce((acc: number, ing: any) => {
    const qty = Number(ing.quantity) || 0
    if (ing.supply) return acc + qty * (Number(ing.supply.purchasePrice) || 0)
    if (ing.subPreparation) return acc + qty * (Number(ing.subPreparation.costPrice) || 0)
    return acc
  }, 0)
  return yieldAmount > 0 ? total / yieldAmount : 0
}

export async function GET() {
  try {
    const preps = await prisma.preparation.findMany({
      where: { deletedAt: null },
      include: {
        ingredients: {
          include: { supply: true, subPreparation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = preps.map((p: any) => {
      const ingredients = (p.ingredients || []).map((i: any) => ({
        ...i,
        quantity: Number(i.quantity),
        supply: i.supply
          ? { ...i.supply, currentStock: Number(i.supply.currentStock), purchasePrice: Number(i.supply.purchasePrice) }
          : null,
        subPreparation: i.subPreparation
          ? { ...i.subPreparation, currentStock: Number(i.subPreparation.currentStock), costPrice: Number(i.subPreparation.costPrice) }
          : null,
      }))

      const yieldAmount = Number(p.yield) || 1
      const costPrice = calculateCostPrice(ingredients, yieldAmount)

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        unit: p.unit,
        yield: yieldAmount,
        currentStock: Number(p.currentStock),
        minStock: Number(p.minStock),
        costPrice,
        notes: p.notes,
        ingredients,
        createdAt: p.createdAt,
      }
    })

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching preparations:', error)
    return NextResponse.json({ error: 'Error fetching preparations' }, { status: 500 })
  }
}
