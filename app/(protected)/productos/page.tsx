import { getProducts } from '@/lib/actions/products'
import { getSupplies } from '@/lib/actions/supplies'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus } from 'lucide-react'
import { ProductForm } from '@/components/product-forms'
import { ProductCard } from '@/components/product-card'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const [productsRaw, suppliesRaw] = await Promise.all([
    getProducts(),
    getSupplies()
  ])

  // Serialize Decimals for Client Components
  const products = productsRaw.map((p: any) => ({
    ...p,
    salePrice: Number(p.salePrice),
    recipeItems: p.recipeItems?.map((ri: any) => ({
      ...ri,
      quantityRequired: Number(ri.quantityRequired),
      supply: ri.supply ? {
        ...ri.supply,
        currentStock: Number(ri.supply.currentStock),
        minStock: Number(ri.supply.minStock),
        purchasePrice: Number(ri.supply.purchasePrice)
      } : null
    })) || []
  }))

  const supplies = suppliesRaw.map((s: any) => ({
    ...s,
    currentStock: Number(s.currentStock),
    minStock: Number(s.minStock),
    purchasePrice: Number(s.purchasePrice)
  }))

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean) as string[])]
  const allSupplies = supplies.map((s: any) => ({ id: s.id, name: s.name, unit: s.unit }))

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display">Catálogo de Productos</h1>
          <p className="text-muted-foreground font-medium mt-1">Define tus productos y sus recetas para un control automático de inventario.</p>
        </div>
      </div>

      {/* Product Creator */}
      <Card className="rounded-lg border-primary/20 bg-primary/2">
        <CardHeader className="px-2 py-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Plus size={20} className="text-white" />
            </div>
            <CardTitle>Nuevo Producto</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-2 py-4">
          <ProductForm product={null} categories={categories} />
        </CardContent>
      </Card>

      {/* Product List */}
      <div className="grid gap-8">
        {products.map((product: any, index: number) => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            allSupplies={allSupplies}
            index={index}
          />
        ))}

        {products.length === 0 && (
          <Card className="rounded-lg border-dashed border-2 py-20 bg-accent/5">
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-accent/50 flex items-center justify-center mx-auto">
                <Package size={32} className="text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">Empieza creando tu primer producto arriba.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}