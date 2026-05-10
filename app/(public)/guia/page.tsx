import Link from 'next/link'
import { Metadata } from 'next'
import {
  ChefHat, LayoutDashboard, TrendingUp, ShoppingBag, Factory,
  Package, Receipt, ShoppingCart, Truck, Users, Building2,
  Shield, ShieldAlert, BookOpen, Search,
  ArrowRight, Zap, MousePointer,
  Star, CheckCircle2
} from 'lucide-react'
import { GuiaHeader } from '@/components/guia-header'

export const metadata: Metadata = {
  title: 'Guía de Uso',
  description: 'Manual completo de Loki. Aprende a usar el sistema de gestión empresarial: dashboard, ventas, inventario, producción, reportes y más.',
  openGraph: {
    title: 'Guía de Uso - Loki',
    description: 'Manual completo de Loki para emprendedores. Aprende a usar dashboard, ventas, inventario, producción, reportes y más.',
    url: '/guia',
  },
}

const modules = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    name: 'Dashboard',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    roles: ['admin', 'gerente', 'empleado'],
    summary: 'Centro de mando con métricas en tiempo real.',
    steps: [
      'Al iniciar sesión aterrizas automáticamente en el Dashboard.',
      'Usa el filtro de rango (7d / 30d / 90d / Año / Histórico) para cambiar el período de análisis.',
      'Las tarjetas superiores muestran Ventas, Inversión, Stock Crítico y Catálogo Activo.',
      'El gráfico de líneas muestra la evolución diaria de ventas en el período seleccionado.',
      'El gráfico de torta desglosa los gastos por categoría.',
      'Si hay insumos bajo el mínimo aparece el panel de "Reposición" con acceso directo al inventario.',
    ],
    tips: ['El porcentaje verde/rojo compara las ventas de hoy vs. ayer.', 'Haz clic en "Ver Todo" para ir directamente al historial de ventas.'],
  },
  {
    id: 'ventas',
    icon: TrendingUp,
    name: 'Ventas',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    roles: ['admin', 'gerente', 'empleado'],
    summary: 'Registra ventas, asigna clientes y consulta el historial.',
    steps: [
      'Ve a Ventas desde el menú lateral.',
      'En el panel izquierdo selecciona uno o más productos del catálogo.',
      'Ajusta la cantidad con los controles + / − o escribiendo directamente.',
      'Opcionalmente asigna la venta a un cliente registrado.',
      'Haz clic en "Registrar Venta" — el stock del producto final se descuenta automáticamente.',
      'El historial de la derecha muestra todas las ventas con opción de Editar o Eliminar.',
      'Usa el botón "Exportar" para descargar el historial en CSV.',
    ],
    tips: ['Si no hay productos creados, el sistema te indicará que primero debes crearlos en el Catálogo.', 'Puedes editar una venta ya registrada sin borrarla.'],
  },
  {
    id: 'productos',
    icon: ShoppingBag,
    name: 'Productos',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    roles: ['admin', 'gerente', 'empleado'],
    summary: 'Catálogo de productos con recetas y control de stock.',
    steps: [
      'Ve a Productos desde el menú lateral.',
      'Haz clic en "Nuevo Producto" para abrir el formulario.',
      'Define nombre, categoría, precio de venta y rendimiento por lote.',
      'En la sección Receta añade los insumos que consume cada unidad de este producto.',
      'Guarda el producto — aparecerá en el catálogo de ventas.',
      'Puedes activar o desactivar productos sin eliminarlos.',
    ],
    tips: ['El "Rendimiento" define cuántas unidades se obtienen por lote de producción.', 'Los insumos de la receta se descuentan automáticamente al registrar una venta.'],
  },
  {
    id: 'produccion',
    icon: Factory,
    name: 'Producción',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    roles: ['admin', 'gerente', 'empleado'],
    summary: 'Registra lotes de producción y controla el rendimiento real.',
    steps: [
      'Ve a Producción desde el menú lateral.',
      'Selecciona el producto que vas a producir.',
      'Indica el número de lotes y el rendimiento real obtenido.',
      'El sistema calcula automáticamente los insumos consumidos, reduce su stock y aumenta el stock del producto final.',
      'Consulta el historial de producciones para analizar eficiencia.',
    ],
    tips: ['Compara el rendimiento esperado vs. real para detectar pérdidas en el proceso.'],
  },
  {
    id: 'insumos',
    icon: Package,
    name: 'Insumos',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    roles: ['admin', 'gerente'],
    summary: 'Inventario de materias primas con alertas de reabastecimiento.',
    steps: [
      'Ve a Insumos desde el menú lateral.',
      'Haz clic en "Nuevo Insumo" para registrar una materia prima.',
      'Define nombre, SKU, unidad de medida, stock actual y stock mínimo.',
      'Asocia un proveedor al insumo para facilitar las compras.',
      'El badge rojo en el menú indica cuántos insumos están bajo el mínimo.',
      'Usa el botón de ajuste de stock para corregir inventario manualmente.',
    ],
    tips: ['El stock mínimo dispara la alerta de reposición visible en el Dashboard.', 'El stock de insumos solo baja cuando registras un lote de producción, y solo sube cuando registras una compra de insumos.'],
  },
  {
    id: 'gastos',
    icon: Receipt,
    name: 'Gastos',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    roles: ['admin', 'gerente'],
    summary: 'Registro de costos indirectos categorizados.',
    steps: [
      'Ve a Gastos desde el menú lateral.',
      'Haz clic en "Nuevo Gasto" para registrar un egreso.',
      'Selecciona o escribe la categoría (arriendo, servicios, nómina, etc.).',
      'Ingresa el monto, fecha y una descripción opcional.',
      'Los gastos aparecen en el gráfico de torta del Dashboard agrupados por categoría.',
      'Exporta el listado a CSV para tu contabilidad.',
    ],
    tips: ['Usa categorías consistentes para que las gráficas sean comparables entre períodos.'],
  },
  {
    id: 'compras',
    icon: ShoppingCart,
    name: 'Compras',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    roles: ['admin', 'gerente'],
    summary: 'Órdenes de compra a proveedores con ajuste automático de inventario.',
    steps: [
      'Ve a Compras desde el menú lateral.',
      'Haz clic en "Nueva Compra" para iniciar una orden.',
      'Selecciona el proveedor y completa los pasos del formulario.',
      'Agrega los insumos comprados con cantidad, unidad y precio unitario.',
      'Define descuentos e impuestos si aplica.',
      'Al confirmar la compra, el stock de los insumos se incrementa automáticamente.',
      'Puedes adjuntar la factura digital al registro de la compra.',
    ],
    tips: ['El sistema calcula subtotales, descuentos y totales en tiempo real mientras agregas ítems.'],
  },
  {
    id: 'proveedores',
    icon: Truck,
    name: 'Proveedores',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    roles: ['admin', 'gerente'],
    summary: 'Directorio de proveedores con historial de compras.',
    steps: [
      'Ve a Proveedores desde el menú lateral.',
      'Haz clic en "Nuevo Proveedor" para crear un contacto.',
      'Ingresa nombre, correo, teléfono y dirección.',
      'Los proveedores quedan disponibles para asociar a insumos y órdenes de compra.',
    ],
    tips: ['Un proveedor bien configurado permite agilizar el llenado de las órdenes de compra.'],
  },
  {
    id: 'clientes',
    icon: Users,
    name: 'Clientes',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    roles: ['admin', 'gerente', 'empleado'],
    summary: 'Base de datos de clientes con historial de compras.',
    steps: [
      'Ve a Clientes desde el menú lateral.',
      'Haz clic en "Nuevo Cliente" para registrar un cliente.',
      'Ingresa nombre, correo, teléfono y dirección.',
      'Al registrar ventas puedes asignarlas a un cliente para llevar su historial.',
      'Visualiza el total acumulado de compras por cliente.',
    ],
    tips: ['Asociar ventas a clientes te permite identificar a tus mejores compradores.'],
  },
  {
    id: 'bienes',
    icon: Building2,
    name: 'Bienes',
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    roles: ['admin'],
    summary: 'Registro del patrimonio físico del negocio.',
    steps: [
      'Ve a Bienes desde el menú lateral (solo admin).',
      'Haz clic en "Nuevo Bien" para registrar un activo.',
      'Define tipo, nombre, valor de compra, valor actual y fecha de adquisición.',
      'Puedes agregar una descripción y URL de imagen del activo.',
    ],
    tips: ['Registra equipos, vehículos, inmuebles y cualquier activo productivo del negocio.'],
  },
  {
    id: 'equipo',
    icon: Shield,
    name: 'Equipo',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    roles: ['admin'],
    summary: 'Gestión de usuarios y roles del sistema.',
    steps: [
      'Ve a Equipo desde el menú lateral (solo admin).',
      'Haz clic en "Nuevo Usuario" para invitar a un colaborador.',
      'Asigna un rol: Administrador, Gerente o Empleado.',
      'Cada rol tiene acceso diferente a los módulos del sistema.',
      'Puedes editar o desactivar usuarios sin eliminarlos.',
    ],
    tips: ['Empleado: solo Ventas, Productos, Producción y Clientes.', 'Gerente: todo excepto Bienes, Equipo y Auditoría.', 'Administrador: acceso completo a todos los módulos.'],
  },
  {
    id: 'auditoria',
    icon: ShieldAlert,
    name: 'Auditoría',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    roles: ['admin'],
    summary: 'Registro inmutable de todas las acciones críticas del sistema.',
    steps: [
      'Ve a Auditoría desde el menú lateral (solo admin).',
      'Consulta el historial de acciones: quién hizo qué y cuándo.',
      'Cada entrada incluye usuario, acción, entidad afectada, fecha y dirección IP.',
      'Exporta el log de auditoría para revisiones de cumplimiento.',
    ],
    tips: ['El log de auditoría no puede ser modificado por ningún usuario, incluyendo el administrador.'],
  },
]

