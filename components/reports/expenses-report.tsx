'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { formatCurrency } from '@/lib/utils'
import { Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#666' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, borderBottom: '1 solid #ddd', paddingBottom: 5 },
  table: { marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottom: '1 solid #ddd', padding: 8 },
  tableHeaderCell: { fontSize: 10, fontWeight: 'bold', color: '#666', flex: 1 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #eee', padding: 8 },
  tableCell: { fontSize: 10, flex: 1 },
  totalRow: { flexDirection: 'row', borderTop: '2 solid #333', padding: 8, marginTop: 10 },
  totalLabel: { fontSize: 12, fontWeight: 'bold', flex: 2 },
  totalValue: { fontSize: 12, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #ddd', paddingTop: 10, fontSize: 8, color: '#999' }
})

interface ExpensesData {
  expenses: any[]
  byCategory: Record<string, number>
  total: number
  startDate: string
  endDate: string
}

function ExpensesPDF({ data }: { data: ExpensesData }) {
  const categories = Object.entries(data.byCategory)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Gastos Indirectos</Text>
          <Text style={styles.subtitle}>Periodo: {data.startDate || 'Inicio'} - {data.endDate || 'Actual'}</Text>
          <Text style={styles.subtitle}>Generado: {new Date().toLocaleDateString('es-CO')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen por Categoría</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Categoría</Text>
              <Text style={styles.tableHeaderCell}>Total</Text>
            </View>
            {categories.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>No hay gastos en este periodo</Text>
              </View>
            ) : (
              categories.map(([category, amount], i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{category}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(amount)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Gastos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Tipo</Text>
              <Text style={styles.tableHeaderCell}>Descripción</Text>
              <Text style={styles.tableHeaderCell}>Monto</Text>
            </View>
            {data.expenses.map((exp, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{exp.date?.split('T')[0] || '-'}</Text>
                <Text style={styles.tableCell}>{exp.type}</Text>
                <Text style={styles.tableCell}>{exp.description || '-'}</Text>
                <Text style={styles.tableCell}>{formatCurrency(Number(exp.amount))}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL GASTOS</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Loki - Sistema de Gestión Empresarial</Text>
        </View>
      </Page>
    </Document>
  )
}

export function ExpensesReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [showPreview, setShowPreview] = useState(false)

  const { data, isLoading, error } = useQuery<ExpensesData>({
    queryKey: ['expenses-report', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/reports/expenses?${params}`)
      if (!res.ok) throw new Error('Error al cargar reporte de gastos')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-44 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar el reporte. Intenta de nuevo.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="rounded-lg"
        >
          <Eye size={18} className="mr-2" />
          {showPreview ? 'Ocultar Vista' : 'Vista Previa'}
        </Button>
        <PDFDownloadLink
          document={<ExpensesPDF data={data} />}
          fileName={`reporte-gastos-${startDate || 'inicio'}-${endDate || 'fin'}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading} className="rounded-lg">
              <Download size={18} className="mr-2" />
              {loading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {showPreview && (
        <div className="h-[600px] border border-border rounded-lg overflow-hidden">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <ExpensesPDF data={data} />
          </PDFViewer>
        </div>
      )}
    </div>
  )
}