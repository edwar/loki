import { prisma } from '@/lib/prisma'
import { ProductionTable } from '@/components/production-table'
import { Factory } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProductionPage() {
  const logs = await prisma.productionLog.findMany({
    orderBy: { date: 'desc' },
    include: {
      product: true,
      items: {
        include: {
          supply: true
        }
      }
    }
  })

  // Convert Decimals to Numbers for Client Component
  const serializedLogs = logs.map(log => ({
    ...log,
    expectedYield: Number(log.expectedYield),
    actualYield: Number(log.actualYield),
    batches: Number(log.batches),
    product: {
      ...log.product,
      salePrice: Number(log.product.salePrice),
      currentStock: Number(log.product.currentStock),
      yield: Number(log.product.yield)
    },
    items: log.items.map(item => ({
      ...item,
      quantityConsumed: Number(item.quantityConsumed),
      unitCost: Number(item.unitCost),
      supply: {
        ...item.supply,
        currentStock: Number(item.supply.currentStock),
        minStock: Number(item.supply.minStock),
        purchasePrice: Number(item.supply.purchasePrice)
      }
    }))
  }))

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Factory size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display">Producción</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Historial de lotes producidos y control de mermas.
            </p>
          </div>
        </div>
      </div>

      <ProductionTable logs={serializedLogs} />
    </div>
  )
}
