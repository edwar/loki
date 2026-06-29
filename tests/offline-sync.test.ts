import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getDB, savePendingSale, getPendingSales,
  deletePendingSale, getPendingSalesCount,
} from '@/lib/offline-sync'

beforeEach(async () => {
  const db = await getDB()
  const tx = db.transaction('pending_sales', 'readwrite')
  await tx.store.clear()
  await tx.done
  db.close()
})

afterEach(async () => {
  const db = await getDB()
  db.close()
})

describe('savePendingSale', () => {
  it('saves a pending sale and returns an id', async () => {
    const id = await savePendingSale({ total: 100, items: [] })
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })

  it('persists the sale data', async () => {
    const data = { total: 250, items: [{ product: 'Pan', quantity: 2 }] }
    const id = await savePendingSale(data)
    const sales = await getPendingSales()
    expect(sales).toHaveLength(1)
    expect(sales[0].data).toEqual(data)
    expect(sales[0].id).toBe(id)
  })
})

describe('getPendingSales', () => {
  it('returns empty array when no pending sales', async () => {
    const sales = await getPendingSales()
    expect(sales).toEqual([])
  })

  it('returns all pending sales', async () => {
    await savePendingSale({ total: 100 })
    await savePendingSale({ total: 200 })
    const sales = await getPendingSales()
    expect(sales).toHaveLength(2)
  })
})

describe('deletePendingSale', () => {
  it('removes a pending sale by id', async () => {
    const id = await savePendingSale({ total: 100 })
    await deletePendingSale(id)
    const sales = await getPendingSales()
    expect(sales).toHaveLength(0)
  })

  it('does nothing if id does not exist', async () => {
    await deletePendingSale('nonexistent-id')
    const sales = await getPendingSales()
    expect(sales).toEqual([])
  })
})

describe('getPendingSalesCount', () => {
  it('returns 0 when no pending sales', async () => {
    const count = await getPendingSalesCount()
    expect(count).toBe(0)
  })

  it('returns the correct count', async () => {
    await savePendingSale({ total: 100 })
    await savePendingSale({ total: 200 })
    await savePendingSale({ total: 300 })
    const count = await getPendingSalesCount()
    expect(count).toBe(3)
  })
})
