import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl transition-all duration-200',
          'placeholder:text-gray-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:border-black dark:focus:border-white focus:ring-0',
          'disabled:bg-gray-50 dark:disabled:bg-slate-700 disabled:cursor-not-allowed',
          'text-black dark:text-white',
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