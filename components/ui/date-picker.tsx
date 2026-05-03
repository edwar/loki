'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DatePickerProps {
  value?: string // YYYY-MM-DD
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  name?: string
  side?: 'top' | 'bottom' | 'auto'
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  className,
  required,
  name,
  side = 'auto'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date())
  const [isMobile, setIsMobile] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0, side: 'bottom' as 'top' | 'bottom' })
  const [popoverHeight, setPopoverHeight] = React.useState(380)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const popoverHeight = 380
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = side === 'top' || (side === 'auto' && spaceBelow < popoverHeight && rect.top > popoverHeight)

      // Collision detection for horizontal space
      let left = rect.left
      const popoverWidth = 300
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16
      }
      left = Math.max(16, left)

      setCoords({
        top: showAbove ? rect.top - 12 : rect.bottom + 12,
        left: left,
        width: rect.width,
        side: showAbove ? 'top' : 'bottom'
      })
    }
  }

  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      setPopoverHeight(containerRef.current.offsetHeight)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen && !isMobile) {
      updateCoords()
      window.addEventListener('scroll', updateCoords, true)
      window.addEventListener('resize', updateCoords)
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [isOpen, isMobile])

  // Handle clicking outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const formattedDate = date.toISOString().split('T')[0]
    onChange?.(formattedDate)
    setIsOpen(false)
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const numDays = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
  }
  for (let d = 1; d <= numDays; d++) {
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString()
    const isSelected = selectedDate?.toDateString() === new Date(year, month, d).toDateString()

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => handleDateSelect(d)}
        className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all active:scale-90",
          isSelected
            ? "bg-primary text-white shadow-lg shadow-primary/30"
            : isToday
              ? "bg-primary/10 text-primary border border-primary/20"
              : "hover:bg-accent text-foreground"
        )}
      >
        {d}
      </button>
    )
  }

  const popover = isOpen && createPortal(
    <>
      {/* Backdrop for mobile */}
      {isMobile && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-in fade-in duration-300" />}

      <div
        className={cn(
          "fixed z-[10000] w-[300px] rounded-lg border border-border/50 bg-card/90 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in duration-300",
          isMobile
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 zoom-in-95"
            : cn("zoom-in-95", coords.side === 'top' ? "origin-bottom-left" : "origin-top-left")
        )}
        style={isMobile ? {} : {
          top: coords.side === 'top' ? coords.top - popoverHeight : coords.top,
          left: coords.left
        }}
        ref={containerRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold tracking-tight">
            {monthNames[month]} <span className="text-muted-foreground font-medium">{year}</span>
          </h4>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => (
            <div key={i} className="h-9 w-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {day}
            </div>
          ))}
          {days}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onChange?.(new Date().toISOString().split('T')[0])
              setIsOpen(false)
            }}
            className="text-xs font-bold text-primary hover:underline transition-all"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              onChange?.('')
              setIsOpen(false)
            }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            Limpiar
          </button>
        </div>
      </div>
    </>,
    document.body
  )

  return (
    <div className={cn("relative w-full", className)}>
      <input type="hidden" name={name} value={value || ''} required={required} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-left",
          !value && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span>{value ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : placeholder}</span>
        </div>
      </button>

      {popover}
    </div>
  )
}
