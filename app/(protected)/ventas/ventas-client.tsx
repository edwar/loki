'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { History, Plus, ShoppingBag } from 'lucide-react'
import { DeleteSaleButton } from './delete-sale-button'
import { Modal } from '@/components/ui/modal'
import { SaleFormModal } from '@/components/sale-form-modal'
import { ExportButton } from '@/components/ui/export-button'
import { Edit2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSale } from '@/lib/actions/sales'

interface Product {
  id: string
  name: string
  salePrice: number
  currentStock: number
  recipeItems: {
    id: string
    quantityRequired: number
    unit: string
    supply: { name: string; currentStock: number; minStock: number; purchasePrice: number } | null
  }[]
}

interface Customer {
  id: string
  name: string
  totalPurchases: number
}

interface SaleItem {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  product: {
    name: string
    salePrice: number
    currentStock: number
    yield: number
  } | null
}

interface Sale {
  id: string
  totalAmount: number
  createdAt: string
  customer: { name: string; totalPurchases: number } | null
  saleItems: SaleItem[]
}

interface VentasClientProps {
  products: Product[]
  customers: Customer[]
  sales: Sale[]
}

export function VentasClient({ products, customers, sales: initialSales }: VentasClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  const { data: sales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales')
      if (!res.ok) throw new Error('Error al cargar ventas')
      return res.json()
    },
    initialData: initialSales,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['sales'] })
      const previous = queryClient.getQueryData<Sale[]>(['sales'])
      queryClient.setQueryData<Sale[]>(['sales'], (old) =>
        old?.filter((sale) => sale.id !== id) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['sales'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  const exportData = (sales ?? []).map((sale: any) => ({
    'ID Venta': sale.id,
    'Fecha': formatDate(sale.createdAt),
    'Cliente': sale.customer?.name || "Venta General",
    'Monto Total': sale.totalAmount,
    'Cantidad de Productos': sale.saleItems.reduce((acc: number, item: any) => acc + item.quantity, 0),
    'Detalle': sale.saleItems.map((si: any) => `${si.quantity}x ${si.product?.name}`).join(', ')
  }))

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['sales'] })
  }

  const handleOpenNew = () => {
    setEditingSale(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (sale: Sale) => {
    setEditingSale(sale)
    setModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Control de Ventas</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Registro de transacciones y facturación en tiempo real.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {(sales?.length ?? 0) > 0 && (
            <ExportButton
              data={exportData}
              filename={`Ventas_${new Date().toISOString().split('T')[0]}`}
              className="h-12 px-6 rounded-lg font-bold"
            />
          )}
          {products.length > 0 ? (
            <Button
              onClick={handleOpenNew}
            >
              <Plus size={20} />
              Nueva Venta
            </Button>
          ) : (
            <Button
              disabled
            >
              <ShoppingBag size={20} />
              Sin productos
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <Card className="rounded-lg border-dashed border-2 py-16 bg-accent/5">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center mx-auto">
              <ShoppingBag size={32} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">No hay productos disponibles</p>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                Crea productos en el catálogo antes de registrar una venta.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      {(sales?.length ?? 0) === 0 && products.length > 0 ? (
        <EmptyState
          icon={History}
          title="No hay ventas registradas"
          description="Registra tu primera venta para comenzar a rastrear tu historial."
          actionLabel={<><Plus size={18} /> Registrar Primera Venta</>}
          onAction={handleOpenNew}
        />
      ) : (sales?.length ?? 0) > 0 && (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <History size={20} className="text-primary" />
              </div>
              <CardTitle className="text-xl">Historial</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-accent/5 hover:bg-accent/5">
                  <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold pl-4 sm:pl-6">Fecha</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Cliente</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold">Total</TableHead>
                  <TableHead className="h-10 text-[10px] uppercase tracking-widest font-bold text-right pr-4 sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sales ?? []).map((sale: any) => (
                  <TableRow key={sale.id} className="hover:bg-accent/30 group transition-colors border-border/10">
                    <TableCell className="py-4 pl-4 sm:pl-6">
                      <p className="text-xs font-bold text-foreground">{formatDate(sale.createdAt).split(',')[0]}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{formatDate(sale.createdAt).split(',')[1]}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-bold text-foreground">
                        {sale.customer?.name || "Venta General"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-tighter">
                        {sale.customer ? "Cliente Registrado" : "Sin cliente registrado"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-black text-primary">
                        {formatCurrency(Number(sale.totalAmount))}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-4 sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(sale)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <DeleteSaleButton
                          id={sale.id}
                          onDelete={deleteMutation.mutate}
                          loading={deleteMutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <SaleFormModal
            products={products}
            customers={customers}
            sale={editingSale}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  )
}