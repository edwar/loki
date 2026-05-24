'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import { Package, TrendingUp, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { SupplyTable } from '@/components/supply-table'
import { ExportButton } from '@/components/ui/export-button'
import { formatDate } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { PurchaseForm } from '@/components/purchase-form'
import { SupplyForm } from '@/components/supply-form'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSupply } from '@/lib/actions/supplies'

interface Supplier {
  id: string
  name: string
}

interface Supply {
  id: string
  name: string
  category: string | null
  unit: string
  currentStock: number
  minStock: number
  purchasePrice: number
  supplier: { name: string } | null
  updatedAt: string
}

interface InventarioClientProps {
  supplies: Supply[]
  suppliers: Supplier[]
}

export function InventarioClient({ supplies: initialSupplies, suppliers }: InventarioClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [supplyModalOpen, setSupplyModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const { data: supplies } = useQuery({
    queryKey: ['supplies'],
    queryFn: async () => {
      const res = await fetch('/api/supplies')
      if (!res.ok) throw new Error('Error al cargar insumos')
      return res.json()
    },
    initialData: initialSupplies,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupply(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['supplies'] })
      const previous = queryClient.getQueryData<any[]>(['supplies'])
      queryClient.setQueryData<any[]>(['supplies'], (old) =>
        old?.filter((s) => s.id !== id) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['supplies'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] })
    },
  })

  const safeSupplies = supplies ?? []
  const totalValue = safeSupplies.reduce((sum: number, s: any) => sum + s.currentStock * s.purchasePrice, 0)
  const lowStockCount = safeSupplies.filter((s: any) => s.currentStock < s.minStock).length

  const totalPages = Math.ceil(safeSupplies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSupplies = safeSupplies.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const exportData = safeSupplies.map((supply: any) => ({
    'Nombre': supply.name,
    'Categoría': supply.category || 'N/A',
    'Unidad': supply.unit,
    'Stock Actual': supply.currentStock,
    'Stock Mínimo': supply.minStock,
    'Precio Unitario': supply.purchasePrice,
    'Valor Total': supply.currentStock * supply.purchasePrice,
    'Proveedor': supply.supplier?.name || 'N/A',
    'Última Actualización': formatDate(supply.updatedAt)
  }))

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['supplies'] })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Inventario</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Controla tu stock de insumos y registra compras.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {safeSupplies.length > 0 && (
            <ExportButton
              data={exportData}
              filename={`Inventario_${new Date().toISOString().split('T')[0]}`}
              className="h-12 px-6 rounded-lg font-bold"
            />
          )}
          <Button
            onClick={() => setSupplyModalOpen(true)}
            variant='secondary'
          >
            <Plus size={20} />
            Nuevo Insumo
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
          >
            <Plus size={20} />
            Registrar Compra
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Insumos Totales</p>
                <p className="text-3xl font-extrabold">{safeSupplies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-violet-500/10 to-violet-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Valor de Inventario</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "rounded-lg border-none shadow-sm overflow-hidden relative group",
          lowStockCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
        )}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-current/10 rounded-full blur-2xl group-hover:bg-current/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg",
                lowStockCount > 0 ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
              )}>
                {lowStockCount > 0 ? <AlertCircle className="w-6 h-6 text-white" /> : <Package className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {lowStockCount > 0 ? 'Stock Bajo' : 'Inventario Óptimo'}
                </p>
                <p className="text-3xl font-extrabold">{lowStockCount > 0 ? lowStockCount : 'OK'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
        <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
          <CardTitle className="text-xl">Detalle de Existencias</CardTitle>
        </CardHeader>
        <CardContent className="p-0 [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent">
          <SupplyTable
            supplies={paginatedSupplies}
            suppliers={suppliers}
            onDelete={deleteMutation.mutate}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Mostrar:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground font-medium ml-2">
              de {safeSupplies.length} insumos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  className={cn("h-9 w-9 rounded-lg", currentPage === page && "pointer-events-none")}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Compra */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <PurchaseForm
            suppliers={suppliers}
            supplies={safeSupplies.map((s: any) => ({ id: s.id, name: s.name, unit: s.unit }))}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Modal Crear Insumo */}
      <Modal isOpen={supplyModalOpen} onClose={() => setSupplyModalOpen(false)}>
        <div className="p-8">
          <SupplyForm
            onSuccess={handleSuccess}
            onClose={() => setSupplyModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  )
}