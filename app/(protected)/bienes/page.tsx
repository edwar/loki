import { prisma } from '@/lib/prisma'
import { BienesClient } from './bienes-client'

export const dynamic = 'force-dynamic'

async function getProperties() {
  const properties = await prisma.property.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' }
  })

  return properties.map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    address: p.address,
    purchaseValue: Number(p.purchaseValue),
    currentValue: Number(p.currentValue),
    purchaseDate: p.purchaseDate?.toISOString() || null,
    description: p.description,
  }))
}

export default async function BienesPage() {
  const properties = await getProperties()

  return <BienesClient properties={properties} />
}