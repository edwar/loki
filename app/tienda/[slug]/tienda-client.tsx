'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, X, Send, Loader2, CheckCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  salePrice: number
  currentStock: number
  images: { url: string; publicId: string }[]
  ingredients: { name: string; quantity: number; unit: string }[]
}

interface Company {
  name: string
  slug: string
  logo: string | null
  description: string | null
  whatsapp: string | null
  address: string | null
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export function TiendaClient({ company, products }: { company: Company; products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0)
  const cartTotal = cart.reduce((a, i) => a + i.quantity * i.unitPrice, 0)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.salePrice }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) return
    setSubmitting(true)
    try {
      const companySlug = window.location.pathname.split('/').pop()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companySlug,
          customerName,
          customerPhone,
          customerNotes,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Error')
      setSuccess(true)
      setCart([])
      setShowCheckout(false)
    } catch { alert('Error al procesar el pedido') }
    finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">¡Pedido Recibido!</h2>
          <p className="text-muted-foreground">Te contactaremos pronto para confirmar los detalles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo && <img src={company.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />}
            <div>
              <h1 className="font-bold text-lg">{company.name}</h1>
              {company.description && <p className="text-xs text-muted-foreground">{company.description}</p>}
            </div>
          </div>
          <button onClick={() => setShowCart(!showCart)} className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-medium">No hay productos en la tienda aún</p>
            <p className="text-sm text-muted-foreground/60 mt-1">El dueño aún no ha publicado productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const storeUrl = `/tienda/${company.slug}/producto/${p.id}`
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden hover:border-primary/30 transition-all"
                >
                  <Link href={storeUrl} className="block">
                    <div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden relative">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground/30 text-6xl">🛍️</div>
                      )}
                      {p.currentStock <= 0 && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-rose-500/80 text-white rounded-md">
                          Sin stock
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold">{p.name}</h3>
                      {p.ingredients.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {p.ingredients.map((ig) => `${ig.name}`).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-emerald-500">{formatCurrency(p.salePrice)}</span>
                        <Button
                          size="sm"
                          onClick={(e) => { e.preventDefault(); addToCart(p) }}
                          disabled={p.currentStock <= 0}
                          className="rounded-lg"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {p.currentStock > 0 ? 'Agregar' : 'Agotado'}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/40 flex-1" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-sm bg-background border-l border-border/40 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">Carrito ({cartCount})</h2>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 && <p className="text-center text-muted-foreground py-10">Carrito vacío</p>}
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeItem(item.productId)} className="w-7 h-7 rounded-lg hover:bg-rose-500/10 text-rose-500 flex items-center justify-center ml-1"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <Button className="w-full h-12 rounded-lg font-bold" onClick={() => { setShowCheckout(true); setShowCart(false) }}>
                  <Send className="w-4 h-4 mr-2" /> Solicitar Pedido
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !submitting && setShowCheckout(false)}>
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Confirmar Pedido</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 w-full h-12 px-4 rounded-lg border border-border/50 bg-background/50" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teléfono</label>
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 w-full h-12 px-4 rounded-lg border border-border/50 bg-background/50" placeholder="+573001234567" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notas (opcional)</label>
                <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} className="mt-1 w-full h-20 px-4 py-3 rounded-lg border border-border/50 bg-background/50 resize-none" placeholder="Dirección, hora de entrega, etc." />
              </div>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                {cart.map((i) => (
                  <div key={i.productId} className="flex justify-between">
                    <span>{i.quantity}x {i.productName}</span>
                    <span className="font-medium">{formatCurrency(i.quantity * i.unitPrice)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-border/30 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCheckout(false)} disabled={submitting}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={submitting || !customerName || !customerPhone}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Pedido'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
