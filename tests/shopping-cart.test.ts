import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getCart, saveCart, addToCart, updateLots,
  removeFromCart, clearCart, getConsolidatedList,
} from '@/lib/shopping-cart'

const STORAGE_KEY = 'loki-shopping-cart'

function mockRecipeItem(name: string, qty: number, unit: string) {
  return { name, quantity: qty, unit }
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('getCart', () => {
  it('returns empty array when no cart exists', () => {
    expect(getCart()).toEqual([])
  })

  it('returns parsed cart from localStorage', () => {
    const items = [{ productId: '1', productName: 'Test', lots: 2, recipeItems: [] }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    expect(getCart()).toEqual(items)
  })

  it('returns empty array on parse error', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')
    expect(getCart()).toEqual([])
  })
})

describe('addToCart', () => {
  it('adds a new product to empty cart', () => {
    addToCart('1', 'Pan', 2, [mockRecipeItem('Harina', 1, 'kg')])
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].productName).toBe('Pan')
    expect(cart[0].lots).toBe(2)
  })

  it('increments lots when product already exists', () => {
    addToCart('1', 'Pan', 2, [mockRecipeItem('Harina', 1, 'kg')])
    addToCart('1', 'Pan', 3, [mockRecipeItem('Harina', 1, 'kg')])
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].lots).toBe(5)
  })

  it('keeps separate entries for different products', () => {
    addToCart('1', 'Pan', 2, [])
    addToCart('2', 'Pastel', 1, [])
    expect(getCart()).toHaveLength(2)
  })
})

describe('updateLots', () => {
  it('updates lots for existing product', () => {
    addToCart('1', 'Pan', 2, [])
    updateLots('1', 5)
    expect(getCart()[0].lots).toBe(5)
  })

  it('removes product when lots <= 0', () => {
    addToCart('1', 'Pan', 2, [])
    updateLots('1', 0)
    expect(getCart()).toHaveLength(0)
  })

  it('does nothing for non-existent product', () => {
    updateLots('nonexistent', 3)
    expect(getCart()).toHaveLength(0)
  })
})

describe('removeFromCart', () => {
  it('removes specified product', () => {
    addToCart('1', 'Pan', 2, [])
    addToCart('2', 'Pastel', 1, [])
    removeFromCart('1')
    expect(getCart()).toHaveLength(1)
    expect(getCart()[0].productId).toBe('2')
  })

  it('does nothing if product not in cart', () => {
    addToCart('1', 'Pan', 2, [])
    removeFromCart('nonexistent')
    expect(getCart()).toHaveLength(1)
  })
})

describe('clearCart', () => {
  it('removes all items from cart', () => {
    addToCart('1', 'Pan', 2, [])
    addToCart('2', 'Pastel', 1, [])
    clearCart()
    expect(getCart()).toEqual([])
  })
})

describe('getConsolidatedList', () => {
  it('aggregates supplies from multiple products', () => {
    addToCart('1', 'Pan', 2, [mockRecipeItem('Harina', 1, 'kg')])
    addToCart('2', 'Pastel', 3, [mockRecipeItem('Harina', 0.5, 'kg')])
    const list = getConsolidatedList()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Harina')
    expect(list[0].totalQuantity).toBe(3.5)
    expect(list[0].products).toHaveLength(2)
  })

  it('returns empty array for empty cart', () => {
    expect(getConsolidatedList()).toEqual([])
  })

  it('handles products with multiple recipe items', () => {
    addToCart('1', 'Pan', 1, [
      mockRecipeItem('Harina', 1, 'kg'),
      mockRecipeItem('Sal', 0.1, 'kg'),
    ])
    const list = getConsolidatedList()
    expect(list).toHaveLength(2)
    expect(list.find(s => s.name === 'Harina')?.totalQuantity).toBe(1)
    expect(list.find(s => s.name === 'Sal')?.totalQuantity).toBe(0.1)
  })

  it('returns sorted by name', () => {
    addToCart('1', 'Pan', 1, [
      mockRecipeItem('Sal', 0.1, 'kg'),
      mockRecipeItem('Harina', 1, 'kg'),
      mockRecipeItem('Azúcar', 0.5, 'kg'),
    ])
    const list = getConsolidatedList()
    expect(list.map(s => s.name)).toEqual(['Azúcar', 'Harina', 'Sal'])
  })
})
