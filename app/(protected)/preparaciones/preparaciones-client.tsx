'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, FlaskConical } from 'lucide-react'
import { PreparationCard } from '@/components/preparation-card'
import { Modal } from '@/components/ui/modal'
import { PreparationFormModal } from '@/components/preparation-form-modal'
import { PreparationProductionModal } from '@/components/preparation-production-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

interface Supply {
  id: string
  name: string
  unit: string
  currentStock: number
  purchasePrice: number
  unitsPerPack: number
}

interface Ingredient {
  id: string
  quantity: number
  unit: string
  supply?: {
    id: string
    name: string
    unit: string
    currentStock: number
    purchasePrice: number
  } | null
  subPreparation?: {
    id: string
    name: string
    unit: string
    currentStock: number
    costPrice: number
  } | null
}

interface Preparation {
  id: string
  name: string
  description: string | null
  unit: string
  yield: number
  currentStock: number
  minStock: number
  costPrice: number
  notes: string | null
  ingredients: Ingredient[]
}

interface PreparacionesClientProps {
  preparations: Preparation[]
  supplies: Supply[]
}

export function PreparacionesClient({ preparations: initialPreparations, supplies }: PreparacionesClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [productionModalOpen, setProductionModalOpen] = useState(false)
  const [selectedPrepId, setSelectedPrepId] = useState<string | null>(null)
  const [editingPreparation, setEditingPreparation] = useState<Preparation | null>(null)

  const { data: preparations } = useQuery<Preparation[]>({
    queryKey: ['preparations'],
    queryFn: async () => {
      const res = await fetch('/api/preparations')
      if (!res.ok) throw new Error('Error al cargar preparaciones')
      return res.json()
    },
    initialData: initialPreparations,
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['preparations'] })
    setModalOpen(false)
    setEditingPreparation(null)
  }

  const handleOpenNew = () => {
    setEditingPreparation(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (prep: Preparation) => {
    setEditingPreparation(prep)
    setModalOpen(true)
  }

  const handleOpenProduce = (prepId: string) => {
    setSelectedPrepId(prepId)
    setProductionModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Catálogo de Preparaciones</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Define preparaciones intermedias (mermeladas, salsas, masas) para usar como ingredientes en tus productos.
          </p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus size={20} />
          Nueva Preparación
        </Button>
      </div>

      <div className="grid gap-8">
        {(preparations ?? []).map((prep, index) => (
          <PreparationCard
            key={prep.id}
            preparation={prep}
            supplies={supplies}
            allPreparations={preparations ?? []}
            index={index}
            onEdit={() => handleOpenEdit(prep)}
            onProduce={() => handleOpenProduce(prep.id)}
          />
        ))}

        {(preparations ?? []).length === 0 && (
          <EmptyState
            icon={FlaskConical}
            title="No hay preparaciones registradas"
            description="Crea preparaciones intermedias como mermeladas, salsas o masas para usar en tus recetas."
            actionLabel={<><Plus size={18} /> Crear Preparación</>}
            onAction={handleOpenNew}
          />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <PreparationFormModal
            preparation={editingPreparation}
            supplies={supplies}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      {selectedPrepId && (
        <PreparationProductionModal
          isOpen={productionModalOpen}
          onClose={() => { setProductionModalOpen(false); setSelectedPrepId(null) }}
          preparationId={selectedPrepId}
          preparations={preparations ?? []}
          supplies={supplies}
        />
      )}
    </div>
  )
}
