'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Modal } from '@/components/ui/modal'
import { ProductFormModal } from '@/components/product-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

interface Supply {
  id: string
  name: string
  unit: string
}

interface RecipeItem {
  id: string
  quantityRequired: number
  unit: string
  supply: {
    name: string
    currentStock: number
    minStock: number
    purchasePrice: number
  } | null
}

interface Product {
  id: string
  name: string
  category: string | null
  salePrice: number
  currentStock: number
  yield: number
  recipeItems: RecipeItem[]
  maxPossibleBatches: number
}

interface ProductosClientProps {
  products: Product[]
  categories: string[]
  allSupplies: Supply[]
}

export function ProductosClient({ products, categories, allSupplies }: ProductosClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleOpenNew = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Catálogo de Productos</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Define tus productos y sus recetas para un control automático de inventario.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
        >
          <Plus size={20} />
          Nuevo Producto
        </Button>
      </div>

      {/* Product List */}
      <div className="grid gap-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            allSupplies={allSupplies}
            index={index}
            onEdit={() => handleOpenEdit(product)}
          />
        ))}

        {products.length === 0 && (
          <EmptyState
            icon={Package}
            title="No hay productos registrados"
            description="Empieza creando tu primer producto para comenzar a gestionar tu catálogo."
            actionLabel={<><Plus size={18} /> Crear Producto</>}
            onAction={handleOpenNew}
          />
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <ProductFormModal
            product={editingProduct}
            categories={categories}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  )
}