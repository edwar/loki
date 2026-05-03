import { getProducts, createProduct, updateProduct, deleteProduct, addRecipeItem, deleteRecipeItem } from '@/lib/actions/products'
import { getSupplies } from '@/lib/actions/supplies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Trash2, X } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function ProductForm({ 
  product, 
  categories 
}: { 
  product?: { id: string; name: string; category: string | null; salePrice: number } | null
  categories: string[]
}) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct
  
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input name="name" defaultValue={product?.name} required className="mt-1" placeholder="Ej: Empanada de Carne" />
        </div>
        <div>
          <label className="text-sm font-medium">Categoría</label>
          <Input 
            name="category" 
            defaultValue={product?.category ?? ''} 
            list="categories"
            className="mt-1" 
            placeholder="Ej: Empanadas"
          />
          <datalist id="categories">
            {categories.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="text-sm font-medium">Precio Venta</label>
          <Input name="salePrice" type="number" step="100" defaultValue={product?.salePrice ?? 0} required className="mt-1" />
        </div>
      </div>
      <Button type="submit">{product ? 'Actualizar' : 'Crear'}</Button>
    </form>
  )
}

function RecipeForm({ productId, supplies }: { productId: string, supplies: { id: string; name: string; unit: string }[] }) {
  return (
    <form action={addRecipeItem} className="flex gap-2 items-end mt-2 p-2 bg-[var(--accent)] rounded-lg">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex-1">
        <label className="text-xs font-medium">Insumo</label>
        <Select 
          name="supplyId" 
          required
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {supplies.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-20">
        <label className="text-xs font-medium">Cantidad</label>
        <Input name="quantityRequired" type="number" step="0.01" required className="h-8" placeholder="0" />
      </div>
      <div className="w-16">
        <label className="text-xs font-medium">Unidad</label>
        <Input name="unit" required className="h-8" placeholder="g" />
      </div>
      <Button type="submit" size="sm">Agregar</Button>
    </form>
  )
}

export default async function ProductosPage() {
  const [products, supplies] = await Promise.all([
    getProducts(),
    getSupplies()
  ])

  const categories = [...new Set(products.map(p => p.category).filter(Boolean) as string[])]
  const allSupplies = supplies.map(s => ({ id: s.id, name: s.name, unit: s.unit }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Productos</h1>
        <p className="text-gray-500 dark:text-slate-400">Administra tu catálogo de productos</p>
        <p className="text-zinc-500">Crea productos y define sus recetas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={null} categories={categories} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{product.name}</CardTitle>
                <p className="text-sm text-zinc-500">
                  {product.category || 'Sin categoría'} • {formatCurrency(Number(product.salePrice) ?? 0)}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={deleteProduct.bind(null, product.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Receta:</p>
              {product.recipeItems.length === 0 ? (
                <p className="text-sm text-zinc-400">Sin insumos definidos</p>
              ) : (
                <Table>
                  <TableBody>
                    {product.recipeItems.map((item) => (
                      <TableRow key={item.id} className="h-8">
                        <TableCell className="py-1">{item.supply.name}</TableCell>
                        <TableCell className="py-1">{Number(item.quantityRequired)} {item.unit}</TableCell>
                        <TableCell className="py-1">
                          <form action={deleteRecipeItem.bind(null, item.id)}>
                            <Button type="submit" variant="ghost" size="sm" className="h-6 text-red-600">
                              <X size={14} />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {allSupplies.length > 0 && (
                <RecipeForm productId={product.id} supplies={allSupplies} />
              )}
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No hay productos registrados
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}