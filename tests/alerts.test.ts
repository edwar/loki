import { describe, it, expect } from 'vitest'
import { getUnitType, canConvert, convertUnits } from '@/lib/conversions'
import { predictSales } from '@/lib/predictions'
import { calculateSalePrice } from '@/lib/pricing'

describe('business logic integration', () => {
  it('predicts future revenue based on pricing data', () => {
    const salePrice = calculateSalePrice(150, 40)
    expect(salePrice).toBeCloseTo(250, 0)

    const dailyData = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000),
      amount: salePrice * (5 + Math.round(Math.random() * 2)),
    }))
    const result = predictSales(dailyData)
    expect(result.next7d).toBeGreaterThan(0)
    expect(result.next30d).toBeGreaterThan(0)
  })
})
