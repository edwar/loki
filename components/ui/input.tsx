import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full px-4 py-2 text-sm bg-background/50 border border-border/50 rounded-lg transition-all duration-300',
          'placeholder:text-muted-foreground/50 font-medium',
          'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
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