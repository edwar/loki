import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full px-4 py-2 text-sm bg-background/50 border border-border/50 rounded-lg transition-all duration-300',
          'placeholder:text-muted-foreground/50 font-medium',
          'focus:outline-none focus:border-primary',
          'disabled:bg-muted disabled:cursor-not-allowed',
          'text-foreground resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }