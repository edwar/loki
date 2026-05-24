# Loki — Plan de Desarrollo

## 1. Resumen Ejecutivo

Sistema de gestión empresarial colombiano para panadería/pastelería. Control de inventario, producción, ventas, gastos, facturación, rentabilidad y más. Actualmente funcional en su totalidad con 17 módulos operativos. Se completó la migración completa a TanStack Query (4 fases) para cache predictivo, optimistic updates y eliminación de `router.refresh()`.

---

## 2. Principios de Diseño y Desarrollo

### 2.1 UX y Navegación

- **Vistas unificadas** antes que múltiples rutas. Si dos módulos comparten contexto (ej. insumos + compras), se fusionan en una sola vista con secciones claras.
- **Forms en modal (CTA Pattern)**: El botón de acción principal va en la esquina superior derecha y abre un modal centrado. Sin acordeones ni formularios en columnas laterales.
- **Botón Cancelar en modales**: Siempre `variant="ghost"`. El botón de acción principal usa el estilo por defecto (primary).
- **Acciones siempre visibles**: Botones de editar/eliminar/ver en tablas nunca se ocultan con hover.

### 2.2 UI y Visual

- **Skeleton Loading**: Cada ruta tiene su `loading.tsx` con un skeleton que calca exactamente la estructura visual de la página para evitar CLS.
- **Staggered row animations**: Filas de tablas aparecen con fade-in escalonado.
- **View Transitions**: Transiciones suaves entre rutas usando `<ViewTransition>` de React + `experimental.viewTransition` en Next.js.
- **No "cajas dentro de cajas"**: Componentes con bordes propios no se anidan dentro de `<Card>` con padding.
- **Bordes redondeados**: `rounded-lg` como estándar en todo.
- **Soft Delete**: Todas las eliminaciones son suaves (`deletedAt`).

### 2.3 Desarrollo

- **Server Components por defecto**: Páginas como server components que pasan datos serializados como `initialData` a `useQuery`.
- **Server Actions para mutaciones**: Nunca API Routes para CRUD. Las API routes existen solo como puente para `useQuery` del lado del cliente.
- **TanStack Query para cache cliente**: `useQuery` con `initialData` del SSR, `useMutation` con optimistic updates, `invalidateQueries` en vez de `router.refresh()`.
- **Zod para validación**: Schemas en server actions y formularios.

---

## 3. Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | Next.js 16 (App Router) | SSR, RSC, routing |
| UI | Tailwind CSS 4 + Shadcn/ui | Utility-first + componentes accesibles |
| Gráficos | Recharts | Dashboards y reportes visuales |
| Formularios | React Hook Form + Zod | Formularios performantes con validación |
| Estado cliente | TanStack Query | Cache, optimistic updates, refetch automático |
| Autenticación | NextAuth.js | Sesiones y roles |
| Base de datos | PostgreSQL + Prisma | ORM tipado y migraciones |
| Moneda/Fechas | Intl.\* + date-fns | Formateo local |
| Notificaciones | sonner | Toasts de feedback |
| PWA | Serwist | Offline support |

---

## 4. Arquitectura

### Convenciones generales

| Concepto | Estándar |
|----------|----------|
| IDs | UUID v4 |
| Timestamps | `createdAt`, `updatedAt`, `deletedAt` |
| Moneda base | COP (Peso Colombiano) |
| IVA por defecto | 19% |
| Soft delete | `deletedAt IS NULL` en todas las queries |

### Estructura del proyecto

