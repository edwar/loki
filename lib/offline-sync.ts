import { openDB, DBSchema } from 'idb'

interface LokiDB extends DBSchema {
  pending_sales: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
}

export async function getDB() {
  return openDB<LokiDB>('loki-offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending_sales')) {
        db.createObjectStore('pending_sales', { keyPath: 'id' })
      }
    },
  })
}

export async function savePendingSale(saleData: any) {
  const db = await getDB()
  const id = crypto.randomUUID()
  await db.put('pending_sales', {
    id,
    data: saleData,
    timestamp: Date.now(),
  })
  return id
}

export async function getPendingSales() {
  const db = await getDB()
  return await db.getAll('pending_sales')
}

export async function deletePendingSale(id: string) {
  const db = await getDB()
  await db.delete('pending_sales', id)
}

export async function getPendingSalesCount() {
  const db = await getDB()
  return await db.count('pending_sales')
}
