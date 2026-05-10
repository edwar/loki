import Link from 'next/link'
import { Metadata } from 'next'
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
  Zap,
  ArrowRight,
  ChevronRight,
  Star
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: 'Plataforma de Gestión Empresarial para Emprendedores',
  description: 'Controla tu negocio con inteligencia real. Loki ofrece control de inventario, ventas, producción, gastos y reportes PDF en una plataforma diseñada para emprendedores modernos.',
  openGraph: {
    title: 'Loki - Plataforma de Gestión Empresarial',
    description: 'Controla tu negocio con inteligencia real. Sistema integral para emprendedores.',
    url: '/',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loki - Plataforma de Gestión Empresarial',
    description: 'Controla tu negocio con inteligencia real.',
  },
}

const features = [
  {
    icon: TrendingUp,
    title: 'Ventas Inteligentes',
    description: 'Registro ultra-rápido de ventas con sincronización automática de stock en tiempo real.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Package,
    title: 'Control de Inventario',
    description: 'Gestión granular de insumos con alertas inteligentes de reabastecimiento.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    icon: Receipt,
    title: 'Análisis de Gastos',
    description: 'Categorización automática de egresos para mantener tus finanzas bajo control.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    icon: Users,
    title: 'Fidelización de Clientes',
    description: 'Base de datos inteligente con historial detallado y perfiles de consumo.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10'
  },
  {
    icon: Truck,
    title: 'Red de Proveedores',
    description: 'Centraliza tus compras y mantén una comunicación fluida con tus aliados.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10'
  },
  {
    icon: BarChart3,
    title: 'Métricas Avanzadas',
    description: 'Visualiza el crecimiento de tu negocio con reportes interactivos de alto nivel.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10'
  }
]

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Loki",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Plataforma integral de gestión empresarial para emprendedores. Control de inventario, ventas, producción, gastos y reportes PDF.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Plan gratuito disponible"
            },
            "provider": {
              "@type": "Organization",
              "name": "Loki Systems",
              "url": "https://loki.app"
            }
          })
        }}
      />

      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ChefHat size={22} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-display">Loki</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funciones</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">Beneficios</a>
            <Link href="/guia" className="hover:text-foreground transition-colors">Guía de Uso</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/50 hidden sm:block" />
              {session ? (
                <Link href="/dashboard">
                  <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all active:scale-95">
                    Ir al Dashboard
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="rounded-full px-6 hover:bg-accent/50">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all active:scale-95">
                      Comenzar Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
              <Zap size={14} className="fill-primary" />
              <span>Nueva versión 2.0 ya disponible</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground animate-fade-in [animation-delay:200ms] font-display">
              Controla tu negocio
              <span className="block bg-linear-to-r from-primary to-violet-500 bg-clip-text text-transparent pb-2">
                con inteligencia real
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in [animation-delay:400ms]">
              La plataforma definitiva para emprendedores modernos.
              Sincroniza ventas, inventario y finanzas en una interfaz diseñada para la eficiencia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in [animation-delay:600ms]">
              {session ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 active:scale-95 transition-all">
                    Explorar mi Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 active:scale-95 transition-all">
                      Empezar ahora — Es gratis
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full border-2 hover:bg-accent active:scale-95 transition-all">
                      Ver Demo en vivo
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="pt-16 flex flex-col items-center gap-4 animate-fade-in [animation-delay:800ms]">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt="Usuario satisfecho"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">+500 negocios</span> ya confían en Loki
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-base font-bold text-primary uppercase tracking-widest font-display">Capacidades</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight font-display">
                Todo bajo control, <br className="hidden md:block" /> sin complicaciones.
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 rounded-lg"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${feature.bg}`} />
                  <CardContent className="p-8 space-y-4">
                    <div className={`w-14 h-14 rounded-lg ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="pt-4 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Saber más <ArrowRight size={14} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Bento Section */}
        <section id="benefits" className="py-24 px-6 bg-accent/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 p-8 md:p-12 rounded-lg bg-primary text-primary-foreground overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                  <Zap size={300} />
                </div>
                <div className="relative z-10 space-y-6 max-w-xl">
                  <Star className="text-amber-300 fill-amber-300" />
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display">
                    Velocidad inigualable para tu operación diaria
                  </h2>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Hemos optimizado cada milisegundo de la interfaz para que el registro de una venta
                    tome menos tiempo que decir su nombre. Loki se adapta a tu ritmo, no al revés.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 grid gap-8">
                <div className="p-8 rounded-lg bg-card border border-border/50 space-y-4 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold">Seguridad de Nivel Bancario</h2>
                  <p className="text-muted-foreground">
                    Tus datos están encriptados y respaldados en la nube 24/7.
                  </p>
                </div>
                <div className="p-8 rounded-lg bg-card border border-border/50 space-y-4 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Smartphone className="text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-bold">Experiencia Multi-dispositivo</h2>
                  <p className="text-muted-foreground">
                    Gestiona desde tu iPad en el local o desde tu iPhone mientras viajas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 text-center overflow-hidden relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-3xl mx-auto space-y-8 relative">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight font-display">
              Lleva tu negocio al <br />
              <span className="text-primary italic">siguiente nivel</span> hoy.
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Únete a cientos de emprendedores que ya transformaron su gestión.
              Sin tarjetas de crédito, empieza gratis en segundos.
            </p>
            <div className="pt-8">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-xl px-12 h-16 rounded-full shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    Volver a mi Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="text-xl px-12 h-16 rounded-full shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    Crear mi cuenta gratuita
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Pruébalo gratis por 14 días. No requiere tarjeta.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-accent/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Loki</span>
            <span className="text-sm text-muted-foreground ml-2">v2.0.4</span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/guia" className="hover:text-foreground transition-colors">Guía de Uso</Link>
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">Términos</a>
            <a href="#" className="hover:text-foreground transition-colors">Soporte</a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 Loki Systems Inc. Hecho con ❤️ para emprendedores.
          </p>
        </div>
      </footer>
    </div>
  )
}