const roles = [
  { name: 'Empleado', color: 'bg-blue-500/10 text-blue-600', modules: ['Dashboard', 'Ventas', 'Productos', 'Producción', 'Clientes'] },
  { name: 'Gerente', color: 'bg-amber-500/10 text-amber-600', modules: ['Dashboard', 'Ventas', 'Productos', 'Producción', 'Insumos', 'Gastos', 'Compras', 'Proveedores', 'Clientes'] },
  { name: 'Administrador', color: 'bg-indigo-500/10 text-indigo-600', modules: ['Todos los módulos + Bienes, Equipo, Auditoría'] },
]

export default function GuiaPage() {
  const faqs = [
    {
      q: '¿Cómo funciona el stock automático?',
      a: 'Cuando registras una venta, Loki descuenta el stock del producto final vendido. El stock de insumos solo baja al registrar un lote de producción (que los consume), y solo sube al registrar una compra de insumos.'
    },
    {
      q: '¿Puedo trabajar sin internet?',
      a: 'Sí, Loki es una PWA con soporte offline. Las ventas se guardan localmente y se sincronizan automáticamente cuando vuelve la conexión.'
    },
    {
      q: '¿Cómo agrego un nuevo integrante al equipo?',
      a: 'Solo el Administrador puede crear usuarios. Ve a Equipo → Nuevo Usuario, define su rol y sus credenciales de acceso.'
    },
    {
      q: '¿Cómo exporto la información?',
      a: 'Todos los módulos con tablas tienen un botón "Exportar" que descarga los datos en formato CSV para Excel o Google Sheets.'
    },
    {
      q: '¿Qué es el Log de Auditoría?',
      a: 'Es un registro inmutable de todas las acciones críticas: quién creó, editó o eliminó qué y cuándo. Solo el Administrador puede consultarlo.'
    },
    {
      q: '¿Puedo cambiar mi contraseña?',
      a: 'Sí, desde el perfil de usuario. Si olvidaste tu contraseña, el administrador del sistema puede restablecerla desde el módulo de Equipo.'
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq, i) => ({
              "@type": "Question",
              "position": i + 1,
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <GuiaHeader />

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-sm font-medium text-primary">
            <BookOpen size={14} />
            Documentación Oficial · v2.0.4
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Guía de Uso
            <span className="block bg-linear-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Loki Business Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Todo lo que necesitas saber para gestionar tu negocio con Loki.
            Desde el primer inicio de sesión hasta la auditoría avanzada.
          </p>
          {/* Quick jump */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {modules.map(m => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${m.border} ${m.bg} ${m.color} hover:opacity-80 transition-opacity`}
              >
                <m.icon size={12} />
                {m.name}
              </a>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield size={16} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Roles y Permisos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map(role => (
              <div key={role.name} className="p-6 rounded-lg border border-border/50 bg-card/50 space-y-4">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${role.color}`}>
                  {role.name}
                </span>
                <ul className="space-y-2">
                  {role.modules.map(m => (
                    <li key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Módulos del Sistema</h2>
          </div>

          <div className="space-y-8">
            {modules.map((mod) => (
              <div
                key={mod.id}
                id={mod.id}
                className="scroll-mt-24 rounded-lg border border-border/50 bg-card/40 overflow-hidden"
              >
                {/* Module header */}
                <div className={`flex items-center gap-4 p-6 border-b border-border/30 ${mod.bg}`}>
                  <div className={`w-12 h-12 rounded-lg bg-background/60 flex items-center justify-center border ${mod.border}`}>
                    <mod.icon size={22} className={mod.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{mod.name}</h3>
                      <div className="flex gap-1">
                        {mod.roles.map(r => (
                          <span key={r} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border/50">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{mod.summary}</p>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-8">
                  {/* Steps */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <MousePointer size={11} /> Paso a paso
                    </p>
                    <ol className="space-y-2">
                      {mod.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${mod.bg} ${mod.color} mt-0.5`}>
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {mod.tips.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Star size={11} /> Consejos
                      </p>
                      <ul className="space-y-2">
                        {mod.tips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <Zap size={13} className={`${mod.color} shrink-0 mt-1`} />
                            <span className="text-muted-foreground leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search size={16} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Preguntas Frecuentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-lg border border-border/50 bg-card/40 space-y-2">
                <p className="font-bold text-sm flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">?</span>
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg bg-primary p-10 md:p-14 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>
          <div className="relative space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight">¿Listo para empezar?</h2>
            <p className="text-primary-foreground/80">
              Inicia sesión en tu cuenta o contacta a tu administrador para obtener acceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white text-primary font-bold hover:bg-white/90 transition-colors"
              >
                Iniciar Sesión <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary-foreground/10 text-white font-bold hover:bg-primary-foreground/20 border border-white/20 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-accent/20 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat size={15} className="text-white" />
            </div>
            <span className="font-bold">Loki</span>
            <span className="text-xs text-muted-foreground">v2.0.4</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Loki Systems. Guía de usuario — Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
