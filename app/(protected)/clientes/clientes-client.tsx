'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Users, Plus, Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react'
import { deleteCustomer } from '@/lib/actions/customers'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Modal } from '@/components/ui/modal'
import { CustomerFormModal } from '@/components/customer-form-modal'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  saleCount: number
}

interface ClientesClientProps {
  customers: Customer[]
}

export function ClientesClient({ customers }: ClientesClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleOpenNew = () => {
    setEditingCustomer(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingCustomer) return
    setIsDeleting(true)
    try {
      await deleteCustomer(deletingCustomer.id)
      setDeletingCustomer(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Directorio de Clientes</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Administra tu base de datos y fideliza a tus compradores.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Clientes Registrados</p>
                <p className="text-3xl font-extrabold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Clientes Activos</p>
                <p className="text-3xl font-extrabold">{customers.filter(c => c.saleCount > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <Card className="rounded-lg border-dashed border-2 py-16 bg-accent/5">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center mx-auto">
              <Users size={32} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">No hay clientes registrados</p>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                Agrega tus clientes para llevar un seguimiento de sus compras.
              </p>
            </div>
            <button
              onClick={handleOpenNew}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors mx-auto"
            >
              <Plus size={18} />
              Agregar Primer Cliente
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl">Base de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Cliente</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Contacto</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Ventas</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-accent/30 group transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{customer.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin size={12} />
                          {customer.address || 'Sin dirección'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-muted-foreground" />
                          {customer.email || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone size={14} className="text-primary" />
                          {customer.phone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-primary">{customer.saleCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compras</span>
                      </div>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(customer)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        >
                          <Edit2 className='w-4 h-4 group-hover:text-primary' />
                        </Button>
                        <Button
                          onClick={() => setDeletingCustomer(customer)}
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
          <CustomerFormModal
            customer={editingCustomer}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="¿Eliminar cliente?"
        description={`¿Estás seguro de que deseas eliminar a "${deletingCustomer?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cliente"
        variant="danger"
      />
    </div>
  )
}