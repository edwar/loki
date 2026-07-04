'use server'

import { prisma } from '../prisma'
import { revalidatePath } from 'next/cache'

export async function deleteProductionLog(id: string) {
  const log = await prisma.productionLog.findUnique({
    where: { id },
    include: { items: true }
  })

  if (!log) throw new Error('Log no encontrado')

  await prisma.$transaction(async (tx) => {
    for (const item of log.items) {
      if (item.supplyId) {
        await tx.supply.update({
          where: { id: item.supplyId },
          data: { currentStock: { increment: item.quantityConsumed } }
        })
      }
      if (item.preparationId) {
        await tx.preparation.update({
          where: { id: item.preparationId },
          data: { currentStock: { increment: item.quantityConsumed } }
        })
      }
    }

    await tx.product.update({
      where: { id: log.productId },
      data: { currentStock: { decrement: log.actualYield } }
    })

    await tx.productionLog.delete({ where: { id } })
  })

  revalidatePath('/produccion')
  revalidatePath('/productos')
  revalidatePath('/insumos')
}

export async function updateProductionYield(id: string, newActualYield: number) {
  const log = await prisma.productionLog.findUnique({ where: { id } })
  if (!log) throw new Error('Log no encontrado')

  const difference = newActualYield - Number(log.actualYield)

  await prisma.$transaction(async (tx) => {
    // Actualizar el log
    await tx.productionLog.update({
      where: { id },
      data: { actualYield: newActualYield }
    })

    // Ajustar el stock del producto con la diferencia
    await tx.product.update({
      where: { id: log.productId },
      data: { currentStock: { increment: difference } }
    })
  })

  revalidatePath('/produccion')
  revalidatePath('/productos')
}
