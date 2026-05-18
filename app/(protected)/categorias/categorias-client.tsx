'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/categories'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

interface Category {
  id: string
  name: string
  type: string
}

interface CategoriasClientProps {
  categories: Category[]
}

export function CategoriasClient({ categories }: CategoriasClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenNew = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleSuccess = () => {
    router.refresh()
    setModalOpen(false)
    setEditingCategory(null)
  }

  const supplyCategories = categories.filter(c => c.type === 'supply')
  const productCategories = categories.filter(c => c.type === 'product')

  const handleDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Categorías</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Administra las categorías para insumos y productos.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
        >
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-6 py-4 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              Categorías de Insumos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {supplyCategories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No hay categorías de este tipo</div>
            ) : (
              <div className="divide-y divide-border/30">
                {supplyCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(category)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500" onClick={() => setCategoryToDelete(category)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden p-0">
          <CardHeader className="px-6 py-4 border-b border-border/30 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              Categorías de Productos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {productCategories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No hay categorías de este tipo</div>
            ) : (
              <div className="divide-y divide-border/30">
                {productCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(category)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500" onClick={() => setCategoryToDelete(category)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCategory(null) }}>
        <div className="p-8">
          <CategoryForm category={editingCategory} onSuccess={handleSuccess} onClose={() => { setModalOpen(false); setEditingCategory(null) }} />
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar categoría?"
        description={`La categoría "${categoryToDelete?.name}" será eliminada.`}
        confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
      />
    </div>
  )
}

function CategoryForm({ category, onSuccess, onClose }: { category?: Category | null, onSuccess: () => void, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!category

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (isEditing) {
      await updateCategory(category.id, formData)
    } else {
      await createCategory(formData)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos de la categoría' : 'Crea una categoría para organizar insumos o productos'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
          <Input name="name" required defaultValue={category?.name} placeholder="Ej: Lácteos" className="h-11" />
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo</label>
            <Select name="type" required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supply">Insumos</SelectItem>
                <SelectItem value="product">Productos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-12 rounded-lg">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 h-12 font-semibold rounded-lg">
          {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  )
}