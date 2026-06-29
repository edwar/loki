import Link from 'next/link'
import { Metadata } from 'next'
import { ChefHat, ArrowLeft, Mail, BookOpen, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Soporte',
  description: 'Centro de soporte de Loki. Encuentra ayuda sobre la plataforma de gestión empresarial, contacta con nuestro equipo o reporta un problema.',
  openGraph: {
    title: 'Soporte - Loki',
    description: 'Centro de soporte y ayuda para la plataforma de gestión empresarial Loki.',
    url: '/soporte',
  },
}

const channels = [
  {
    icon: Mail,
    title: 'Correo Electrónico',
    description: 'Escríbenos directamente y te responderemos en menos de 24 horas.',
    action: 'edwaramayadiaz@gmail.com',
    href: 'mailto:edwaramayadiaz@gmail.com',
  },
  {
    icon: BookOpen,
    title: 'Guía de Uso',
    description: 'Consulta nuestra guía completa con tutoriales detallados de todas las funcionalidades.',
    action: 'Ver guía',
    href: '/guia',
  },
]

const faqs = [
  {
    q: '¿Cómo puedo restablecer mi contraseña?',
    r: 'Ve a la página de inicio de sesión y haz clic en "¿Olvidaste tu contraseña?". Recibirás un enlace para restablecerla en tu correo.'
  },
{
    q: '¿Cómo exporto mis datos?',
    r: 'Puedes exportar reportes en PDF desde la sección de Reportes. Si necesitas una exportación completa de tus datos, contáctanos.'
  },
  {
    q: '¿Ofrecen capacitación?',
    r: 'Sí, contamos con una guía de uso completa y podemos agendar sesiones de capacitación personalizadas.'
  },
]

export default function SoportePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Soporte</h1>
            <p className="text-muted-foreground mt-1">Estamos aquí para ayudarte</p>
          </div>
        </div>

        {/* Canales de soporte */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {channels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <channel.icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold mb-1">{channel.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {channel.description}
                  </p>
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    {channel.action} →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group p-4 rounded-xl border border-border/50 bg-card">
                <summary className="cursor-pointer font-medium text-sm flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronDown size={16} className="text-muted-foreground group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronDown(props: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
