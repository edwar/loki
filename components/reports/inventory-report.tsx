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
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #ddd', paddingTop: 10, fontSize: 8, color: '#999' },
  alert: { backgroundColor: '#fff3cd', padding: 10, borderRadius: 4, marginBottom: 10 }
})

interface InventoryData {
  supplies: any[]
  totalValue: number
  lowStock: any[]
  criticalCount: number
}

function InventoryPDF({ data }: { data: InventoryData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Estado de Inventario</Text>
          <Text style={styles.subtitle}>Fecha de generación: {new Date().toLocaleDateString('es-CO')}</Text>
        </View>

        {data.criticalCount > 0 && (
          <View style={styles.alert}>
            <Text style={{ fontSize: 10, color: '#856404' }}>
              ⚠ {data.criticalCount} insumo(s) con stock crítico (por debajo del mínimo)
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Insumos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Nombre</Text>
              <Text style={styles.tableHeaderCell}>Categoría</Text>
              <Text style={styles.tableHeaderCell}>Stock</Text>
              <Text style={styles.tableHeaderCell}>Valor Unit.</Text>
              <Text style={styles.tableHeaderCell}>Valor Total</Text>
            </View>
            {data.supplies.map((s, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{s.name}</Text>
                <Text style={styles.tableCell}>{s.category || '-'}</Text>
                <Text style={styles.tableCell}>{s.currentStock} {s.unit}</Text>
                <Text style={styles.tableCell}>{formatCurrency(Number(s.purchasePrice))}</Text>
                <Text style={styles.tableCell}>{formatCurrency(s.currentStock * s.purchasePrice)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VALOR TOTAL INVENTARIO</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.totalValue)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Loki - Sistema de Gestión Empresarial</Text>
        </View>
      </Page>
    </Document>
  )
}

export function InventoryReport() {
  const [showPreview, setShowPreview] = useState(false)

  const { data, isLoading, error } = useQuery<InventoryData>({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const res = await fetch('/api/reports/inventory')
      if (!res.ok) throw new Error('Error al cargar reporte de inventario')
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
          document={<InventoryPDF data={data} />}
          fileName={`estado-inventario-${new Date().toISOString().split('T')[0]}.pdf`}
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
            <InventoryPDF data={data} />
          </PDFViewer>
        </div>
      )}
    </div>
  )
}