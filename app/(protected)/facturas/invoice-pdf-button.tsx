'use client'

import { Download, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface InvoiceItem {
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
  paymentMethod: string | null
  notes: string | null
  issueDate: string
  invoiceItems: InvoiceItem[]
}

interface BusinessSettings {
  businessName: string
  tin: string | null
  address: string | null
  phone: string | null
  email: string | null
  taxRate: number
}

interface Props {
  invoice: Invoice
  businessSettings: BusinessSettings | null
}

export function InvoicePDFButton({ invoice, businessSettings }: Props) {
  const [loading, setLoading] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX')
  }

  const handleDownload = () => {
    setLoading(true)
    
    setTimeout(() => {
      const bs = businessSettings || { businessName: 'Mi Negocio', tin: '', address: '', phone: '', email: '', taxRate: 16 }
      
      const paymentMethodLabels: Record<string, string> = {
        efectivo: 'Efectivo',
        transferencia: 'Transferencia',
        tarjeta: 'Tarjeta de Débito/Crédito',
        otro: 'Otro'
      }

      let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura ${invoice.folio}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .business-name { font-size: 24px; font-weight: bold; }
    .invoice-title { font-size: 20px; font-weight: bold; text-align: right; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f3f4f6; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; text-align: right; }
    .total-row { display: flex; justify-content: flex-end; padding: 5px 0; }
    .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="business-name">${bs.businessName}</div>
      ${bs.tin ? `<div>NIT: ${bs.tin}</div>` : ''}
      ${bs.address ? `<div>${bs.address}</div>` : ''}
      ${bs.phone ? `<div>Tel: ${bs.phone}</div>` : ''}
    </div>
    <div>
      <div class="invoice-title">FACTURA</div>
      <div>Folio: ${invoice.folio}</div>
      <div>Fecha: ${formatDate(invoice.issueDate)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">CLIENTE</div>
    <div><strong>Nombre:</strong> ${invoice.customerName}</div>
    ${invoice.customerTin ? `<div><strong>NIT:</strong> ${invoice.customerTin}</div>` : ''}
    ${invoice.customerAddress ? `<div><strong>Dirección:</strong> ${invoice.customerAddress}</div>` : ''}
    ${invoice.customerEmail ? `<div><strong>Email:</strong> ${invoice.customerEmail}</div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">PRODUCTOS</div>
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th class="text-right">Cantidad</th>
          <th class="text-right">P. Unitario</th>
          <th class="text-right">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.invoiceItems.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.subtotal)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-row"><span>Subtotal:</span> <span>${formatCurrency(invoice.subtotal)}</span></div>
    <div class="total-row"><span>IVA (${invoice.taxRate}%):</span> <span>${formatCurrency(invoice.taxAmount)}</span></div>
    <div class="total-row grand-total"><span>Total:</span> <span>${formatCurrency(invoice.total)}</span></div>
  </div>

  ${invoice.paymentMethod ? `<div style="margin-top: 15px;"><strong>Método de Pago:</strong> ${paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod}</div>` : ''}
  ${invoice.notes ? `<div style="margin-top: 15px;"><strong>Notas:</strong> ${invoice.notes}</div>` : ''}

  <div class="footer">
    <p>Gracias por su preferencia</p>
  </div>
</body>
</html>`

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.print()
      }
      setLoading(false)
    }, 500)
  }

  if (invoice.status === 'cancelled') {
    return <span className="text-muted-foreground text-xs">Cancelada</span>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    </Button>
  )
}