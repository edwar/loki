'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 10) errors.push('Mínimo 10 caracteres')
  if (!/[a-z]/.test(password)) errors.push('Una minúscula')
  if (!/[A-Z]/.test(password)) errors.push('Una mayúscula')
  if (!/[!@#$%^&*.]/.test(password)) errors.push('Un carácter especial')
  return { valid: errors.length === 0, errors }
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value.length > 0) {
      setValidation(validatePassword(value))
    } else {
      setValidation(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError('La contraseña no cumple con los requisitos')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear cuenta')
        setLoading(false)
        return
      }

      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      window.location.href = '/dashboard'
    } catch {
      setError('Error al crear cuenta')
      setLoading(false)
    }
  }

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mb-4 shadow-lg">
            <ChefHat size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Loki</h1>
          <p className="text-muted-foreground">Gestión de negocios</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  name="name"
                  required
                  className="mt-1"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  showRequirements
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmar Contraseña</label>
                <PasswordInput
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1 font-medium">Las contraseñas no coinciden</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <Select name="role" defaultValue="employee">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="employee">Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}