'use client'

import { useState, useEffect } from 'react'
import { Document, Page, Text, View, StyleSheet, usePDF } from '@react-pdf/renderer'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { NumericInput } from '@/components/ui/numeric-input'
import { Trash2, Download, ShoppingCart } from 'lucide-react'
import { getCart, getConsolidatedList, updateLots, removeFromCart, clearCart, type ConsolidatedSupply } from '@/lib/shopping-cart'
import { formatCurrency } from '@/lib/utils'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 11, color: '#666', marginBottom: 3 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, borderBottom: '1 solid #ddd', paddingBottom: 4 },
  table: { marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottom: '1 solid #ddd', padding: 6 },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', color: '#666', flex: 1 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #eee', padding: 6 },
  tableCell: { fontSize: 9, flex: 1 },
  detailCell: { fontSize: 7, color: '#999', flex: 1 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #ddd', paddingTop: 8, fontSize: 8, color: '#999' },
})

function ShoppingListPDF({ list, date }: { list: ConsolidatedSupply[]; date: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista de Compra</Text>
          <Text style={styles.subtitle}>Generada el: {date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insumos Requeridos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Insumo</Text>
              <Text style={styles.tableHeaderCell}>Cantidad Total</Text>
              <Text style={styles.tableHeaderCell}>Unidad</Text>
              <Text style={styles.tableHeaderCell}>Para Producto(s)</Text>
            </View>
            {list.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>No hay insumos en la lista</Text>
              </View>
            ) : (
              list.map((item, i) => (
                <View key={i}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.name}</Text>
                    <Text style={styles.tableCell}>{Number(item.totalQuantity.toFixed(2))}</Text>
                    <Text style={styles.tableCell}>{item.unit}</Text>
                    <Text style={styles.tableCell}>
                      {item.products.map((p) => `${p.name} (${p.lots} lote${p.lots > 1 ? 's' : ''})`).join(', ')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Loki - Sistema de Gestión Empresarial</Text>
        </View>
      </Page>
    </Document>
  )
}

interface ShoppingCartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCartModal({ isOpen, onClose }: ShoppingCartModalProps) {
  const [cart, setCart] = useState(getCart())
  const [consolidated, setConsolidated] = useState<ConsolidatedSupply[]>([])

  useEffect(() => {
    if (isOpen) {
      setCart(getCart())
      setConsolidated(getConsolidatedList())
    }
  }, [isOpen])

  const refresh = () => {
    setCart(getCart())
    setConsolidated(getConsolidatedList())
  }

  const totalLots = cart.reduce((acc, item) => acc + item.lots, 0)
  const totalSupplies = consolidated.reduce((acc, item) => acc + item.totalQuantity, 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lista de Compra (${cart.length} producto${cart.length !== 1 ? 's' : ''})`}>
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">La lista está vacía</p>
            <p className="text-sm">Agrega productos desde las tarjetas de catálogo.</p>
          </div>
        ) : (
          <>
            {/* Product list */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Productos ({cart.length}) — {totalLots} lote{totalLots !== 1 ? 's' : ''}
              </h3>
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-accent/10 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.productName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.recipeItems.length} insumo{item.recipeItems.length !== 1 ? 's' : ''} por lote
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <NumericInput
                      value={item.lots}
                      onChange={(v) => { updateLots(item.productId, v); refresh() }}
                      min={1}
                      className="h-8 w-16 text-xs font-bold text-center"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { removeFromCart(item.productId); refresh() }}
                      className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Consolidated list */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Insumos Requeridos ({consolidated.length}) — {totalSupplies.toFixed(1)} unidades totales
              </h3>
              <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/5">
                      <th className="text-left py-2 px-3 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Insumo</th>
                      <th className="text-left py-2 px-3 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Cantidad</th>
                      <th className="text-left py-2 px-3 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hidden sm:table-cell">Para</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidated.map((item, i) => (
                      <tr key={i} className="border-t border-border/30">
                        <td className="py-2 px-3 font-medium">{item.name}</td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-accent/50 text-muted-foreground rounded-md">
                            {Number(item.totalQuantity.toFixed(2))} {item.unit}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-muted-foreground hidden sm:table-cell">
                          {item.products.map((p) => `${p.name} (${p.lots} lote${p.lots > 1 ? 's' : ''})`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <DownloadButton consolidated={consolidated} />
              <Button
                variant="outline"
                onClick={() => { clearCart(); refresh(); onClose() }}
                className="h-11 font-bold rounded-lg"
              >
                Limpiar Lista
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function DownloadButton({ consolidated }: { consolidated: ConsolidatedSupply[] }) {
  const [instance] = usePDF({
    document: <ShoppingListPDF list={consolidated} date={new Date().toLocaleDateString('es-CO')} />,
  })

  const handleClick = () => {
    if (!instance.url) return
    const a = document.createElement('a')
    a.href = instance.url
    a.download = `lista-compra-${new Date().toISOString().split('T')[0]}.pdf`
    a.click()
  }

  return (
    <Button disabled={instance.loading} onClick={handleClick} className="w-full h-11 font-bold rounded-lg">
      <Download size={18} className="mr-2" />
      {instance.loading ? 'Generando PDF...' : 'Descargar PDF'}
    </Button>
  )
}
