'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Settings, Receipt, DollarSign, Clock, FileSignature, Edit2, Trash2, XCircle } from 'lucide-react'
import { InvoiceFormModal } from './invoice-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { InvoicePDFButton } from './invoice-pdf-button'
import { ExportButton } from '@/components/ui/export-button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { BusinessSettings, BusinessSettingsModal } from './business-settings-modal'
import { deleteInvoice, cancelInvoice, updateInvoiceStatus } from '@/lib/actions/invoices'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  salePrice: number
  currentStock: number
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  tin: string | null
}

interface InvoiceItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Invoice {
  id: string
  folio: string
  customerName: string
  customerTin: string | null
  customerAddress: string | null
  customerEmail: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  notes: string | null
  issueDate: string
  customer: { name: string } | null
  invoiceItems: InvoiceItem[]
}

interface FacturasClientProps {
  invoices: Invoice[]
  customers: Customer[]
  products: Product[]
  businessSettings: BusinessSettings | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  issued: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-orange-100 text-orange-800'
}

export function FacturasClient({ invoices: initialInvoices, customers, products, businessSettings }: FacturasClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState(businessSettings)

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices')
      if (!res.ok) throw new Error('Error al cargar facturas')
      return res.json()
    },
    initialData: initialInvoices,
  })

  const safeInvoices = invoices ?? []
  const totalAmount = safeInvoices.reduce((sum: number, inv: Invoice) => sum + Number(inv.total), 0)
  const paidAmount = safeInvoices
    .filter((inv: Invoice) => inv.paymentStatus === 'paid')
    .reduce((sum: number, inv: Invoice) => sum + Number(inv.total), 0)
  const pendingAmount = totalAmount - paidAmount

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteInvoice(id)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] })
      const previous = queryClient.getQueryData<Invoice[]>(['invoices'])
      queryClient.setQueryData<Invoice[]>(['invoices'], (old) =>
        old?.filter((inv) => inv.id !== id) ?? []
      )
      setDeletingId(null)
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['invoices'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    setModalOpen(false)
    setEditingInvoice(null)
  }

  const handleOpenNew = () => {
    setEditingInvoice(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setModalOpen(true)
  }

  const handleSettingsSuccess = (updatedSettings?: any) => {
    setSettingsOpen(false)
    if (updatedSettings) {
      setLocalSettings(updatedSettings)
    } else {
      fetch('/api/business-settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setLocalSettings(data.settings)
          }
        })
        .catch(console.error)
    }
  }

  const exportData = safeInvoices.map((inv: Invoice) => ({
    Folio: inv.folio,
    'Fecha Emisión': formatDate(inv.issueDate),
    Cliente: inv.customerName,
    NIT: inv.customerTin || '-',
    Subtotal: inv.subtotal,
    'IVA': inv.taxAmount,
    Total: inv.total,
    Estado: inv.status === 'draft' ? 'Borrador' : inv.status === 'issued' ? 'Emitida' : inv.status === 'paid' ? 'Pagada' : 'Cancelada',
    'Estado Pago': inv.paymentStatus === 'pending' ? 'Pendiente' : inv.paymentStatus === 'paid' ? 'Pagado' : 'Parcial',
    'Método Pago': inv.paymentMethod || '-',
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Facturación</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Gestión de facturas y folios.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {safeInvoices.length > 0 && (
            <ExportButton
              data={exportData}
              filename={`Facturas_${new Date().toISOString().split('T')[0]}`}
              className="h-12 px-6 rounded-lg font-bold"
            />
          )}
          <Button variant="outline" onClick={() => setSettingsOpen(true)} className="w-full md:w-auto">
            <Settings size={20} />
            Configuración
          </Button>
          <Button onClick={handleOpenNew} className="w-full md:w-auto">
            <Plus size={20} />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Facturado</p>
                <p className="text-3xl font-extrabold">{formatCurrency(Number(totalAmount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Cobrado</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(paidAmount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-amber-500/10 to-amber-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Pendiente</p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(Number(pendingAmount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-violet-500/10 to-violet-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileSignature className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Total Facturas</p>
                <p className="text-3xl font-extrabold">{safeInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {localSettings && (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
          <CardContent className="py-3 px-8">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{localSettings.businessName}</span>
              <div className="flex gap-4 text-muted-foreground">
                {localSettings.tin && <span>NIT: {localSettings.tin}</span>}
                <span>IVA: {Number(localSettings.taxRate)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {safeInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay facturas"
          description="Crea tu primera factura para comenzar"
          actionLabel={<><Plus size={18} /> Nueva Factura</>}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl">Facturas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Folio</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Fecha</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Cliente</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Total</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Estado</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">Pago</TableHead>
                  <TableHead className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground text-right sticky right-0 bg-card z-20 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-24 pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">{invoice.folio}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <div>{invoice.customerName}</div>
                      {invoice.customerTin && (
                        <div className="text-xs text-muted-foreground">NIT: {invoice.customerTin}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(invoice.total))}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter ${statusColors[invoice.status] || 'bg-accent/50 text-muted-foreground'}`}>
                        {invoice.status === 'draft' ? 'Borrador' :
                          invoice.status === 'issued' ? 'Emitida' :
                            invoice.status === 'paid' ? 'Pagada' : 'Cancelada'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter ${paymentStatusColors[invoice.paymentStatus] || 'bg-accent/50 text-muted-foreground'}`}>
                        {invoice.paymentStatus === 'pending' ? 'Pendiente' :
                          invoice.paymentStatus === 'paid' ? 'Pagado' : 'Parcial'}
                      </span>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-card z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] border-l border-border/10 w-32 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <InvoicePDFButton invoice={invoice} businessSettings={localSettings} />
                        <Button
                          onClick={() => handleOpenEdit(invoice)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        {invoice.status !== 'cancelled' && (
                          <Button
                            onClick={async () => {
                              if (confirm('¿Cancelar esta factura? Se devolverá el stock.')) {
                                await cancelInvoice(invoice.id)
                                queryClient.invalidateQueries({ queryKey: ['invoices'] })
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                          >
                            <XCircle className='w-4 h-4' />
                          </Button>
                        )}
                        <Button
                          onClick={() => setDeletingId(invoice.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className='w-4 h-4' />
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

      <InvoiceFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingInvoice(null) }}
        onSuccess={handleSuccess}
        customers={customers}
        products={products}
        businessSettings={localSettings}
        invoice={editingInvoice}
      />

      <BusinessSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSuccess={handleSettingsSuccess}
        settings={localSettings || { id: '', businessName: '', tin: null, address: null, phone: null, email: null, taxRate: 19, currency: 'COP' }}
      />

      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        loading={deleteMutation.isPending}
        title="¿Eliminar factura?"
        description="Se devolverá el stock de los productos y la factura se eliminará permanentemente."
        confirmText="Eliminar Factura"
        variant="danger"
      />
    </div>
  )
}
