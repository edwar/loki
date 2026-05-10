'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #ddd',
    paddingBottom: 5
  },
  table: {
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #ddd',
    padding: 8
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    padding: 8
  },
  tableCell: {
    fontSize: 10,
    flex: 1
  },
  totalRow: {
    flexDirection: 'row',
    borderTop: '2 solid #333',
    padding: 8,
    marginTop: 10
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 2
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #ddd',
    paddingTop: 10,
    fontSize: 8,
    color: '#999'
  }
})

interface SalesData {
  sales: any[]
  total: number
  startDate: string
  endDate: string
}

function SalesPDF({ data }: { data: SalesData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Ventas</Text>
          <Text style={styles.subtitle}>
            Periodo: {data.startDate || 'Inicio'} - {data.endDate || 'Actual'}
          </Text>
          <Text style={styles.subtitle}>Generado: {new Date().toLocaleDateString('es-CO')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Ventas</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Cliente</Text>
              <Text style={styles.tableHeaderCell}>Items</Text>
              <Text style={styles.tableHeaderCell}>Total</Text>
            </View>
            {data.sales.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>No hay ventas en este periodo</Text>
              </View>
            ) : (
              data.sales.map((sale, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(sale.createdAt)}</Text>
                  <Text style={styles.tableCell}>{sale.customer?.name || 'Venta General'}</Text>
                  <Text style={styles.tableCell}>{sale.saleItems?.length || 0}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(Number(sale.totalAmount))}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Loki - Sistema de Gestión Empresarial</Text>
        </View>
      </Page>
    </Document>
  )
}

export function SalesReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<SalesData>({ sales: [], total: 0, startDate, endDate })

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/reports/sales?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    }
    fetchData()
  }, [startDate, endDate])

  return (
    <div className="space-y-4">
      <PDFDownloadLink
        document={<SalesPDF data={data} />}
        fileName={`reporte-ventas-${startDate || 'inicio'}-${endDate || 'fin'}.pdf`}
        className="inline-flex"
      >
        {({ loading }) => (
          <Button disabled={loading} className="rounded-lg">
            <Download size={18} className="mr-2" />
            {loading ? 'Generando...' : 'Descargar PDF'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}