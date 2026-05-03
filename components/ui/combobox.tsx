'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface ComboboxProps {
  options: { value: string; label: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  allowCustom?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar opción...",
  emptyMessage = "No se encontraron resultados.",
  className,
  allowCustom = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 })
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find((option) => option.value === value)

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  React.useEffect(() => {
    if (open) {
      updateCoords()
      window.addEventListener('scroll', updateCoords, true)
      window.addEventListener('resize', updateCoords)
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownContent = open && createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[10000] bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: coords.top + 8,
        left: coords.left,
        width: coords.width,
      }}
    >
      <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1">
        {filteredOptions.length === 0 && !allowCustom ? (
          <p className="p-4 text-sm text-center text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center justify-between group",
                  value === option.value
                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                  setSearch("")
                }}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 shrink-0 ml-2" />}
              </button>
            ))}
            {allowCustom && search && !options.some(o => o.label.toLowerCase() === search.toLowerCase()) && (
              <button
                className="w-full text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center gap-3 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 group"
                onClick={() => {
                  onValueChange(search)
                  setOpen(false)
                  setSearch("")
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Crear nuevo proveedor</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-60">Usar: "{search}"</p>
                </div>
              </button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  )

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-4 py-2 text-sm transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-left group",
          !value && "text-muted-foreground",
          open && "border-primary ring-2 ring-primary/20"
        )}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : (allowCustom && value ? value : placeholder)}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>
      {dropdownContent}
    </div>
  )
}
