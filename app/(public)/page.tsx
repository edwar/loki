import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChefHat,
  TrendingUp,
  Package,
  Receipt,
  Users,
  Truck,
  BarChart3,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const features = [
  {
    icon: TrendingUp,
    title: 'Ventas',
    description: 'Registro rápido de ventas con descuento automático de inventario'
  },
  {
    icon: Package,
    title: 'Inventario',
    description: 'Controla tus insumos y recibe alertas de stock bajo'
  },
  {
    icon: Receipt,
    title: 'Gastos',
    description: 'Registra y categoriza todos tus gastos indirectos'
  },
  {
    icon: Users,
    title: 'Clientes',
    description: 'Historial de compras y datos de contacto'
  },
  {
    icon: Truck,
    title: 'Proveedores',
    description: 'Gestiona tus proveedores y compras'
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Visualiza métricas y estadísticas en tiempo real'
  }
]

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat size={22} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Loki</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button>Ir al Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Crear Cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-sm text-muted-foreground mb-6">
            <Zap size={16} className="text-amber-500" />
            La gestión de tu negocio, simplificada
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Controla tu negocio
            <span className="block text-primary">desde cualquier lugar</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Plataforma integral de gestión empresarial para emprendedores.
            Ventas, inventario, gastos y más, todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Comenzar Gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Herramientas potentes para gestionar cada aspecto de tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="card-hover border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Diseñado para tu negocio
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Responsive</h3>
                    <p className="text-muted-foreground text-sm">
                      Accede desde cualquier dispositivo, incluso desde tu celular
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Datos seguros</h3>
                    <p className="text-muted-foreground text-sm">
                      Tu información protegida en la nube con Neon
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Rápido y fácil</h3>
                    <p className="text-muted-foreground text-sm">
                      Interfaz intuitiva que te permite empezar en minutos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl" />
              <div className="relative p-8 border border-border rounded-3xl bg-card">
                <div className="space-y-4">
                  <div className="h-4 bg-accent rounded w-3/4" />
                  <div className="h-4 bg-accent rounded w-1/2" />
                  <div className="h-20 bg-accent rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 bg-accent rounded" />
                    <div className="h-12 bg-accent rounded" />
                    <div className="h-12 bg-accent rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Crea tu cuenta gratis y toma el control de tu negocio hoy mismo
          </p>
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-12">
                Ir al Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="text-lg px-12">
                Crear Mi Cuenta
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground">Loki v0.1.0</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Loki. Plataforma de gestión de negocios.
          </p>
        </div>
      </footer>
    </div>
  )
}