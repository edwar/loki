# Plan de Desarrollo - Loki: Plataforma de Administración de Negocios

## 1. Resumen Ejecutivo

Loki es una plataforma integral de gestión empresarial que automatiza el registro de compras, controla gastos, inventario, proveedores y clientes, genera reportes PDF, con un panel administrativo visual. El sistema implementa soft delete para todas las eliminaciones y está diseñado para funcionar de manera responsive en cualquier dispositivo.

### Estado Actual: 🟢 Producción

El proyecto se encuentra en fase de producción activa. Los módulos core CRUD, dashboard con gráficos, sistema de producción/recetas, autenticación, auditoría, PWA offline y reportes PDF están completamente implementados.

---

## 2. Stack Tecnológico Recomendado

### Frontend
- **Framework**: Next.js 16 (App Router) - ya instalado
- **UI**: Tailwind CSS 4 - ya instalado
- **Componentes**: Shadcn/ui (basado en Radix UI) para accesibilidad
- **Gráficos**: Recharts o Tremor ( dashboards)
- **Formularios**: React Hook Form + Zod (validación)
- **Estado**: Zustand o TanStack Query (server state)

### Backend
- **API**: Next.js API Routes (Server Actions)
- **Auth**: NextAuth.js
- **Base de datos**: Neon (PostgreSQL) - como solicitaste

### IA y Procesamiento
- **OCR**: Tesseract.js (gratuito, local)
- ~~**IA para receipts**~~: Removido — modelos gratuitos poco confiables. Registro manual en su lugar.

### Utilities
- **Fechas**: date-fns
- **Moneda**: Intl.NumberFormat
- **Upload**: UploadThing o AWS S3 (para archivos)

---

## 3. Arquitectura de Base de Datos (Neon)

### Tablas Principales

```sql
-- Proveedores (suppliers)
suppliers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
)

-- Clientes (customers)
customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  total_purchases DECIMAL(12,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Insumos/Productos (supplies)
supplies (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  sku VARCHAR(100),
  category VARCHAR(100),
  unit VARCHAR(50), -- kg, unidad, litro, etc.
  current_stock DECIMAL(10,2),
  min_stock DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Inmuebles/Activos (properties)
properties (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- terreno, edificio, vehículo, equipo
  address TEXT,
  purchase_value DECIMAL(12,2),
  current_value DECIMAL(12,2),
  purchase_date DATE,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Compras de Insumos (purchase_orders)
purchase_orders (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  total_amount DECIMAL(12,2),
  status VARCHAR(50), -- pending, completed, cancelled
  attachment_url TEXT, -- PDF/imagen del receipt
  ai_extracted_data JSONB, -- datos extraídos por IA
  purchase_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Detalle de compras (purchase_items)
purchase_items (
  id UUID PRIMARY KEY,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  supply_id UUID REFERENCES supplies(id),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(12,2),
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Gastos Indirectos (indirect_costs)
indirect_costs (
  id UUID PRIMARY KEY,
  type VARCHAR(50), -- transporte, nómina, servicios, mantenimiento
  amount DECIMAL(12,2),
  description TEXT,
  date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Ventas Diarias (daily_sales)
daily_sales (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  total_amount DECIMAL(12,2),
  items JSONB, -- [{supply_id, quantity, price}]
  date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Productos/Recetas (products)
products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100), -- empanadas, panes, repostería
  sale_price DECIMAL(10,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Relación Producto-Insumo (recipe_items)
recipe_items (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  supply_id UUID REFERENCES supplies(id),
  quantity_required DECIMAL(10,2), -- cantidad de insumo por 1 unidad del producto
  unit VARCHAR(50), -- g, ml, unidades
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Usuarios (users) - para auth
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50), -- admin, manager, employee
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
)
```

---

## 4. Módulos del Sistema

### 4.1 Módulo de Inventario (Abastecimiento + Insumos unificado) ✅

**Funcionalidad**: Una sola vista (`/inventario`) que combina el registro de compras con la gestión del inventario de insumos.

**Vista Unificada**:
- **Panel izquierdo**: Formulario para registrar una compra (proveedor, fecha, items con cantidad, unidad, precio, descuento, IVA)
- **Panel derecho**: Tabla de inventario con todos los insumos, stock actual, mínimo, alertas de stock bajo
- **Flujo natural**: Registra compra → los insumos se agregan automáticamente → ves el resultado actualizado

**Unificación**: Siguiendo el principio "menos complejidad es más útil", las antiguas vistas separadas de "Abastecimiento" e "Insumos" fueron fusionadas en una sola.

