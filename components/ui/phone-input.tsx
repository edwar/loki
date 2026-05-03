'use client'

import * as React from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value: propValue, defaultValue, onChange, onValueChange, ...props }, ref) => {
    const [value, setValue] = React.useState(propValue || defaultValue || '')

    React.useEffect(() => {
      if (propValue !== undefined) {
        setValue(formatPhoneNumber(propValue as string))
      }
    }, [propValue])

    function formatPhoneNumber(val: string) {
      // Remove all non-numeric characters
      const cleaned = val.replace(/\D/g, '')

      // Limit to 10 digits (common for mobile)
      const limited = cleaned.slice(0, 10)

      if (limited.length === 0) return ''
      if (limited.length <= 3) return limited
      if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 10)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const formatted = formatPhoneNumber(rawValue)

      setValue(formatted)

      // Call standard onChange for form compatibility
      if (onChange) {
        const event = {
          ...e,
          target: {
            ...e.target,
            value: formatted,
            name: props.name || ''
          }
        }
        onChange(event as any)
      }

      onValueChange?.(formatted)
    }

    return (
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none border-r border-border/50 pr-3 h-5">
          <span className="text-sm font-bold text-muted-foreground group-focus-within:text-primary transition-colors">+57</span>
        </div>
        <Input
          {...props}
          ref={ref}
          type="tel"
          value={value}
          onChange={handleChange}
          className={cn('pl-[64px] font-mono tracking-wider', className)}
        />
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
