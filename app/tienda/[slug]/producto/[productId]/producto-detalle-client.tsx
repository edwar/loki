'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, ShoppingCart, Minus, Check } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  salePrice: number
  currentStock: number
  preparation: string | null
  images: { url: string; publicId: string }[]
  ingredients: { name: string; quantity: number; unit: string }[]
}

interface Company {
  name: string
  slug: string
  logo: string | null
  whatsapp: string | null
}

const ZOOM = 4

export function ProductoDetalleClient({ product, company }: { product: Product; company: Company }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const [px, setPx] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [panelSize, setPanelSize] = useState({ w: 400, h: 300 })
  const [containerW, setContainerW] = useState(400)
  const outOfStock = product.currentStock <= 0

  const imgSrc = product.images[selectedImage]?.url

  const calcOffset = useCallback(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return
    const cr = container.getBoundingClientRect()
    const ir = img.getBoundingClientRect()
    setImgOffset({
      x: ir.left - cr.left,
      y: ir.top - cr.top,
      w: ir.width,
      h: ir.height,
    })
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      setContainerW(containerRef.current.getBoundingClientRect().width)
    }
    if (imgRef.current && imgRef.current.complete) calcOffset()
    if (panelRef.current) {
      const pr = panelRef.current.getBoundingClientRect()
      setPanelSize({ w: pr.width, h: pr.height })
    }
  }, [imgSrc, calcOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPx({ x: e.clientX - r.left, y: e.clientY - r.top })
  }, [])

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem(`cart-${company.slug}`) || '[]')
    const existing = cart.find((i: any) => i.productId === product.id)
    if (existing) existing.quantity += qty
    else cart.push({ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.salePrice })
    localStorage.setItem(`cart-${company.slug}`, JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const panelW = panelSize.w
  const panelH = panelSize.h

  const imgX = px.x - imgOffset.x
  const imgY = px.y - imgOffset.y

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo && <img src={company.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />}
            <Link href={`/tienda/${company.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {company.name}
            </Link>
          </div>
          <Link href={`/tienda/${company.slug}`} className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="w-4 h-4" /> Volver a tienda
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div
              ref={containerRef}
              className="relative bg-black rounded-xl overflow-hidden cursor-crosshair"
              style={{ aspectRatio: '4/3' }}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {imgSrc ? (
                <img ref={imgRef} src={imgSrc} alt={product.name} className="w-full h-full object-contain" draggable={false} onLoad={calcOffset} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-muted-foreground/20">🛍️</div>
              )}
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                style={{ opacity: showZoom ? 1 : 0, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
              <div className="absolute pointer-events-none border-2 border-white/70 rounded-sm transition-opacity duration-150"
                style={{
                  width: '25%',
                  height: '25%',
                  left: `calc(${px.x / containerW * 100}% - 12.5%)`,
                  top: `calc(${px.y / containerW * 0.75 > 0 ? `${(px.y / (containerW * 0.75)) * 100}%` : '50%'} - 12.5%)`,
                  opacity: showZoom ? 1 : 0,
                }} />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent hover:border-border/50'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6 relative">
            {imgSrc && (
              <div ref={panelRef}
                className="absolute top-0 right-0 z-30 w-full rounded-xl overflow-hidden border-2 border-border/30 shadow-2xl bg-black transition-all duration-200"
                style={{
                  aspectRatio: '4/3',
                  opacity: showZoom ? 1 : 0,
                  scale: showZoom ? '1' : '0.95',
                  pointerEvents: 'none',
                  transformOrigin: 'top right',
                }}>
                <img src={imgSrc} alt="" draggable={false} className="max-w-none"
                  style={{
                    width: `${ZOOM * 100}%`,
                    height: `${ZOOM * 100}%`,
                    marginLeft: `${-imgX * ZOOM + panelW / 2}px`,
                    marginTop: `${-imgY * ZOOM + panelH / 2}px`,
                  }} />
              </div>
            )}
            <div>
              {outOfStock && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-md">Sin stock</span>}
              <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
              <p className="text-3xl font-black text-emerald-500 mt-3">{formatCurrency(product.salePrice)}</p>
            </div>

            {product.ingredients.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Ingredientes</h2>
                <div className="grid grid-cols-2 gap-2">
                  {product.ingredients.map((ig, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/20">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-sm">{ig.name}<span className="text-muted-foreground ml-1">({ig.quantity} {ig.unit})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.preparation && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Preparación</h2>
                <div
                  className="p-4 rounded-lg bg-accent/10 border border-border/30 text-sm leading-relaxed prose prose-sm max-w-none
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
                    [&_th]:border [&_th]:border-border/50 [&_th]:bg-muted/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold
                    [&_td]:border [&_td]:border-border/50 [&_td]:px-3 [&_td]:py-2"
                  dangerouslySetInnerHTML={{ __html: product.preparation }}
                />
              </div>
            )}

            <div className="border-t border-border/30 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Cantidad</span>
                <div className="flex items-center rounded-lg border border-border/50">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-bold text-sm">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <Button onClick={addToCart} disabled={outOfStock} className="w-full h-14 rounded-xl font-bold text-base shadow-lg shadow-primary/20">
                {added ? <><Check className="w-5 h-5 mr-2" /> Agregado</> : outOfStock ? 'Agotado' : <><Plus className="w-5 h-5 mr-2" /> Agregar al carrito — {formatCurrency(product.salePrice * qty)}</>}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Recibirás un WhatsApp de confirmación después de tu pedido</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
