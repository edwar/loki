'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Settings } from 'lucide-react'
import { InvoiceFormModal } from './invoice-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { InvoicePDFButton } from './invoice-pdf-button'
import { BusinessSettings, BusinessSettingsModal } from './business-settings-modal'

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

export function FacturasClient({ invoices, customers, products, businessSettings }: FacturasClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(businessSettings)

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
  const paidAmount = invoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0)
  const pendingAmount = totalAmount - paidAmount

  const handleSuccess = () => {
    router.refresh()
    setModalOpen(false)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Facturación</h1>
          <p className="text-muted-foreground">Gestión de facturas y folios</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Facturado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(totalAmount))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cobrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(Number(paidAmount))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(Number(pendingAmount))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {businessSettings && (
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{businessSettings.businessName}</span>
              <div className="flex gap-4 text-muted-foreground">
                {businessSettings.tin && <span>NIT: {businessSettings.tin}</span>}
                <span>IVA: {Number(businessSettings.taxRate)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay facturas"
              description="Crea tu primera factura para comenzar"
              actionLabel="Nueva Factura"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                          {invoice.status === 'draft' ? 'Borrador' :
                            invoice.status === 'issued' ? 'Emitida' :
                              invoice.status === 'paid' ? 'Pagada' : 'Cancelada'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${paymentStatusColors[invoice.paymentStatus] || 'bg-gray-100'}`}>
                          {invoice.paymentStatus === 'pending' ? 'Pendiente' :
                            invoice.paymentStatus === 'paid' ? 'Pagado' : 'Parcial'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <InvoicePDFButton invoice={invoice} businessSettings={businessSettings} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <InvoiceFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
          customers={customers}
          products={products}
          businessSettings={localSettings}
        />
      )}

      {settingsOpen && (
        <div className="p-8">
          <BusinessSettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onSuccess={handleSettingsSuccess}
            settings={businessSettings || { id: '', businessName: '', tin: null, address: null, phone: null, email: null, taxRate: 16, currency: 'MXN' }}
          />
        </div>
      )}
    </div>
  )
}
