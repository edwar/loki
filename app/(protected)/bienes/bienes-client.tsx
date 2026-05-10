'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Modal } from '@/components/ui/modal'
import { PropertyFormModal } from '@/components/property-form-modal'

const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'mueble', label: 'Mueble' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'otro', label: 'Otro' },
]

interface Property {
  id: string
  name: string
  type: string
  address: string | null
  purchaseValue: number
  currentValue: number
  purchaseDate: string | null
  description: string | null
}

interface BienesClientProps {
  properties: Property[]
}

export function BienesClient({ properties }: BienesClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleOpenNew = () => {
    setEditingProperty(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await fetch(`/api/properties?id=${deletingId}`, { method: 'DELETE' })
      setDeletingId(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting property:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const typeLabel = (type: string) => PROPERTY_TYPES.find(t => t.value === type)?.label || type

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Bienes y Activos</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Gestiona los activos de tu empresa y su valoración.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nuevo Bien
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Card className="rounded-lg border-none bg-linear-to-br from-primary/10 to-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Bienes</p>
                <p className="text-3xl font-extrabold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-none bg-linear-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-2xl text-white">$</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Valor Total</p>
                <p className="text-3xl font-extrabold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {properties.length === 0 ? (
        <Card className="rounded-lg border-dashed border-2 py-16 bg-accent/5">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center mx-auto">
              <Building2 size={32} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">No hay bienes registrados</p>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                Registra tus activos para mantener un control de su valor.
              </p>
            </div>
            <button
              onClick={handleOpenNew}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors mx-auto"
            >
              <Plus size={18} />
              Agregar Primer Bien
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-8 py-6 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-xl">Lista de Bienes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border/30 bg-accent/5">
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8 py-4">Nombre</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Tipo</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Dirección</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Valor Compra</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Valor Actual</th>
                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8 py-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-border/10 hover:bg-accent/30 transition-colors group">
                    <td className="px-8 py-4">
                      <p className="font-bold text-lg">{property.name}</p>
                      {property.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{property.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-accent/50 text-muted-foreground rounded-lg text-xs font-bold uppercase tracking-tighter">
                        {typeLabel(property.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{property.address || '-'}</td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">{formatCurrency(property.purchaseValue)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-primary">{formatCurrency(property.currentValue)}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(property)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        >
                          <Edit2 className='w-4 h-4 group-hover:text-primary' />
                        </Button>
                        <Button
                          onClick={() => setDeletingId(property.id)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors group"
                        >
                          <Trash2 className='w-4 h-4 group-hover:text-rose-500' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <PropertyFormModal
            property={editingProperty}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="¿Eliminar bien?"
        description="Esta acción no se puede deshacer. El bien será eliminado permanentemente de tu registro."
        confirmText="Eliminar Bien"
        variant="danger"
      />
    </div>
  )
}