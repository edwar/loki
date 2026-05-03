'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      console.error('Login error:', result.error)
      setError('Credenciales inválidas')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg bg-[var(--primary)] flex items-center justify-center mb-4 shadow-lg">
            <ChefHat size={32} className="text-[var(--primary-foreground)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Loki</h1>
          <p className="text-[var(--muted-foreground)]">Gestión de negocios</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
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
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[var(--foreground)] font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}