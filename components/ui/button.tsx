import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'pill'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
      secondary: 'bg-gray-100 dark:bg-slate-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600',
      ghost: 'bg-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700',
      outline: 'bg-white dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black',
      pill: 'rounded-full font-semibold',
    }
    
    const sizes = {
      sm: 'h-8 px-4 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'pill' ? 'rounded-full px-6 font-semibold' : 'rounded-2xl',
          variants[variant],
          sizes[size],
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