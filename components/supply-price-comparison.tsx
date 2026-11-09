'use client'

import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate, formatUnitPrice, cn } from '@/lib/utils'
import { X, Store } from 'lucide-react'

interface SupplierPrice {
  supplierId: string | null
  supplierName: string
  lastPrice: number
  lastDate: string
  bestPrice: number
  purchases: number
}

interface PriceComparison {
  supply: { id: string; name: string; unit: string }
  suppliers: SupplierPrice[]
}

/** Para unidades muy pequeñas (g, ml) también se muestra por kg / L, que es como se compara en tienda. */
function bulkPrice(price: number, unit: string): string | null {
  if (unit === 'gramo') return `${formatUnitPrice(price * 1000)} / kg`
  if (unit === 'mililitro') return `${formatUnitPrice(price * 1000)} / L`
  return null
}

export function SupplyPriceComparison({
  supplyId,
  supplyName,
  onClose,
}: {
  supplyId: string
  supplyName: string
  onClose: () => void
}) {
  const { data, isLoading, isError } = useQuery<PriceComparison>({
    queryKey: ['supply-prices', supplyId],
    queryFn: async () => {
      const res = await fetch(`/api/supplies/${supplyId}/prices`)
      if (!res.ok) throw new Error('Error al cargar precios')
      return res.json()
    },
  })

  const suppliers = data?.suppliers ?? []
  const cheapest = suppliers[0]?.lastPrice ?? 0
  const unit = data?.supply.unit ?? ''

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">Comparar precios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {supplyName} · según tu historial de compras
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} className="w-10 h-10 p-0">
          <X size={20} />
        </Button>
      </div>

      <div className="py-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-500">No se pudo cargar la comparación.</p>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Sin compras registradas"
            description="Registra compras de este insumo para poder comparar precios por proveedor."
            compact
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest">Proveedor</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Último precio</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Mejor precio</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Última compra</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">Vs. más barato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s, i) => {
                  const diff = cheapest > 0 ? ((s.lastPrice - cheapest) / cheapest) * 100 : 0
                  const bulk = bulkPrice(s.lastPrice, unit)
                  return (
                    <TableRow key={s.supplierId ?? 'none'}>
                      <TableCell className="font-bold">
                        {s.supplierName}
                        <p className="text-[10px] font-medium text-muted-foreground">
                          {s.purchases} {s.purchases === 1 ? 'compra' : 'compras'}
                        </p>
                      </TableCell>
                      <TableCell className={cn('font-bold', i === 0 && 'text-emerald-500')}>
                        {formatUnitPrice(s.lastPrice)}
                        <p className="text-[10px] font-medium text-muted-foreground">
                          por {unit}
                          {bulk && ` · ${bulk}`}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatUnitPrice(s.bestPrice)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(s.lastDate)}</TableCell>
                      <TableCell className="text-right">
                        {i === 0 ? (
                          <span className="text-xs font-bold text-emerald-500">Más barato</span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500">+{diff.toFixed(0)}%</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <p className="text-[10px] text-muted-foreground mt-3">
              El último precio es el de la compra más reciente a ese proveedor. Revisa la fecha: los precios viejos pueden haber cambiado.
            </p>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
