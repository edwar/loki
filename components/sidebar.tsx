'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  Users,
  Truck,
  TrendingUp,
  Menu,
  X,
  ChefHat,
  LogOut,
  User
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Insumos', href: '/insumos', icon: Package },
  { name: 'Productos', href: '/productos', icon: ShoppingBag },
  { name: 'Ventas', href: '/ventas', icon: TrendingUp },
  { name: 'Gastos', href: '/gastos', icon: Receipt },
  { name: 'Proveedores', href: '/proveedores', icon: Truck },
  { name: 'Clientes', href: '/clientes', icon: Users },
]

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  const roleLabel = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado'
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <ChefHat size={22} className="text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Loki</h1>
                <p className="text-xs text-[var(--muted-foreground)]">Gestión de negocio</p>
              </div>
            </div>
          </div>
          
          {session?.user && (
            <div className="p-4 mx-4 mb-2 rounded-lg bg-[var(--accent)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <User size={18} className="text-[var(--primary-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {roleLabel[session.user.role as keyof typeof roleLabel] || session.user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border)]">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
            <div className="text-xs text-[var(--muted-foreground)] text-center mt-3">
              Loki v0.1.0
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}