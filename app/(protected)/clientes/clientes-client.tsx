'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Users, Plus, Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Modal } from '@/components/ui/modal'
import { CustomerFormModal } from '@/components/customer-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCustomer } from '@/lib/actions/customers'

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

export function ClientesClient({ customers: initialCustomers }: ClientesClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers')
      if (!res.ok) throw new Error('Error al cargar clientes')
      return res.json()
    },
    initialData: initialCustomers,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] })
      const previous = queryClient.getQueryData<Customer[]>(['customers'])
      queryClient.setQueryData<Customer[]>(['customers'], (old) =>
        old?.filter((c) => c.id !== id) ?? []
      )
      setDeletingCustomer(null)
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['customers'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const handleOpenNew = () => {
    setEditingCustomer(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setModalOpen(true)
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
        <Button onClick={handleOpenNew}>
          <Plus size={20} />
          Nuevo Cliente
        </Button>
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
                <p className="text-3xl font-extrabold">{(customers ?? []).length}</p>
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
                <p className="text-3xl font-extrabold">{(customers ?? []).filter((c: Customer) => c.saleCount > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {(customers?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay clientes registrados"
          description="Agrega tus clientes para llevar un seguimiento de sus compras."
          actionLabel={<><Plus size={18} /> Agregar Primer Cliente</>}
          onAction={handleOpenNew}
        />
      ) : (
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
            {(customers ?? []).map((customer: Customer) => (
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
        onConfirm={() => deletingCustomer && deleteMutation.mutate(deletingCustomer.id)}
        loading={deleteMutation.isPending}
        title="¿Eliminar cliente?"
        description={`¿Estás seguro de que deseas eliminar a "${deletingCustomer?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cliente"
        variant="danger"
      />
    </div>
  )
}