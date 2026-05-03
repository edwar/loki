'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Trash2, X, ShoppingBag, History, Edit2, ChevronDown } from 'lucide-react'
import { deleteProduct, deleteRecipeItem } from '@/lib/actions/products'
import { ProductForm, RecipeForm } from './product-forms'
import { Dialog } from './ui/dialog'

export function ProductCard({
  product,
  categories,
  allSupplies,
  index
}: {
  product: any
  categories: string[]
  allSupplies: any[]
  index: number
}) {
  const [isEditing, setIsEditing] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <Card
        className="rounded-lg border-border/40 bg-card/30 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-all duration-500 animate-fade-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardHeader
          className={`mb-0 mx-3 py-2 flex flex-row items-center justify-between cursor-pointer hover:bg-primary/2 transition-colors group/header ${isExpanded ? 'border-b border-border/30' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center group-hover/header:scale-110 transition-transform shadow-sm">
              <ShoppingBag size={18} className="text-primary/70" />
            </div>
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                  {product.category || 'Sin categoría'}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(Number(product.salePrice) ?? 0)}
                </span>
                {product.recipeItems.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/50 rounded-md text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                    <History size={10} />
                    {product.recipeItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 mr-2 pr-4 border-r border-border/30" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit2 size={14} />
              </Button>
              <form action={deleteProduct.bind(null, product.id)}>
                <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                  <Trash2 size={14} />
                </Button>
              </form>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg group-hover/header:bg-accent transition-all">
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-2 bg-primary/1 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="space-y-2">
              {allSupplies.length > 0 && (
                <RecipeForm productId={product.id} supplies={allSupplies} />
              )}

              {product.recipeItems.length === 0 ? (
                <div className="py-6 text-center rounded-lg bg-accent/10 border border-dashed border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">No has definido insumos para este producto aún.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/5 hover:bg-accent/5">
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Insumo</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold">Cantidad Requerida</TableHead>
                        <TableHead className="h-9 text-[10px] uppercase tracking-widest font-bold text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.recipeItems.map((item: any) => (
                        <TableRow key={item.id} className="group/row hover:bg-accent/5">
                          <TableCell className="py-2.5 font-semibold text-sm">{item.supply.name}</TableCell>
                          <TableCell className="py-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-accent/50 text-muted-foreground rounded-md">
                              {Number(item.quantityRequired)} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <form action={deleteRecipeItem.bind(null, item.id)}>
                              <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md hover:bg-rose-500/10 hover:text-rose-500">
                                <X size={10} />
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Editar Producto"
      >
        <div className="mt-4">
          <ProductForm
            product={product}
            categories={categories}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      </Dialog>
    </>
  )
}
