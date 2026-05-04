'use client'

import { useEffect, useState } from 'react'
import { CloudOff, RefreshCw } from 'lucide-react'
import { sileo as toast } from 'sileo'
import { getPendingSales, deletePendingSale, getPendingSalesCount } from '@/lib/offline-sync'
import { createSale } from '@/lib/actions/sales'

export function SyncManager() {
  const [isOffline, setIsOffline] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const checkPending = async () => {
    try {
      const count = await getPendingSalesCount()
      setPendingCount(count)
    } catch (error) {
      console.error('Error checking pending syncs', error)
    }
  }

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    checkPending()

    const handleOnline = () => {
      setIsOffline(false)
      toast.success({ title: 'Conexión Restablecida', description: 'Sistema en línea nuevamente.' })
      syncPendingData()
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.error({ title: 'Sin Conexión a Internet', description: 'Modo offline activado. Las ventas se guardarán localmente.' })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check periodically for pending data if online (in case they failed previously)
    const interval = setInterval(() => {
      if (navigator.onLine) checkPending()
    }, 10000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const syncPendingData = async () => {
    if (!navigator.onLine || isSyncing) return

    setIsSyncing(true)
    try {
      const pendingSales = await getPendingSales()
      if (pendingSales.length === 0) {
        setIsSyncing(false)
        return
      }

      toast.warning({ title: `Sincronizando ${pendingSales.length} ventas locales...` })

      for (const sale of pendingSales) {
        try {
          const formData = new FormData()
          formData.append('customerId', sale.data.customerId)
          formData.append('items', sale.data.items)

          await createSale(formData)
          await deletePendingSale(sale.id)
        } catch (error) {
          console.error('Failed to sync sale', sale.id, error)
        }
      }

      toast.success({ title: 'Sincronización Completa', description: 'Todas las ventas offline han sido registradas.' })
      await checkPending()
    } catch (error) {
      console.error('Sync failed', error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOffline && pendingCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2">
      {isOffline && (
        <div className="bg-rose-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
          <CloudOff size={14} />
          Modo Offline
        </div>
      )}

      {pendingCount > 0 && (
        <button
          onClick={syncPendingData}
          disabled={isOffline || isSyncing}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold transition-colors"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Sincronizando...' : `${pendingCount} Ventas Pendientes`}
        </button>
      )}
    </div>
  )
}
