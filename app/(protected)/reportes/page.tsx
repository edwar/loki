'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { FileText, TrendingUp, Receipt, Package, Building2, Download } from 'lucide-react'
import { ReportCard } from '@/components/reports/report-card'
import { SalesReport } from '@/components/reports/sales-report'
import { ExpensesReport } from '@/components/reports/expenses-report'
import { InventoryReport } from '@/components/reports/inventory-report'

interface ReportConfig {
  type: string
  title: string
  description: string
  icon: any
  color: string
}

const reportTypes: ReportConfig[] = [
  {
    type: 'sales',
    title: 'Reporte de Ventas',
    description: 'Resumen de ventas por periodo con totales y tendencias',
    icon: TrendingUp,
    color: 'bg-primary'
  },
  {
    type: 'expenses',
    title: 'Reporte de Gastos',
    description: 'Desglose de gastos indirectos por categoría',
    icon: Receipt,
    color: 'bg-rose-500'
  },
  {
    type: 'inventory',
    title: 'Estado de Inventario',
    description: 'Stock actual, valor total y productos críticos',
    icon: Package,
    color: 'bg-emerald-500'
  }
]

export default function ReportesPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-display">Reportes</h1>
        <p className="text-muted-foreground font-medium mt-1">
          Genera reportes en PDF para análisis y archivo.
        </p>
      </div>

      {!selectedReport ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <ReportCard
              key={report.type}
              type={report.type}
              title={report.title}
              description={report.description}
              icon={report.icon}
              color={report.color}
              onClick={() => setSelectedReport(report.type)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedReport(null)}
              className="rounded-lg"
            >
              ← Volver
            </Button>
            <h2 className="text-xl font-bold">
              {reportTypes.find(r => r.type === selectedReport)?.title}
            </h2>
          </div>

          <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
            <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Configuración del Reporte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha Inicio</label>
                  <DatePicker
                    value={dateRange.start}
                    onChange={(date) => handleDateRangeChange('start', date)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha Fin</label>
                  <DatePicker
                    value={dateRange.end}
                    onChange={(date) => handleDateRangeChange('end', date)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Formato</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="h-12 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedReport === 'sales' && <SalesReport startDate={dateRange.start} endDate={dateRange.end} />}
          {selectedReport === 'expenses' && <ExpensesReport startDate={dateRange.start} endDate={dateRange.end} />}
          {selectedReport === 'inventory' && <InventoryReport />}
        </div>
      )}
    </div>
  )
}