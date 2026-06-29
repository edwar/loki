import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-[#0b0b1a] to-slate-950 flex items-center justify-center overflow-hidden selection:bg-primary/30 selection:text-white">

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          animation: 'grid-shift 20s linear infinite',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 border border-primary/30 rounded-lg rotate-45 animate-float" style={{ '--rotate': '45deg' } as React.CSSProperties} />
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary/20 rounded-full animate-float-delayed" />
      <div className="absolute bottom-1/3 left-1/5 w-5 h-5 border border-amber-400/30 rounded-full animate-float-slow" style={{ '--rotate': '0deg' } as React.CSSProperties} />
      <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-amber-400/20 rounded animate-drift" />
      <div className="absolute top-2/3 left-2/3 w-4 h-4 border border-primary/20 rounded-lg rotate-12 animate-float" style={{ '--rotate': '12deg', animationDelay: '3s' } as React.CSSProperties} />
      <div className="absolute top-[15%] left-[60%] w-2 h-2 bg-primary/15 rounded animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[70%] left-[10%] w-3 h-3 border border-purple-400/20 rounded-full animate-float-delayed" />
      <div className="absolute top-[45%] right-[8%] w-2 h-2 bg-amber-400/15 rounded animate-drift" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] left-[55%] w-4 h-4 border border-primary/15 rounded-lg rotate-90 animate-float-slow" />
      <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 bg-white/10 rounded animate-float" style={{ animationDelay: '4s' }} />

      {/* Corner decorative line */}
      <div className="absolute top-0 right-0 w-64 h-64">
        <div className="absolute top-8 right-8 w-px h-24 bg-gradient-to-b from-primary/40 to-transparent" />
        <div className="absolute top-8 right-8 w-24 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 text-center">

        {/* 404 */}
        <h1 className="animate-fade-in stagger-1 font-display text-[10rem] sm:text-[12rem] font-extrabold leading-none tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-amber-300 bg-clip-text text-transparent select-none">
          404
        </h1>

        {/* Message */}
        <div className="animate-fade-in stagger-2 -mt-2 mb-6">
          <p className="font-display text-2xl font-bold text-white/90">
            Página no encontrada
          </p>
        </div>

        <p className="animate-fade-in stagger-3 text-sm text-white/40 leading-relaxed max-w-sm mx-auto mb-10">
          Esta página se escapó más rápido que un truco de Loki.
          Puede que haya sido movida, renombrada o simplemente no exista.
        </p>

        {/* CTA */}
        <div className="animate-fade-in stagger-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 h-12 px-8 text-sm font-bold rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
          >
            <ArrowLeft size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Volver al inicio
          </Link>
        </div>

        {/* Status code easter egg */}
        <p className="animate-fade-in stagger-5 mt-12 text-[10px] text-white/10 font-mono tracking-widest uppercase select-none">
          Error 404 · Not Found
        </p>
      </div>
    </div>
  )
}
