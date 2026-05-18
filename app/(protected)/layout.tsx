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
  LogOut,
  User,
  Building2,
  ChevronRight,
  Factory,
  Shield,
  ShieldAlert,
  FileText,
  FileSignature,
  Tag,
  Percent
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { getLowStockCount } from '@/lib/actions/alerts'
import { SyncManager } from '@/components/sync-manager'
import { Button } from '@/components/ui/button'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { ChevronDown } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon?: any
  roles?: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

const navigation: NavSection[] = [
  {
    title: 'Principal',
    defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Reportes', href: '/reportes', icon: FileText, roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Inventario',
    defaultOpen: true,
    items: [
      { name: 'Inventario', href: '/inventario', icon: Package, roles: ['admin', 'manager'] },
      { name: 'Producción', href: '/produccion', icon: Factory },
      { name: 'Productos', href: '/productos', icon: ShoppingBag },
    ]
  },
  {
    title: 'Ventas',
    defaultOpen: true,
    items: [
      { name: 'Ventas', href: '/ventas', icon: TrendingUp },
      { name: 'Facturación', href: '/facturas', icon: FileSignature },
      { name: 'Rentabilidad', href: '/rentabilidad', icon: Percent },
    ]
  },
  {
    title: 'Gastos',
    defaultOpen: false,
    items: [
      { name: 'Gastos', href: '/gastos', icon: Receipt },
    ]
  },
  {
    title: 'Administración',
    defaultOpen: false,
    items: [
      { name: 'Proveedores', href: '/proveedores', icon: Truck, roles: ['admin', 'manager'] },
      { name: 'Categorías', href: '/categorias', icon: Tag },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Bienes', href: '/bienes', icon: Building2, roles: ['admin'] },
      { name: 'Equipo', href: '/equipo', icon: Shield, roles: ['admin'] },
      { name: 'Auditoría', href: '/auditoria', icon: ShieldAlert, roles: ['admin'] },
    ]
  },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navigation.forEach(section => {
      initial[section.title] = section.defaultOpen || false
    })
    return initial
  })

  useEffect(() => {
    getLowStockCount().then(setLowStockCount)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const roleLabel = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado'
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 transition-colors duration-500 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 rounded-lg bg-card/80 backdrop-blur-xl border border-border shadow-xl active:scale-95 transition-all"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-card/40 backdrop-blur-3xl border-r border-border/50 transition-all duration-500 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <img src="/favicon.svg" alt="Loki" width={40} height={40} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight font-display">Loki</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-70">Business Hub</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 overflow-y-auto scrollbar-none">
            {navigation.map((section) => {
              const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(session?.user?.role as string))
              if (visibleItems.length === 0) return null

              const isExpanded = expandedSections[section.title]
              const sectionActive = visibleItems.some(item => 
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              )

              return (
                <div key={section.title} className="mb-4">
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [section.title]: !prev[section.title] }))}
                    className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors"
                  >
                    <span>{section.title}</span>
                    <ChevronDown 
                      size={14} 
                      className={cn('transition-transform duration-200', isExpanded ? 'rotate-180' : '')} 
                    />
                  </button>
                  <div className={cn('space-y-1 overflow-hidden transition-all duration-300', isExpanded ? 'mt-1' : 'h-0')}>
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                          )}
                        >
                          {Icon && <Icon size={16} className={cn(isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary')} />}
                          <span className="flex-1">{item.name}</span>
                          {isActive && <ChevronRight size={12} className="opacity-50" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User & Settings */}
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-lg bg-accent/30 border border-border/50 space-y-4">
              {session?.user && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-violet-500 flex items-center justify-center text-white shadow-md">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                      {roleLabel[session.user.role as keyof typeof roleLabel] || session.user.role}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center">
                  <ThemeToggle />
                </div>
                <Button
                  onClick={handleSignOut}
                  title="Cerrar Sesión"
                  variant="destructive"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-center text-muted-foreground/40 uppercase tracking-[0.2em]">
              Loki v2.0.4
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm lg:hidden transition-opacity duration-500"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen relative">
        <div className="max-w-7xl mx-auto p-4 md:p-10 pb-20">
          <div className="transition-all duration-500">
            {children}
          </div>
        </div>
      </main>

      <SyncManager />
    </div>
  )
}