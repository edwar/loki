'use client'

import { useState, useSyncExternalStore } from 'react'
import { Package, Plus, ShoppingCart } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Modal } from '@/components/ui/modal'
import { ProductFormModal } from '@/components/product-form-modal'
import { ShoppingCartModal } from '@/components/shopping-cart-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCart } from '@/lib/shopping-cart'

interface Supply {
  id: string
  name: string
  unit: string
  unitsPerPack: number
}

interface ProductImage {
  id: string
  url: string
  publicId: string
  order: number
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
  images: ProductImage[]
  recipeItems: RecipeItem[]
  maxPossibleBatches: number
  isPublic?: boolean
  preparation?: string | null
}

interface ProductosClientProps {
  products: Product[]
  categories: string[]
  allSupplies: Supply[]
  company?: { id: string; name: string; slug: string }
}

export function ProductosClient({ products: initialProducts, categories, allSupplies, company }: ProductosClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const cartCount = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('cart-updated', onChange)
      return () => window.removeEventListener('cart-updated', onChange)
    },
    () => getCart().reduce((acc, item) => acc + item.lots, 0),
    () => 0,
  )

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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setCartModalOpen(true)}
            className="relative rounded-lg"
            data-cart-trigger
          >
            <ShoppingCart size={20} />
            Lista de Compra
            <span data-cart-badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-lg">
              {cartCount}
            </span>
          </Button>
          <Button
            onClick={handleOpenNew}
          >
            <Plus size={20} />
            Nuevo Producto
          </Button>
        </div>
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

      {/* Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8">
          <ProductFormModal
            product={editingProduct}
            categories={categories}
            company={company}
            unitCost={getUnitCost(editingProduct)}
            onSuccess={handleSuccess}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </Modal>

      <ShoppingCartModal isOpen={cartModalOpen} onClose={() => setCartModalOpen(false)} />
    </div>
  )
}