'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, AlertTriangle, Package, Receipt, TrendingDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface Alert {
  id: string
  type: 'stock_low' | 'stock_critical' | 'expense_high' | 'low_margin'
  title: string
  description: string
  severity: 'warning' | 'error' | 'info'
  link?: string
  createdAt: Date
}

interface AlertsSummary {
  alerts: Alert[]
  unreadCount: number
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertsSummary>({ alerts: [], unreadCount: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/alerts')
        if (res.ok) {
          const data = await res.json()
          setAlerts(data)
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'stock_low':
      case 'stock_critical':
        return Package
      case 'expense_high':
        return Receipt
      case 'low_margin':
        return TrendingDown
      default:
        return AlertTriangle
    }
  }

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-rose-500 bg-rose-500/10'
      case 'warning':
        return 'text-amber-500 bg-amber-500/10'
      default:
        return 'text-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-3 rounded-lg transition-all duration-300',
          'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
        )}
      >
        <Bell size={20} />
        {alerts.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {alerts.unreadCount > 9 ? '9+' : alerts.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            <span className="text-xs text-muted-foreground font-medium">
              {alerts.unreadCount} alertas
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {alerts.alerts.slice(0, 10).map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  const colorClass = getAlertColor(alert.severity)

                  const content = (
                    <div className="p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">{alert.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {alert.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )

                  return alert.link ? (
                    <Link
                      key={alert.id}
                      href={alert.link}
                      onClick={() => setIsOpen(false)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={alert.id}>{content}</div>
                  )
                })}
              </div>
            )}
          </div>

          {alerts.alerts.length > 0 && (
            <div className="p-3 border-t border-border">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary font-medium hover:underline"
              >
                Ver todas las alertas
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}