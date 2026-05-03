'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showRequirements?: boolean
}

export function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: 'Mínimo 10 caracteres', valid: password.length >= 10 },
    { label: 'Una minúscula', valid: /[a-z]/.test(password) },
    { label: 'Una mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Un carácter especial (!@#$%^&*.)', valid: /[!@#$%^&*.]/.test(password) },
  ]

  const allValid = requirements.every(r => r.valid)

  return (
    <div className="space-y-3 mt-3 p-4 bg-[var(--accent)] rounded-lg border border-[var(--border)]">
      <p className="text-xs font-semibold text-[var(--accent-foreground)] uppercase tracking-wide">La contraseña debe tener:</p>
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2.5">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              req.valid ? "bg-[var(--success)]" : "bg-[var(--muted)]"
            )}>
              {req.valid && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={cn("text-xs", req.valid ? "text-[var(--success)] font-medium" : "text-[var(--muted-foreground)]")}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
      {allValid && (
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-[var(--success)]">¡Contraseña válida!</span>
        </div>
      )}
    </div>
  )
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showRequirements, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [internalPassword, setInternalPassword] = React.useState('')

    const password = (value as string) || internalPassword

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalPassword(e.target.value)
      onChange?.(e)
    }

    return (
      <div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'flex h-10 w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm transition-all duration-200',
              'placeholder:text-[var(--muted-foreground)]',
              'focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'disabled:bg-[var(--muted)]',
              'pr-12',
              className
            )}
            ref={ref}
            value={value}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--muted)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {showRequirements && password.length > 0 && (
          <PasswordRequirements password={password} />
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }