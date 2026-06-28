'use client'

import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Modal } from '@/components/ui/modal'
import { ProductFormModal } from '@/components/product-form-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Supply {
  id: string
  name: string
  unit: string
  unitsPerPack: number
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
  currentStock: number
  profitMargin: number
  yield: number
  salePrice: number
  recipeItems: RecipeItem[]
  maxPossibleBatches: number
}

interface ProductosClientProps {
  products: Product[]
  categories: string[]
  allSupplies: Supply[]
}

export function ProductosClient({ products: initialProducts, categories, allSupplies }: ProductosClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error al cargar productos')
      return res.json()
    },
    initialData: initialProducts,
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleOpenNew = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const getUnitCost = (product: Product | null) => {
    if (!product) return 0
    const recipeCost = product.recipeItems.reduce((acc: number, ri: any) => {
      const qty = Number(ri.quantityRequired) || 0
      const price = Number(ri.supply?.purchasePrice) || 0
      return acc + (qty * price)
    }, 0)
    const yieldAmount = product.yield || 1
    return yieldAmount > 0 ? recipeCost / yieldAmount : 0
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
        {(products ?? []).map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            allSupplies={allSupplies}
            index={index}
            onEdit={() => handleOpenEdit(product)}
          />
        ))}

        {(products ?? []).length === 0 && (
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
            unitCost={getUnitCost(editingProduct)}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  )
}