'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, AlertTriangle, Package, Receipt, TrendingDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface Alert {
  id: string
  type: 'stock_low' | 'stock_critical' | 'expense_high' | 'low_margin' | 'sales_drop' | 'no_sales_today'
  title: string
  description: string
  severity: 'warning' | 'error' | 'info'
  link?: string
  createdAt: Date
  read: boolean
}

interface AlertsSummary {
  alerts: Alert[]
  unreadCount: number
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: summary = { alerts: [], unreadCount: 0 } } = useQuery<AlertsSummary>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts')
      if (!res.ok) throw new Error('Error al cargar alertas')
      return res.json()
    },
    refetchInterval: isOpen ? 60000 : false,
    enabled: isOpen,
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', id }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', id }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })

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
      case 'sales_drop':
      case 'no_sales_today':
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
        {summary.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {summary.unreadCount > 9 ? '9+' : summary.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {summary.unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Marcar todas leídas
                </button>
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {summary.unreadCount} sin leer
              </span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {summary.alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {summary.alerts.slice(0, 10).map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  const colorClass = getAlertColor(alert.severity)

                  const content = (
                    <div className={cn("p-4 hover:bg-accent/30 transition-colors", !alert.read && "bg-primary/3")}>
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
                        <div className="flex flex-col gap-1 shrink-0">
                          {!alert.read && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                markReadMutation.mutate(alert.id)
                              }}
                              className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                              title="Marcar como leída"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              dismissMutation.mutate(alert.id)
                            }}
                            className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                            title="Descartar"
                          >
                            <X size={12} />
                          </button>
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

          {summary.alerts.length > 0 && (
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
