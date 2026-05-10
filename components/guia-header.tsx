'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, ChevronRight, LayoutDashboard, LogIn } from 'lucide-react'
import { ChefHat } from 'lucide-react'

export function GuiaHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
            <ChefHat size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Loki</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen size={14} />
            Guía de Usuario
          </span>
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Ir al Dashboard <LayoutDashboard size={14} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Iniciar Sesión <LogIn size={14} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}