### 4.2 Módulo de Gastos Indirectos ✅

**Categorías predefinidas**:
- Transporte / Flete
- Nómina / Pagos a empleados
- Servicios (luz, agua, internet)
- Mantenimiento
- Impuestos
- Otros

**CRUD completo**: Crear, leer, actualizar, eliminar (soft) gastos.

### 4.3 Módulo de Ventas Diarias ✅

- Registro de ventas por fecha
- Asociación opcional con cliente
- Desglose de productos vendidos
- Cálculo automático de totales

### 4.4 Módulo de Proveedores ✅

- CRUD completo
- Historial de compras por proveedor
- Contacto rápido (teléfono, email)
- Evaluación de proveedores (rating)

### 4.5 Módulo de Clientes ✅

- CRUD completo
- Historial de compras
- Total de compras acumuladas
- Datos de contacto

### 4.6 Módulo de Producción y Recetario (Core) ✅

Este módulo es el corazón del control de inventario y opera bajo una lógica estricta de transformación de materia prima a producto final:

**1. Insumos (Materia Prima)**: 
- Se adquieren mediante compras y representan el inventario base.
- Tienen stock actual, stock mínimo y control de costos.

**2. Productos y Recetas (Rendimiento Teórico)**: 
- Cada producto final tiene asociada una "fórmula" o receta.
- La receta establece exactamente qué cantidad de cada insumo se consume para obtener una cantidad *esperada* de producto final (Rendimiento o Yield).
- Ejemplo: 500g de Harina + 200g de Carne = *Rendimiento teórico de 50 Empanadas*.

**3. Proceso de Producción (Acción "Producir")**:
- Al hacer clic en "Producir", el sistema calcula los insumos a descontar basándose estrictamente en la receta.
- Se abre una interfaz (Modal) de confirmación donde el usuario ve el resumen de la operación.
- **Ajuste de Producción Real**: El sistema sugiere ingresar el rendimiento teórico al inventario, pero el usuario **puede editar este valor** (ej. salieron 48 en lugar de 50, o salieron 52).
- Al confirmar, el sistema descuenta los insumos exactos dictados por la receta y suma al inventario la cantidad *real* de productos finales declarada por el usuario.

**4. Inventario de Venta**:
- Los productos finales generados en el paso anterior son los únicos disponibles para la venta.
- Las ventas descuentan de este inventario terminado, manteniendo una separación clara entre "Lo que compro" (insumos) y "Lo que vendo" (producto final).

**Inmuebles/Activos (Bienes)** ✅:
- CRUD completo de bienes/propiedades
- Valor actual vs valor de compra
- Depreciación configurable
- Mantenimiento de activos

### 4.7 Panel de Administración (Dashboard) ✅

**Gráficos**:
- Ventas del mes (gráfico de área)
- Gastos por categoría (gráfico de dona)
- Evolución de inventario
- Top proveedores por volumen
- Comparación temporal de ingresos/gastos

**Tablas y KPIs**:
- Compras recientes
- Últimas ventas
- Gastos del día/mes
- Stock bajo mínimo
- Actividad reciente
- Alertas de reposición
- Filtros por período (7d, 30d, 90d, año, todo)

### 4.8 Módulos Adicionales Implementados ✅

- **Gestión de Equipo/Usuarios**: CRUD de usuarios con roles, protección contra eliminación del último admin.
- **Log de Auditoría**: Registro automático de todas las acciones de usuarios.
- **Guía de Uso**: Página `/guia` con instrucciones del sistema.

---

## 5. Fases de Desarrollo

### Fase 1: Fundamentos (Semana 1-2)
- [x] Configurar Neon y conectar con el proyecto
- [x] Crear schema de base de datos completo
- [x] Configurar autenticación (NextAuth)
- [x] Setup de UI base (layout, navegación, theme)
- [x] Rutas base del dashboard

### Fase 2: Módulos Core CRUD (Semana 3-4)
- [x] CRUD Proveedores
- [x] CRUD Clientes
- [x] CRUD Insumos/Inventario
- [x] CRUD Inmuebles/Activos
- [x] CRUD Gastos Indirectos
- [x] CRUD Ventas Diarias

### Fase 3: Compras (Semana 5-6)
- [x] Registro manual de compras con formulario completo
- [x] Búsqueda/creación de proveedores integrada
- [x] Cálculo de totales con descuento e impuesto
- [x] Completar registro de compra
- [x] Actualizar inventario automáticamente

