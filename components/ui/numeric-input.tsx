'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | number
  onChange?: (value: number) => void
  format?: 'currency' | 'number' | 'none'
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onChange, format = 'number', ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    // Synchronize display value when prop value changes
    React.useEffect(() => {
      if (value === undefined || value === null) {
        setDisplayValue('')
        return
      }

      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(numValue)) {
        setDisplayValue('')
      } else {
        setDisplayValue(formatDisplay(numValue.toString()))
      }
    }, [value, format])

    function formatDisplay(val: string) {
      // Remove all non-numeric characters except decimal point
      let clean = val.replace(/[^\d.]/g, '')

      // Prevent multiple decimal points
      const parts = clean.split('.')
      if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('')

      // Remove leading zeros (unless it's "0." something)
      if (clean.length > 1 && clean.startsWith('0') && clean[1] !== '.') {
        clean = clean.replace(/^0+/, '')
      }
      if (clean.startsWith('.')) clean = '0' + clean
      if (clean === '') return ''

      if (format === 'none') return clean

      // Add thousands separators for display
      const [integer, decimal] = clean.split('.')
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

      return decimal !== undefined ? `${formattedInteger},${decimal}` : formattedInteger
    }

    function parseValue(val: string) {
      // Convert display format (1.234,56) back to standard number format (1234.56)
      return val.replace(/\./g, '').replace(',', '.')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value

      // If user is deleting everything
      if (rawValue === '') {
        setDisplayValue('')
        onChange?.(0)
        return
      }

      // Format for display
      const cleanValue = rawValue.replace(/[^\d,.]/g, '')
      const standardValue = parseValue(cleanValue)
      const numValue = parseFloat(standardValue)

      if (!isNaN(numValue) || standardValue === '') {
        const formatted = formatDisplay(standardValue)
        setDisplayValue(formatted)
        onChange?.(isNaN(numValue) ? 0 : numValue)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={cn('flex h-12 w-full px-4 py-2 text-sm bg-background/50 border border-border/50 rounded-lg transition-all duration-300',
          'placeholder:text-muted-foreground/50 font-medium',
          'focus:outline-none focus:border-primary',
          'disabled:bg-muted disabled:cursor-not-allowed',
          'text-foreground',
          className)}
      />
    )
  }
)

NumericInput.displayName = 'NumericInput'
