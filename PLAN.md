# [Proyecto] — Plan de Desarrollo

## 1. Resumen Ejecutivo

<!-- Breve descripción del proyecto, estado actual y objetivo principal -->

---

## 2. Principios de Diseño y Desarrollo

Estos principios definen cómo se construye el proyecto. Son transferibles a cualquier otro proyecto.

### 2.1 UX y Navegación

- **Vistas unificadas** antes que múltiples rutas. Si dos módulos comparten contexto (ej. insumos + compras), se fusionan en una sola vista con secciones claras.
- **Forms en modal (CTA Pattern)**: El botón de acción principal va en la esquina superior derecha y abre un modal centrado. Nada de acordeones ni formularios en columnas laterales.
- **Botón Cancelar en modales**: Siempre `variant="ghost"`. El botón de acción principal usa el estilo por defecto (primary).
- **Acciones siempre visibles**: Botones de editar/eliminar/ver en tablas nunca se ocultan con hover (`opacity-0 group-hover:opacity-100`).

### 2.2 UI y Visual

- **Skeleton Loading**: Cada ruta tiene su `loading.tsx` con un skeleton que **calca exactamente** la estructura visual de la página (grid cols, cards, columnas de tabla). Al modificar una página, se actualiza su loading.tsx para evitar CLS.
- **Staggered row animations**: Las filas de tablas aparecen con fade-in escalonado (`stagger-rows`).
- **View Transitions**: Transiciones suaves entre rutas usando `<ViewTransition>` de React + `experimental.viewTransition` en Next.js.
- **No "cajas dentro de cajas"**: Componentes con bordes propios (como `<Table>`) no se anidan dentro de `<Card>` con padding. Se usa `p-0` en el Card y se remueven bordes del hijo.
- **Bordes redondeados**: `rounded-lg` como estándar en contenedores, botones, inputs, modals. `rounded-xl`/`rounded-2xl` no se usan. `rounded-md`/`rounded-sm` solo en badges/chips.
- **Soft Delete**: Todas las eliminaciones son suaves (`deletedAt`). Nunca se eliminan registros físicamente.

### 2.3 Desarrollo

- **Menos complejidad es más útil**: Preferir lo simple sobre lo sofisticado. No crear abstracciones innecesarias.
- **Server Components por defecto**: Las páginas son server components que pasan datos serializados a client components cuando se necesita interactividad.
- **Server Actions para mutaciones**: Nunca API Routes para CRUD. Server Actions + `revalidatePath`.
- **Zod para validación**: Schemas en server actions y formularios.
- **Composición sobre configuración**: Componentes reutilizables y predecibles.

---

## 3. Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | Next.js 16 (App Router) | SSR, RSC, routing |
| UI | Tailwind CSS 4 + Shadcn/ui | Utility-first + componentes accesibles |
| Gráficos | Recharts | Dashboards y reportes visuales |
| Formularios | React Hook Form + Zod | Formularios performantes con validación |
| Estado global | Zustand | Estado del lado del cliente |
| Autenticación | NextAuth.js | Sesiones y roles |
| Base de datos | PostgreSQL + Prisma | ORM tipado y migraciones |
| Moneda/Fechas | Intl.\* + date-fns | Formateo local |
| Notificaciones | sileo | Toasts de feedback |
| Testing | Playwright + GitHub Actions | E2E + CI |
| PWA | Serwist | Offline support |

---

## 4. Arquitectura

### Convenciones generales

| Concepto | Estándar |
|----------|----------|
| IDs | UUID v4 |
| Timestamps | `createdAt`, `updatedAt`, `deletedAt` (soft delete) |
| Moneda base | COP (Peso Colombiano) |
| IVA por defecto | 19% |
| Soft delete | `deletedAt IS NULL` en todas las queries |

### Estructura del proyecto

```
app/
├── (public)/           → landing, login, register, guia
├── (protected)/        → dashboard y módulos (ver sección 5)
├── api/                → solo auth y webhooks
lib/
├── actions/            → server actions (una por módulo)
├── auth.ts
├── prisma.ts
└── utils.ts
components/
├── ui/                 → shadcn/ui components
└── [dominio]/          → componentes específicos (dashboard, reports, etc.)
prisma/
└── schema.prisma       → modelo de datos completo
```

### Patrón de página

```
page.tsx                → server component, fetch data + pasa props
*-client.tsx            → client component, interactividad
loading.tsx             → skeleton que calca la página
```

### Esquema de BD

Ver `prisma/schema.prisma` para el modelo completo.

---

## 5. Módulos del Sistema

| # | Módulo | Ruta | Tipo | Estado |
|---|--------|------|------|--------|
| 1 | Dashboard | `/dashboard` | Core | ✅ |
| 2 | Reportes PDF | `/reportes` | Core | ✅ |
| 3 | Inventario | `/inventario` | Core | ✅ |
| 4 | Producción | `/produccion` | Core | ✅ |
| 5 | Productos | `/productos` | Core | ✅ |
| 6 | Ventas | `/ventas` | Core | ✅ |
| 7 | Gastos | `/gastos` | Core | ✅ |
| 8 | Proveedores | `/proveedores` | Core | ✅ |
| 9 | Clientes | `/clientes` | Core | ✅ |
| 10 | Bienes/Activos | `/bienes` | Core | ✅ |
| 11 | Facturación | `/facturas` | Core | ✅ |
| 12 | Rentabilidad | `/rentabilidad` | Core | ✅ |
| 13 | Equipo/Usuarios | `/equipo` | Admin | ✅ |
| 14 | Auditoría | `/auditoria` | Admin | ✅ |
| 15 | Guía de uso | `/guia` | Pública | ✅ |
| 16 | Consumibles | `/consumibles` | Core | ✅ |
| 17 | Categorías | `/categorias` | Admin | ✅ |

### Funcionalidades transversales

- Soft delete, categorías configurables, exportación Excel/CSV
- PWA offline, SEO (metadata, sitemap, schema JSON-LD)
- Roles (admin, manager, employee), log de auditoría
- Alertas de stock bajo, centro de notificaciones
- Facturación con folio secuencial (FAC-XXXX) + PDF
- Skeleton loading en todas las rutas, staggered row animations
- View Transitions entre rutas

---

## 6. Patrones de UI

| Patrón | Implementación |
|--------|---------------|
| Modal CRUD | CTA button top-right → `<Modal>` centrado → form → ghost cancel + primary submit |
| Tabla con datos | `<Table>` con `<TableHeader>` + `<TableBody stagger-rows>` + sticky actions |
| Empty state | `<EmptyState>` con icono, mensaje y acción opcional |
| Stat cards | Grid responsiva con icono, valor y label |
| Skeleton | `loading.tsx` con `<Skeleton>` de `@/components/ui/skeleton`, anchos que calcan contenido real |
| Confirmación delete | `<ConfirmationModal variant="danger">` |
| Exportación | `<ExportButton>` con columnas configurables |

---

## 7. Próximos Pasos

<!-- Pendientes organizados por prioridad -->

### Alta prioridad

- [ ]

### Media prioridad

- [ ]

### Baja prioridad

- Alertas de insumos próximos a vencer
- Gráfico de tendencias de inventario
- Exportación a Excel con formato profesional
- Exportación programada mensual

---

*Documento generado con el template de plan de desarrollo — [Project Name]*
