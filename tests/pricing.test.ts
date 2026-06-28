import { describe, it, expect } from 'vitest'
import {
  deriveCostPerUnit,
  calculateMargin,
  calculateSalePrice,
  calculateUnitCost,
  calculateRentabilidad,
  getDisplayPrice,
  getDisplayMargin,
} from '../lib/pricing'

describe('deriveCostPerUnit', () => {
  it('calculates cost from price and margin (25% margin → cost = price * 0.75)', () => {
    expect(deriveCostPerUnit(2000, 25)).toBe(1500)
  })

  it('returns 0 when price is 0', () => {
    expect(deriveCostPerUnit(0, 25)).toBe(0)
  })

  it('returns 0 when margin is 0', () => {
    expect(deriveCostPerUnit(2000, 0)).toBe(0)
  })

  it('returns 0 for 100% margin', () => {
    expect(deriveCostPerUnit(2000, 100)).toBe(0)
  })
})

describe('calculateMargin', () => {
  it('calculates margin percentage from price and cost', () => {
    expect(calculateMargin(2000, 1500)).toBe(25)
  })

  it('returns 0 when salePrice is 0', () => {
    expect(calculateMargin(0, 1500)).toBe(0)
  })

  it('returns 0 when costPerUnit is 0', () => {
    expect(calculateMargin(2000, 0)).toBe(0)
  })

  it('returns negative for loss', () => {
    expect(calculateMargin(1500, 2000)).toBeCloseTo(-33.33, 1)
  })

  it('handles 100% margin (cost is 0 relative to price)', () => {
    expect(calculateMargin(2000, 1000)).toBe(50)
  })
})

describe('calculateSalePrice', () => {
  it('calculates price from cost and margin (25% margin → price is cost / 0.75)', () => {
    expect(calculateSalePrice(1500, 25)).toBe(2000)
  })

  it('returns 0 when cost is 0', () => {
    expect(calculateSalePrice(0, 25)).toBe(0)
  })

  it('handles 50% margin', () => {
    expect(calculateSalePrice(1000, 50)).toBe(2000)
  })

  it('returns Infinity for 100% margin', () => {
    expect(calculateSalePrice(1000, 100)).toBe(Infinity)
  })
})

describe('calculateRentabilidad', () => {
  it('calculates profitability as percentage of cost (price=200, cost=100 → 100%)', () => {
    expect(calculateRentabilidad(200, 100)).toBe(100)
  })

  it('returns 0 when costPerUnit is 0', () => {
    expect(calculateRentabilidad(200, 0)).toBe(0)
  })

  it('matches margin vs rentabilidad: 50% margin = 100% rentabilidad', () => {
    const cost = 100
    const price = 200
    expect(calculateMargin(price, cost)).toBe(50)
    expect(calculateRentabilidad(price, cost)).toBe(100)
  })
})

describe('calculateUnitCost', () => {
  it('calculates unit cost from recipe cost and yield', () => {
    expect(calculateUnitCost(100000, 50)).toBe(2000)
  })

  it('returns 0 when yield is 0', () => {
    expect(calculateUnitCost(100000, 0)).toBe(0)
  })

  it('returns recipe cost when yield is 1', () => {
    expect(calculateUnitCost(100000, 1)).toBe(100000)
  })
})

describe('getDisplayPrice', () => {
  it('uses salePrice when available', () => {
    expect(getDisplayPrice(2500, 2000, 25)).toBe(2500)
  })

  it('calculates from margin when no salePrice (25% margin → price = 1500/0.75)', () => {
    expect(getDisplayPrice(0, 1500, 25)).toBe(2000)
  })
})

describe('getDisplayMargin', () => {
  it('calculates margin from salePrice and unitCost when salePrice exists', () => {
    expect(getDisplayMargin(2000, 1500, 25)).toBe(25)
  })

  it('returns profitMargin when no salePrice', () => {
    expect(getDisplayMargin(0, 1500, 30)).toBe(30)
  })

  it('returns profitMargin when unitCost is 0', () => {
    expect(getDisplayMargin(2000, 0, 30)).toBe(30)
  })
})

describe('roundtrip consistency', () => {
  it('margin → price: price / (1 - margin) should give the correct price', () => {
    expect(calculateSalePrice(1500, 25)).toBe(2000)
  })

  it('price → margin: (price - cost) / price should give the correct margin', () => {
    expect(calculateMargin(2000, 1500)).toBe(25)
  })

  it('deriveCost → calculateSalePrice is consistent', () => {
    const price = 2000
    const margin = 25
    const derivedCost = deriveCostPerUnit(price, margin)
    const restoredPrice = calculateSalePrice(derivedCost, margin)
    expect(restoredPrice).toBeCloseTo(price, 5)
  })
})
