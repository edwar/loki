'use server'

import { prisma } from '@/lib/prisma'

export async function getLowStockCount() {
  try {
    const supplies = await prisma.supply.findMany({
      where: { deletedAt: null }
    })
    
    const lowStockCount = supplies.filter((s) => Number(s.currentStock) < Number(s.minStock)).length
    
    return lowStockCount
  } catch (error) {
    console.error('Error fetching low stock count:', error)
    return 0
  }
}
