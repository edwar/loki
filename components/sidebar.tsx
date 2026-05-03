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
  LogOut,
  ChefHat
} from 'lucide-react'

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
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      {/* Narrow Black Sidebar */}
      <aside className="w-[72px] min-h-screen bg-black flex flex-col items-center py-6 fixed">
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-8">
          <ChefHat size={20} className="text-black" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-white'
                )}
                title={item.name}
              >
                <item.icon size={20} />
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-200"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[72px]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}