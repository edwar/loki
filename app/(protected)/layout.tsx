'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  User,
  Building2,
  ShoppingCart
} from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Insumos', href: '/insumos', icon: Package },
  { name: 'Productos', href: '/productos', icon: ShoppingBag },
  { name: 'Ventas', href: '/ventas', icon: TrendingUp },
  { name: 'Gastos', href: '/gastos', icon: Receipt },
  { name: 'Compras', href: '/compras', icon: ShoppingCart },
  { name: 'Proveedores', href: '/proveedores', icon: Truck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Bienes', href: '/bienes', icon: Building2 },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
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
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-900">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
        >
          {mobileOpen ? <X size={20} className="text-black dark:text-white" /> : <Menu size={20} className="text-black dark:text-white" />}
        </button>
      </div>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-black flex items-center justify-center">
                <ChefHat size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-black dark:text-white tracking-tight">Loki</h1>
                <p className="text-xs text-gray-400 dark:text-slate-400">Business Manager</p>
              </div>
            </div>
          </div>
          
          {session?.user && (
            <div className="p-4 mx-4 mt-4 mb-2 rounded bg-gray-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                  <User size={18} className="text-gray-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-400">
                    {roleLabel[session.user.role as keyof typeof roleLabel] || session.user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white'
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-center">
              <ThemeToggle />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
            <div className="text-xs text-gray-300 dark:text-slate-600 text-center">
              Loki v1.0.0
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
        <div className="p-6 lg:p-10 pt-20 lg:pt-24">{children}</div>
      </main>
    </div>
  )
}