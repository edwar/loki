import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'pill' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
      ghost: 'bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground',
      outline: 'bg-transparent border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40',
      destructive: 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90',
      pill: 'rounded-full font-bold uppercase tracking-widest text-[10px]',
    }
    
    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 text-sm',
      lg: 'h-14 px-8 text-base',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center transition-all duration-300 font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl',
          variant === 'pill' ? 'rounded-full px-6' : '',
          variants[variant as keyof typeof variants],
          sizes[size as keyof typeof sizes],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }