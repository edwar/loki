import { describe, it, expect } from 'vitest'
import { predictSales } from '@/lib/predictions'

function makeDate(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d
}

describe('predictSales', () => {
  it('returns zero predictions for empty data', () => {
    const result = predictSales([])
    expect(result.next7d).toBe(0)
    expect(result.next30d).toBe(0)
    expect(result.trend).toBe('stable')
    expect(result.confidence).toBe('low')
  })

  it('returns flat prediction for single data point', () => {
    const data = [{ date: makeDate(0), amount: 100 }]
    const result = predictSales(data)
    expect(result.next7d).toBe(700)
    expect(result.next30d).toBe(3000)
    expect(result.trend).toBe('stable')
  })

  it('detects upward trend', () => {
    const data = Array.from({ length: 14 }, (_, i) => ({
      date: makeDate(13 - i),
      amount: 50 + i * 10,
    }))
    const result = predictSales(data)
    expect(result.trend).toBe('up')
    expect(result.next7d).toBeGreaterThan(0)
    expect(result.next30d).toBeGreaterThan(0)
  })

  it('detects downward trend', () => {
    const data = Array.from({ length: 14 }, (_, i) => ({
      date: makeDate(13 - i),
      amount: 200 - i * 10,
    }))
    const result = predictSales(data)
    expect(result.trend).toBe('down')
  })

  it('returns stable trend for flat data', () => {
    const data = Array.from({ length: 14 }, (_, i) => ({
      date: makeDate(13 - i),
      amount: 100,
    }))
    const result = predictSales(data)
    expect(result.trend).toBe('stable')
  })

  it('gives high confidence for perfect linear data', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: makeDate(29 - i),
      amount: 100 + i * 5,
    }))
    const result = predictSales(data)
    expect(result.confidence).toBe('high')
    expect(result.rSquared).toBeGreaterThan(0.95)
    expect(result.trend).toBe('up')
  })

  it('filters out negative amounts', () => {
    const data = [
      { date: makeDate(2), amount: -1 },
      { date: makeDate(1), amount: 100 },
      { date: makeDate(0), amount: 200 },
    ]
    const result = predictSales(data)
    expect(result.next7d).toBeGreaterThan(0)
    expect(result.next30d).toBeGreaterThan(0)
  })

  it('sorts dates chronologically regardless of input order', () => {
    const data = [
      { date: makeDate(0), amount: 300 },
      { date: makeDate(2), amount: 100 },
      { date: makeDate(1), amount: 200 },
    ]
    const result = predictSales(data)
    expect(result.trend).toBe('up')
  })
})
