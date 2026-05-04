'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog } from './ui/dialog'
import { NumericInput } from './ui/numeric-input'
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, Factory, History } from 'lucide-react'
import { updateProductionYield, deleteProductionLog } from '@/lib/actions/production'
import { ConfirmationModal } from './ui/confirmation-modal'

export function ProductionTable({ logs }: { logs: any[] }) {
  const [editingLog, setEditingLog] = useState<any>(null)
  const [newYield, setNewYield] = useState<number>(0)
  const [deletingLog, setDeletingLog] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  const handleEdit = (log: any) => {
    setEditingLog(log)
    setNewYield(Number(log.actualYield))
  }

  const handleConfirmEdit = () => {
    if (!editingLog || newYield <= 0) return
    startTransition(async () => {
      await updateProductionYield(editingLog.id, newYield)
      setEditingLog(null)
    })
  }

  const handleConfirmDelete = () => {
    if (!deletingLog) return
    startTransition(async () => {
      await deleteProductionLog(deletingLog.id)
      setDeletingLog(null)
    })
  }

  if (logs.length === 0) {
    return (
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No hay historial de producción</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Ve a la pestaña de Productos y comienza a producir lotes para ver el registro aquí.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
        <CardHeader className="border-b border-border/30 bg-primary/5 px-5 py-4 mb-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary" />
            Historial de Producción
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-accent/5 hover:bg-accent/5">
                <TableHead className="text-xs uppercase tracking-widest font-bold">Fecha</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-bold">Producto</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-bold">Lotes</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-bold">Rendimiento</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-bold text-right sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 px-4 w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const diff = Number(log.actualYield) - Number(log.expectedYield)
                const isSurplus = diff > 0
                const isShortage = diff < 0

                return (
                  <TableRow key={log.id} className="hover:bg-accent/5 group">
                    <TableCell className="py-4 text-sm font-medium">
                      {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(log.date))}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-bold text-foreground">{log.product.name}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent/50 text-xs font-bold text-muted-foreground">
                        {Number(log.batches)} lote(s)
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black flex items-center gap-1">
                          {Number(log.actualYield)} uds
                          {isSurplus && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                          {isShortage && <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          Esperado: {Number(log.expectedYield)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 px-4 w-24">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEdit(log)}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-lg group"
                        >
                          <Edit2 className="w-4 h-4 group-hover:text-primary" />
                        </Button>
                        <Button
                          onClick={() => setDeletingLog(log)}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg group"
                        >
                          <Trash2 className="w-4 h-4 group-hover:text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title="Corregir Rendimiento"
      >
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">
              Producto: <strong className="text-foreground">{editingLog?.product.name}</strong>
            </p>
            <p className="text-sm font-medium mt-1">
              Rendimiento Esperado: <strong className="text-foreground">{Number(editingLog?.expectedYield)} uds</strong>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/90">
              Rendimiento Real Obtenido
            </label>
            <NumericInput
              value={newYield}
              onChange={setNewYield}
              className="h-12 text-lg font-black"
            />
            <p className="text-[10px] text-foreground/70">
              Al guardar, se ajustará automáticamente el inventario del producto final para reflejar este cambio.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button variant="ghost" onClick={() => setEditingLog(null)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmEdit} disabled={isPending || newYield <= 0} className="px-8">
              {isPending ? 'Guardando...' : 'Guardar Cambio'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Registro de Producción"
        description="¿Estás seguro de que deseas eliminar este registro de producción?"
        confirmText="Eliminar Registro"
        variant="danger"
      />
    </>
  )
}
