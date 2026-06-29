import Link from 'next/link'
import { Metadata } from 'next'
import { ChefHat, ArrowLeft, Shield, Eye, Database, Cookie, UserX, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Loki. Conoce cómo recopilamos, usamos y protegemos tu información personal.',
  openGraph: {
    title: 'Política de Privacidad - Loki',
    description: 'Política de privacidad de la plataforma de gestión empresarial Loki.',
    url: '/privacidad',
  },
}

const sections = [
  {
    icon: Database,
    title: 'Información que Recopilamos',
    content: 'Recopilamos la información necesaria para proporcionar nuestros servicios: nombre, correo electrónico, datos de tu empresa (nombre, dirección, RFC), y la información que ingresas en la plataforma (productos, clientes, ventas, gastos).'
  },
  {
    icon: Shield,
    title: 'Uso de la Información',
    content: 'Usamos tu información únicamente para operar y mejorar la plataforma Loki, procesar tus transacciones, generar reportes, y comunicarnos contigo sobre actualizaciones del servicio.'
  },
  {
    icon: Eye,
    title: 'Protección de Datos',
    content: 'Implementamos cifrado SSL/TLS, autenticación segura, y almacenamiento en servidores con altos estándares de seguridad. Todos los datos se respaldan diariamente para prevenir pérdidas.'
  },
  {
    icon: Share2,
    title: 'Compartir Información',
    content: 'No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario para proveer el servicio (procesadores de pago, hosting) o por requerimiento legal.'
  },
  {
    icon: Cookie,
    title: 'Cookies',
    content: 'Utilizamos cookies esenciales para el funcionamiento de la plataforma. Puedes configurar tu navegador para rechazarlas, aunque algunas funciones podrían verse afectadas.'
  },
  {
    icon: UserX,
    title: 'Tus Derechos',
    content: 'Puedes solicitar la exportación o eliminación de tus datos en cualquier momento desde la configuración de tu cuenta o contactándonos directamente.'
  },
]

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChefHat size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Política de Privacidad</h1>
            <p className="text-muted-foreground mt-1">Última actualización: 2025</p>
          </div>
        </div>

        <p className="text-muted-foreground mb-12 leading-relaxed">
          En Loki nos comprometemos a proteger tu privacidad. Esta política describe cómo
          recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra plataforma.
        </p>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="p-6 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-10 text-center">
          Si tienes dudas sobre nuestra política de privacidad, escríbenos a{' '}
          <a href="mailto:edwaramayadiaz@gmail.com" className="text-primary hover:underline">edwaramayadiaz@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