### Fase 4: Dashboard y Visualización (Semana 7-8)
- [x] Gráficos con Recharts
- [x] Tablas con datos agregados
- [x] KPIs principales
- [x] Filtros por fecha

### Fase 5: Responsive y Polish (Semana 9)
- [x] Optimizar UI para móvil (Tailwind responsive)
- [x] Mejoras de UX/UI (theme toggle, sidebar, modales)
- [x] Documentación

---

## 6. Detalles Técnicos Importantes

### Soft Delete
En todas las tablas, el campo `deleted_at` es NULL por defecto. Para "eliminar":
```typescript
// En queries, siempre filtrar:
WHERE deleted_at IS NULL

// Para eliminar:
UPDATE table SET deleted_at = NOW() WHERE id = ?
```

### API Routes y Server Actions
Usar Server Actions de Next.js paramutaciones:
```typescript
'use server'
async function createSupplier(formData: FormData) {
  // validar con Zod
  // insertar en Neon
  // revalidatePath
}
```

### Tipos TypeScript
Crear archivo `types/index.ts` con todas las interfaces que reflejen las tablas de la base de datos.

---

## 7. Estructura de Archivos

```
app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── guia/page.tsx
├── (protected)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── reportes/page.tsx ← PDF reports
│   ├── inventario/page.tsx ← Unificado (compras + insumos)
│   ├── produccion/page.tsx
│   ├── productos/page.tsx
│   ├── ventas/page.tsx
│   ├── gastos/page.tsx
│   ├── proveedores/page.tsx
│   ├── clientes/page.tsx
│   ├── bienes/page.tsx
│   ├── equipo/page.tsx
│   └── auditoria/page.tsx
├── api/
│   ├── auth/
│   ├── reports/
│   └── ...
├── lib/
│   ├── actions/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── offline-sync.ts
│   └── utils.ts
└── components/
    ├── ui/
    ├── reports/
    └── dashboard/
```

**Flujo del sidebar (orden operativo):**
1. Dashboard
2. Reportes (PDF)
3. Inventario (compras + insumos unificados)
4. Producción
5. Productos
6. Ventas
7. Gastos
8. Proveedores
9. Clientes
10. Bienes
11. Equipo
12. Auditoría

---

## 8. Sugerencias Adicionales de Features

A continuación propongo features adicionales que podrían agregar valor al proyecto. Evalúa cuáles te interesan para afinar el plan:

### 8.1 Funcionalidades Avanzadas

- [x] **Alertas de stock**: Notificaciones automáticas cuando el inventario caiga por debajo del mínimo (auditoría + dashboard alerts).
- [x] **Exportación a Excel/CSV**: Exportar cualquier tabla a formato Excel para análisis externo (`xlsx` library).
- [x] **Categorías personalizadas**: Insumos, productos y gastos tienen categorías configurables.

- [x] **Reportes PDF**: Generación de reportes mensuales/trimestrales en PDF para exportar: estado de resultados, inventario, historial de compras.

### 8.2 Otras Features (Pendientes de Evaluar)

- [ ] **Multi-moneda**: Soporte para registrar precios en diferentes monedas. (Baja prioridad - útil solo si hay operaciones internacionales)

---

## 9. Estado Final

✅ **Core completo**: CRUDs + Dashboard + Producción + Reportes  
✅ **UI/UX estandarizado**: Pattern CTA con modales  
✅ **Offline support**: PWA con sync  
✅ **Documentación**: Guía de uso en `/guia` + tests/README.md  
✅ **Testing**: Playwright E2E + GitHub Actions CI (lint + typecheck)  
✅ **SEO**: Implementado - metadata, sitemap, robots.txt, schema markup

## 10. Testing y Calidad

### Testing E2E con Playwright

- [x] Configuración de Playwright (`playwright.config.ts`)
- [x] Tests de autenticación (login, registro, errores)
- [x] Tests de dashboard (stats, gráficos, filtros)
- [x] Tests de CRUD proveedores
- [x] Tests de CRUD clientes
- [x] Tests de ventas
- [x] Tests de productos

### CI/CD con GitHub Actions

- [x] Workflow de CI con lint y typecheck
- [x] Tests E2E listos (requieren base de datos local)

### Documentación

- [x] Guía de usuario completa (`/guia`)
- [x] README.md actualizado
- [x] Documentación de tests (`tests/README.md`)
- [x] Reglas de desarrollo en `AGENTS.md`

### Scripts Disponibles

```bash
pnpm test:e2e          # Ejecutar tests E2E (requiere DATABASE_URL)
pnpm run typecheck     # Verificar tipos
pnpm run lint          # Lint del código
```

---

