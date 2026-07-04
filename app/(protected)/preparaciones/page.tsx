import { getPreparations } from '@/lib/actions/preparations'
import { getSupplies } from '@/lib/actions/supplies'
import { PreparacionesClient } from './preparaciones-client'

export const dynamic = 'force-dynamic'

export default async function PreparacionesPage() {
  const [prepsRaw, suppliesRaw] = await Promise.all([
    getPreparations(),
    getSupplies(),
  ])

  const preparations = prepsRaw.map((p: any) => ({
    ...p,
    costPrice: Number(p.costPrice) || 0,
    currentStock: Number(p.currentStock),
    minStock: Number(p.minStock),
    yield: Number(p.yield) || 1,
    ingredients: p.ingredients.map((i: any) => ({
      ...i,
      quantity: Number(i.quantity),
      supply: i.supply
        ? {
            id: i.supply.id,
            name: i.supply.name,
            unit: i.supply.unit,
            currentStock: Number(i.supply.currentStock),
            minStock: Number(i.supply.minStock),
            purchasePrice: Number(i.supply.purchasePrice),
          }
        : null,
      subPreparation: i.subPreparation
        ? { ...i.subPreparation, currentStock: Number(i.subPreparation.currentStock), costPrice: Number(i.subPreparation.costPrice) }
        : null,
    })),
  }))

  const supplies = suppliesRaw.map((s: any) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
    currentStock: Number(s.currentStock),
    purchasePrice: Number(s.purchasePrice),
    unitsPerPack: Number(s.unitsPerPack),
  }))

  return <PreparacionesClient preparations={preparations} supplies={supplies} />
}
