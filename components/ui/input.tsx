import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && onChange) {
        const newValue = e.target.value
        let clean = newValue.replace(/[^\d.]/g, '')
        if (clean.length > 1 && clean.startsWith('0') && clean[1] !== '.') {
          clean = clean.replace(/^0+/, '')
        }
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: clean }
        }
        onChange(syntheticEvent as any)
        return
      }
      onChange?.(e)
    }

    return (
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={cn(
          'flex h-12 w-full px-4 py-2 text-sm bg-background/50 border border-border/50 rounded-lg transition-all duration-300',
          'placeholder:text-muted-foreground/50 font-medium',
          'focus:outline-none focus:border-primary',
          'disabled:bg-muted disabled:cursor-not-allowed',
          'text-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }