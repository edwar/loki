import Link from 'next/link'
import { Metadata } from 'next'
import { ChefHat, ArrowLeft, Shield, FileText, Scale, Lock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de Loki. Conoce las reglas y políticas para el uso de nuestra plataforma de gestión empresarial.',
  openGraph: {
    title: 'Términos y Condiciones - Loki',
    description: 'Términos y condiciones de uso de la plataforma de gestión empresarial Loki.',
    url: '/terminos',
  },
}

const sections = [
  {
    icon: FileText,
    title: 'Aceptación de los Términos',
    content: 'Al acceder y utilizar Loki, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte, no debes usar el servicio.'
  },
  {
    icon: Scale,
    title: 'Uso del Servicio',
    content: 'Loki es una plataforma de gestión empresarial diseñada para emprendedores y pequeñas empresas. Te comprometes a usar el servicio únicamente para fines legales y de acuerdo con todas las leyes aplicables.'
  },
  {
    icon: Lock,
    title: 'Privacidad y Seguridad',
    content: 'Nos tomamos muy en serio la seguridad de tus datos. Implementamos medidas técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración.'
  },
  {
    icon: AlertTriangle,
    title: 'Limitación de Responsabilidad',
    content: 'Loki se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No seremos responsables por daños indirectos derivados del uso de la plataforma.'
  },
  {
    icon: Shield,
    title: 'Eliminación de Cuenta',
    content: 'Puedes solicitar la eliminación de tu cuenta y todos los datos asociados en cualquier momento. El proceso se completará dentro de los 30 días posteriores a la solicitud.'
  },
]

export default function TerminosPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Términos y Condiciones</h1>
            <p className="text-muted-foreground mt-1">Última actualización: 2025</p>
          </div>
        </div>

        <p className="text-muted-foreground mb-12 leading-relaxed">
          Estos términos y condiciones rigen el uso de la plataforma Loki. Al registrarte y utilizar
          nuestros servicios, aceptas estar sujeto a estos términos. Te recomendamos leerlos
          cuidadosamente.
        </p>

        <div className="space-y-6">
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
          Si tienes preguntas sobre estos términos, contáctanos en{' '}
          <a href="mailto:edwaramayadiaz@gmail.com" className="text-primary hover:underline">edwaramayadiaz@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
