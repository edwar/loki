import { prisma } from '@/lib/prisma'
import { ProductionTable } from '@/components/production-table'
import { Factory } from 'lucide-react'
import { NewProductionModal } from '@/components/new-production-modal'
import { getProducts } from '@/lib/actions/products'
import { ExportButton } from '@/components/ui/export-button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ProductionPage() {
  const [logs, productsRaw] = await Promise.all([
    prisma.productionLog.findMany({
      orderBy: { date: 'desc' },
      include: {
        product: true,
        items: {
          include: {
            supply: true,
            preparation: true,
          }
        }
      }
    }),
    getProducts()
  ])

  // Convert Decimals to Numbers for Client Component
  const serializedLogs = logs.map(log => ({
    ...log,
    actualYield: Number(log.actualYield),
    batches: Number(log.batches),
    product: {
      ...log.product,
      currentStock: Number(log.product.currentStock),
    },
    items: log.items.map(item => ({
      ...item,
      quantityConsumed: Number(item.quantityConsumed),
      unitCost: Number(item.unitCost),
      supply: item.supply ? {
        ...item.supply,
        currentStock: Number(item.supply.currentStock),
        minStock: Number(item.supply.minStock),
        purchasePrice: Number(item.supply.purchasePrice)
      } : null,
      preparation: item.preparation ? {
        ...item.preparation,
        currentStock: Number(item.preparation.currentStock),
        costPrice: Number(item.preparation.costPrice),
      } : null,
    }))
  }))

  const products = productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    yield: Number(p.yield) || 1,
    recipeItems: p.recipeItems.map((ri: any) => ({
      id: ri.id,
      quantityRequired: Number(ri.quantityRequired),
      supply: ri.supply ? {
        id: ri.supply.id,
        name: ri.supply.name,
        currentStock: Number(ri.supply.currentStock),
        unit: ri.supply.unit
      } : null
    })),
    productRecipeItems: p.productRecipeItems?.map((pri: any) => ({
      id: pri.id,
      quantity: Number(pri.quantity),
      preparation: pri.preparation ? {
        id: pri.preparation.id,
        name: pri.preparation.name,
        currentStock: Number(pri.preparation.currentStock),
        unit: pri.preparation.unit,
        costPrice: Number(pri.preparation.costPrice),
      } : null,
    })) || [],
  }))

  const exportData = serializedLogs.map(log => ({
    'ID Lote': log.id,
    'Fecha': formatDate(log.date),
    'Producto': log.product.name,
    'Lotes Fabricados': log.batches,
    'Unidades Producidas': log.actualYield,
    'Costo Insumos ($)': log.items.reduce((acc, item) => acc + (item.quantityConsumed * item.unitCost), 0),
    'Detalle Insumos': log.items.map(item => `${item.quantityConsumed} ${item.supply?.unit || 'ud'} de ${item.supply?.name || item.preparation?.name || 'Desconocido'}`).join(' | ')
  }))

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
        <div className="flex items-center gap-3">
          {serializedLogs.length > 0 && (
            <ExportButton
              data={exportData}
              filename={`Produccion_${new Date().toISOString().split('T')[0]}`}
              className="h-12 px-6 rounded-lg font-bold"
            />
          )}
          <NewProductionModal products={products} />
        </div>
      </div>

      <ProductionTable logs={serializedLogs} />
    </div>
  )
}
