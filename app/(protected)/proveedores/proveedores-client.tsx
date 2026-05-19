'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Building2, Plus, Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react'
import { deleteSupplier } from '@/lib/actions/suppliers'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Modal } from '@/components/ui/modal'
import { SupplierFormModal } from '@/components/supplier-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { ExportButton } from '@/components/ui/export-button'

interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  purchaseCount: number
}

interface ProveedoresClientProps {
  suppliers: Supplier[]
}

export function ProveedoresClient({ suppliers }: ProveedoresClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleOpenNew = () => {
    setEditingSupplier(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingSupplier) return
    setIsDeleting(true)
    try {
      await deleteSupplier(deletingSupplier.id)
      setDeletingSupplier(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting supplier:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Red de Proveedores</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Gestiona tus fuentes de abastecimiento y relaciones comerciales.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center">
          {suppliers.length > 0 && (
            <ExportButton
              data={suppliers.map(s => ({
                'Nombre': s.name,
                'Teléfono': s.phone || '',
                'Email': s.email || '',
                'Dirección': s.address || '',
                'Compras Realizadas': s.purchaseCount
              }))}
              filename="Proveedores"
              className="h-12 px-6 rounded-lg font-bold"
            />
          )}
          <Button onClick={handleOpenNew} className='w-full md:w-auto'>
            <Plus size={20} />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Proveedores Registrados</p>
                <p className="text-3xl font-extrabold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-amber-500/10 to-amber-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Aliados Comerciales</p>
                <p className="text-3xl font-extrabold">{suppliers.filter(s => s.purchaseCount > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {suppliers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay proveedores registrados"
          description="Agrega empresas que te suministran insumos y materias primas."
          actionLabel={<><Plus size={18} /> Agregar Primer Proveedor</>}
          onAction={handleOpenNew}
        />
      ) : (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl">Lista de Proveedores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Proveedor</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Contacto</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Compras</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-accent/30 group transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{supplier.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin size={12} />
                          {supplier.address || 'Sin dirección'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-muted-foreground" />
                          {supplier.email || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone size={14} className="text-primary" />
                          {supplier.phone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary font-extrabold shadow-sm">
                          {supplier.purchaseCount}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Facturas</span>
                      </div>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(supplier)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        >
                          <Edit2 className='w-4 h-4 group-hover:text-primary' />
                        </Button>
                        <Button
                          onClick={() => setDeletingSupplier(supplier)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
                        >
                          <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                        </Button>
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
          <SupplierFormModal
            supplier={editingSupplier}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="¿Eliminar proveedor?"
        description={`¿Estás seguro de que deseas eliminar a "${deletingSupplier?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Proveedor"
        variant="danger"
      />
    </div>
  )
}