## 11. Mejoras y Nuevos Módulos Propuestos

### 11.1 SEO ✅ Implementado

El SEO fue identificado como pendiente en la sección 9. Ya implementado:

- [x] Metadata dinámica para todas las páginas (title, description, open graph)
- [x] sitemap.xml automático (solo rutas públicas)
- [x] robots.txt (bloquea rutas protegidas)
- [x] Schema markup WebApplication JSON-LD en layout raíz
- [x] Font optimization con next/font (Inter + Outfit)
- [x] Favicon y OG image configurados

### 11.2 Módulos de Alto Valor (Nuevos)

#### A. Sistema de Facturación ✅ Implementado

- [x] **Generación de facturas formales** con folio secuencial (FAC-0001)
- [x] Datos fiscales del negocio (nombre, TIN, dirección, teléfono)
- [x] Exportación PDF de facturas
- [x] Estados de factura (borrador, emitida, pagada, cancelada)
- [x] Integración con clientes (datos fiscales)
- [x] Configuración de tasa de IVA

**Impacto**: Alto — Necesario para operaciones formales con clientes que requieren comprobantes.

#### B. Presupuestos y Cotizaciones

- [ ] Crear presupuestos desde productos disponibles
- [ ] Descuentos y validez del presupuesto
- [ ] Envío por WhatsApp o email
- [ ] Convertir presupuesto a venta confirmada
- [ ] Historial de presupuestos por cliente

**Impacto**: Alto — Facilita la venta B2B y pedidos grandes.

#### C. Métricas de Rentabilidad ✅ Implementado

- [x] **Costo por producto** (calculado desde recetas)
- [x] **Margen de ganancia** por producto (precio venta - costo)
- [x] **Rentabilidad por categoría** de productos
- [x] Dashboard de margen de ganancia (`/rentabilidad`)
- [x] Alertas cuando el margen baje de umbral configurable

**Impacto**: Medio — Permite identificar productos más rentables.

#### D. Control de Lotes y Vencimiento

- [ ] Asignar número de lote a compras de insumos
- [ ] Fecha de vencimiento por lote
- [ ] Alertas de productos próximos a vencer
- [ ] Reporte de inventario por lote
- [ ] Trazabilidad de lote en producción

**Impacto**: Medio — Esencial para productos perecederos (panadería, repostería).

#### E. Sistema de Alertas Automáticas ✅ Implementado

- [x] Notificaciones en dashboard de stock bajo
- [ ] Alertas de insumos próximos a vencer
- [x] Notificaciones de gastos elevados (superan umbral del 200% del promedio)
- [ ] Resumen semanal por email (opcional)
- [x] Centro de notificaciones en la UI (dropdown en sidebar)

**Impacto**: Medio — Mejora la operación diaria.

### 11.3 Mejoras de UX/UI

#### A. Dashboard de Métricas Avanzadas

- [ ] KPIs adicionales: ticket promedio, productos más vendidos, clientes top
- [ ] Comparación período vs período anterior
- [ ] Gráfico de tendencias de inventario
- [ ] Indicador de rotación de inventario

#### B. Calendario de Producción

- [ ] Vista semanal/mensual de producción planificada
- [ ] Programar producción futura
- [ ] Capacidad de producción por día (límite de batches)
- [ ] Notificaciones de producción pendiente

**Impacto**: Bajo-Medio — Útil para panaderías con planificación.

#### C. Exportación Mejorada

- [ ] Exportar a Excel con formato profesional
- [ ] Exportar dashboard completo (gráficos + datos)
- [ ] Programar exportación automática mensual

### 11.4 Funcionalidades Operativas

#### A. Backup y Recuperación

- [ ] Exportar base de datos completa (JSON/SQL)
- [ ] Programar backup manual desde UI
- [ ] Restaurar desde backup

#### B. Multi-sucursal (Futuro)

- [ ] Estructura para múltiples ubicaciones
- [ ] Inventario por sucursal
- [ ] Reportes consolidados

**Nota**: Esta funcionalidad requiere cambios significativos en el schema.

### 11.5 Priorización Recomendada

| Prioridad | Módulo | Justificación |
|-----------|--------|----------------|
| 1 | SEO | ✅ Completado |
| 2 | Facturación | ✅ Completado |
| 3 | Métricas de Rentabilidad | ✅ Completado |
| 4 | Alertas Automáticas | ✅ Completado |
| 5 | Presupuestos | Facilita venta B2B |
| 6 | Control de Lotes | Solo si hay productos perecederos |

---

*Documento actualizado con propuestas de mejora.*