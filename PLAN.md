# Loki — Plan de Desarrollo

## 1. Resumen Ejecutivo

Plataforma integral de gestión empresarial colombiana que automatiza compras, gastos, inventario, producción, facturación y ventas. Sistema en **producción activa** con PWA offline, reportes PDF, dashboard con gráficos y autenticación por roles.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS 4 + Shadcn/ui (Radix UI) |
| Gráficos | Recharts |
| Formularios | React Hook Form + Zod |
| Estado | Zustand |
| Auth | NextAuth.js |
| BD | PostgreSQL (Neon) + Prisma |
| Fechas | date-fns |
| Moneda | Intl.NumberFormat (`es-CO`, COP) |
| Testing | Playwright E2E + GitHub Actions |

---

## 3. Módulos del Sistema

| # | Módulo | Ruta | Estado |
|---|--------|------|--------|
| 1 | Dashboard | `/dashboard` | ✅ |
| 2 | Reportes PDF | `/reportes` | ✅ |
| 3 | Inventario (compras + insumos) | `/inventario` | ✅ |
| 4 | Producción | `/produccion` | ✅ |
| 5 | Productos | `/productos` | ✅ |
| 6 | Ventas | `/ventas` | ✅ |
| 7 | Gastos | `/gastos` | ✅ |
| 8 | Proveedores | `/proveedores` | ✅ |
| 9 | Clientes | `/clientes` | ✅ |
| 10 | Bienes/Activos | `/bienes` | ✅ |
| 11 | Facturación | `/facturas` | ✅ |
| 12 | Rentabilidad | `/rentabilidad` | ✅ |
| 13 | Equipo/Usuarios | `/equipo` | ✅ |
| 14 | Auditoría | `/auditoria` | ✅ |
| 15 | Guía de uso | `/guia` | ✅ |
| 16 | Configuración del negocio | modal en facturas | ✅ |

### Funcionalidades transversales implementadas

- Soft delete en todas las entidades
- Categorías configurables por tipo
- Alertas de stock bajo en dashboard
- Centro de notificaciones (sidebar)
- Exportación a Excel/CSV (`xlsx`)
- PWA offline con Serwist
- SEO: metadata dinámica, sitemap, robots.txt, schema JSON-LD
- Log de auditoría automático
- Roles: admin, manager, employee
- Facturación con folio secuencial (FAC-XXXX) y PDF

---

## 4. Detalles Técnicos

### Convenciones

- **Soft delete**: `deletedAt` en todas las tablas; filtrar `WHERE deletedAt IS NULL`
- **Moneda base**: COP (Peso Colombiano)
- **IVA por defecto**: 19%
- **IDs**: UUID v4
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt`

### Estructura del proyecto

```
app/
├── (public)/       → login, register, guia
├── (protected)/    → dashboard, módulos (ver tabla)
├── api/            → auth, reports, business-settings
lib/
├── actions/        → server actions por módulo
├── auth.ts
├── prisma.ts
└── utils.ts
components/
├── ui/             → shadcn/ui components
├── reports/        → PDF generation
└── dashboard/      → charts, KPIs
```

### Schema de BD

Ver `prisma/schema.prisma` — 18 modelos: Category, Supplier, Customer, Supply, Product, RecipeItem, Property, PurchaseOrder, PurchaseItem, IndirectCost, DailySale, SaleItem, User, Session, ProductionLog, ProductionItem, AuditLog, BusinessSettings, Invoice, InvoiceItem, ConsumableUsage.

---

## 5. Próximos Pasos

### Pendientes (baja prioridad)

- Alertas de insumos próximos a vencer
- Resumen semanal por email
- Gráfico de tendencias de inventario
- Exportación a Excel con formato profesional
- Exportación programada mensual

### Priorización

| Prioridad | Módulo | Estado |
|-----------|--------|--------|
| 1 | SEO | ✅ |
| 2 | Facturación | ✅ |
| 3 | Rentabilidad | ✅ |
| 4 | Alertas Automáticas | ✅ |
| 5 | Dashboard Avanzado | ✅ |
| 6 | Exportación Mejorada | ⏳ Pendiente |

---

*Documento actualizado — Mayo 2026*