```
app/
├── (public)/              → landing, login, register, guia
├── (protected)/           → dashboard y módulos
│   ├── [modulo]/
│   │   ├── page.tsx       → server component, fetch + mapea datos
│   │   ├── *-client.tsx   → client component con useQuery + useMutation
│   │   └── loading.tsx    → skeleton que calca la página
│   └── layout.tsx         → sidebar, session, QueryProvider wrapper
├── api/                   → solo para puente useQuery (no CRUD directo)
│   ├── alerts/
│   ├── customers/
│   ├── dashboard/
│   ├── expenses/
│   ├── sales/
│   ├── suppliers/
│   └── supplies/
lib/
├── actions/               → server actions (una por módulo)
├── providers/
│   └── query-provider.tsx → QueryClientProvider + ReactQueryDevtools
├── auth.ts
├── prisma.ts
└── utils.ts
components/
├── ui/                    → shadcn/ui components
└── [dominio]/             → específicos (dashboard, reports, etc.)
prisma/
└── schema.prisma          → modelo de datos completo
```

### Patrón de página con TanStack Query

```
page.tsx       → server component, fetch data, pasa props serializados
*-client.tsx   → useQuery(queryKey, fetch('/api/...'), { initialData })
                 useMutation(onMutate optimistic, onError rollback, onSettled invalidate)
loading.tsx    → skeleton que calca la página
```

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

- Soft delete + categorías configurables + exportación Excel/CSV
- PWA offline, SEO (metadata, sitemap, schema JSON-LD)
- Roles (admin, manager, employee), log de auditoría
- Alertas de stock bajo + centro de notificaciones
- Facturación con folio secuencial (FAC-XXXX) + PDF
- Skeleton loading + staggered rows + view transitions
- TanStack Query: cache predictivo + optimistic updates

---

## 6. Patrones de UI

| Patrón | Implementación |
|--------|---------------|
| Modal CRUD | CTA button top-right → `<Modal>` centrado → form → ghost cancel + primary submit |
| Tabla con datos | `<Table>` con sticky actions |
| Empty state | `<EmptyState>` con icono, mensaje y acción opcional |
| Stat cards | Grid responsiva con icono, valor y label |
| Skeleton | `loading.tsx` con `<Skeleton>`, anchos que calcan contenido real |
| Confirmación delete | `<ConfirmationModal variant="danger">` |
| Exportación | `<ExportButton>` con columnas configurables |
| Fetch cliente | `useQuery(key, fn, { initialData })` con SSR como punto de partida |
| Mutación optimista | `useMutation` con `onMutate` → cache patch, `onError` → rollback, `onSettled` → invalidate |

---

## 7. Migración a TanStack Query — Completada

Todas las fases de migración están implementadas y verificadas con build exitoso.

| Fase | Alcance | Estado |
|------|---------|--------|
| Setup | `@tanstack/react-query` + devtools, `QueryProvider`, layout wrapper | ✅ |
| Fase 1 — Dashboard | `DashboardClient` con `useQuery(['dashboard', range])`, filtros locales | ✅ |
| Fase 2 — Reportes | `SalesReport`, `ExpensesReport`, `InventoryReport` migrados a `useQuery` | ✅ |
| Fase 3 — Mutaciones | Delete optimista en Ventas, Gastos, Proveedores, Clientes, Inventario | ✅ |
| Fase 4 — Polish | Notificaciones (`refetchInterval`), `lowStockCount` (`staleTime: 5min`), categorías (`staleTime: Infinity`) | ✅ |

### Patrón implementado

```tsx
// page.tsx (server component)
const data = await getData()
return <ClientComponent data={data} />

// *-client.tsx
const { data } = useQuery({
  queryKey: ['entity'],
  queryFn: () => fetch('/api/entity').then(r => r.json()),
  initialData: props.data,
})

const deleteMutation = useMutation({
  mutationFn: (id) => deleteEntity(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['entity'] })
    const previous = queryClient.getQueryData(['entity'])
    queryClient.setQueryData(['entity'], (old) => old?.filter(e => e.id !== id))
    return { previous }
  },
  onError: (err, id, context) => queryClient.setQueryData(['entity'], context?.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['entity'] }),
})
```

---

## 8. Próximos pasos

- [ ] Dashboard ejecutivo con KPIs avanzados

---

*Documento actualizado al estado actual del proyecto Loki.*
