'use client'

const STORAGE_KEY = 'loki-shopping-cart'

export interface CartRecipeItem {
  name: string
  quantity: number
  unit: string
}

export interface CartItem {
  productId: string
  productName: string
  lots: number
  recipeItems: CartRecipeItem[]
}

export interface ConsolidatedSupply {
  name: string
  unit: string
  totalQuantity: number
  products: { name: string; lots: number; quantity: number }[]
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
}

export function addToCart(
  productId: string,
  productName: string,
  lots: number,
  recipeItems: CartRecipeItem[]
) {
  const cart = getCart()
  const existing = cart.find((i) => i.productId === productId)
  if (existing) {
    existing.lots += lots
  } else {
    cart.push({ productId, productName, lots, recipeItems })
  }
  saveCart(cart)
}

export function updateLots(productId: string, lots: number) {
  const cart = getCart()
  const item = cart.find((i) => i.productId === productId)
  if (item) {
    if (lots <= 0) {
      removeFromCart(productId)
      return
    }
    item.lots = lots
    saveCart(cart)
  }
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((i) => i.productId !== productId)
  saveCart(cart)
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
}

export function getConsolidatedList(): ConsolidatedSupply[] {
  const cart = getCart()
  const map = new Map<string, ConsolidatedSupply>()

  for (const item of cart) {
    for (const ri of item.recipeItems) {
      const totalQty = ri.quantity * item.lots
      const existing = map.get(ri.name)
      if (existing) {
        existing.totalQuantity += totalQty
        existing.products.push({ name: item.productName, lots: item.lots, quantity: totalQty })
      } else {
        map.set(ri.name, {
          name: ri.name,
          unit: ri.unit,
          totalQuantity: totalQty,
          products: [{ name: item.productName, lots: item.lots, quantity: totalQty }],
        })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}
