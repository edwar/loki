# Plan de Desarrollo - Loki: Plataforma de Administración de Negocios

## 1. Resumen Ejecutivo

Loki es una plataforma integral de gestión empresarial que automatiza el registro de compras mediante IA, controla gastos, inventario, proveedores y clientes, con un panel administrativo visual. El sistema implementa soft delete para todas las eliminaciones y está diseñado para funcionar de manera responsive en cualquier dispositivo.

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
- **OCR/Extracción de datos**: Google Gemini API (gratis hasta cierto límite) o Tesseract.js (gratuito, local)
- **Visión**: GPT-4 Vision o Claude Vision (para analizar receipts)

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

### 4.1 Módulo de Compras con IA

**Funcionalidad**: El usuario sube una foto/PDF de un receipt y la IA extrae automáticamente:
- Nombre del proveedor (o detecta si es nuevo)
- Lista de productos comprados
- Cantidades y precios
- Total de la compra
- Fecha

**Flujo**:
1. Usuario accede a "Nueva Compra"
2. Sube imagen/PDF del receipt
3. Sistema envía a IA (Google Gemini o similar)
4. IA devuelve datos estructurados en JSON
5. Usuario revisa/edita los datos extraídos
6. Sistema crea registro en `purchase_orders` y actualiza inventario

**UI**: Formulario con drag-and-drop para archivos, vista previa de la imagen, campos editables con los datos de la IA.

### 4.2 Módulo de Gastos Indirectos

**Categorías predefinidas**:
- Transporte / Flete
- Nómina / Pagos a empleados
- Servicios (luz, agua, internet)
- Mantenimiento
- Impuestos
- Otros

**CRUD completo**: Crear, leer, actualizar, eliminar (soft) gastos.

### 4.3 Módulo de Ventas Diarias

- Registro de ventas por fecha
- Asociación opcional con cliente
- Desglose de productos vendidos
- Cálculo automático de totales

### 4.4 Módulo de Proveedores

- CRUD completo
- Historial de compras por proveedor
- Contacto rápido (teléfono, email)
- Evaluación de proveedores (rating)

### 4.5 Módulo de Clientes

- CRUD completo
- Historial de compras
- Total de compras acumuladas
- Datos de contacto

### 4.6 Módulo de Productos/Recetas (MVP)

Este módulo es clave para tu negocio de empanadas y permite que el software sea genérico para otros negocios:

**Productos Finales** (ej: Empanada de Carne, Pan Francés):
- Nombre del producto
- Precio de venta
- Categoría (empanadas, panes, repostería, etc.)
- Imagen (opcional)
- **Receta**: Lista de insumos con cantidades requeridas

**Relación Producto-Insumo**:
```
Ejemplo: Empanada de Carne
├── Harina de trigo: 50g
├── Carne molida: 80g
├── Cebolla: 10g
├── Aceite: 5ml
└── Condimentos: 5g
```

**Flujo de Venta**:
1. Se registra una venta (ej: 10 empanadas de carne)
2. Sistema calcula: 10 × 50g = 500g harina, 10 × 80g = 800g carne, etc.
3. Se descuenta automáticamente del inventario
4. Alerta si no hay stock suficiente para la venta

**Insumos (Inventario)**:
- Lista de productos/materiales
- Stock actual vs stock mínimo
- Alertas de stock bajo
- Historial de movimientos
- Categorización

**Inmuebles/Activos**:
- Bienes de la empresa
- Valor actual vs valor de compra
- Depreciación (opcional)
- Mantenimiento de activos

### 4.7 Panel de Administración (Dashboard)

**Gráficos sugeridos**:
- Ventas del mes (gráfico de barras)
- Gastos por categoría (gráfico de dona)
- Evolución de inventario (línea)
- Top proveedores por volumen
- Comparación mensual de ingresos/gastos

**Tablas**:
- Compras recientes
- Últimas ventas
- Gastos del día/mes
- Stock bajo mínimo

---

## 5. Fases de Desarrollo

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Configurar Neon y conectar con el proyecto
- [ ] Crear schema de base de datos completo
- [ ] Configurar autenticación (NextAuth)
- [ ] Setup de UI base (layout, navegación, theme)
- [ ] Rutas base del dashboard

### Fase 2: Módulos Core CRUD (Semana 3-4)
- [ ] CRUD Proveedores
- [ ] CRUD Clientes
- [ ] CRUD Insumos/Inventario
- [ ] CRUD Inmuebles/Activos
- [ ] CRUD Gastos Indirectos
- [ ] CRUD Ventas Diarias

### Fase 3: Compras con IA (Semana 5-6)
- [ ] Integración con Google Gemini API o Tesseract
- [ ] Endpoint de procesamiento de imágenes
- [ ] UI de upload de receipts
- [ ] Extraer y parsear datos del receipt
- [ ] Completar registro de compra
- [ ] Actualizar inventario automáticamente

### Fase 4: Dashboard y Visualización (Semana 7-8)
- [ ] Gráficos con Recharts/Tremor
- [ ] Tablas con datos agregados
- [ ] KPIs principales
- [ ] Filtros por fecha

### Fase 5: Responsive y Polish (Semana 9)
- [ ] Optimizar UI para móvil
- [ ] Testing en diferentes dispositivos
- [ ] Mejoras de UX/UI
- [ ] Documentación

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

## 7. Estructura de Archivos Propuesta

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── compras/page.tsx
│   ├── gastos/page.tsx
│   ├── ventas/page.tsx
│   ├── inventario/page.tsx
│   ├── proveedores/page.tsx
│   ├── clientes/page.tsx
│   ├── activos/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── upload/route.ts
├── lib/
│   ├── db.ts (conexión Neon)
│   ├── actions/ (server actions)
│   └── utils.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   └── forms/
└── globals.css
```

---

## 8. Sugerencias Adicionales de Features

A continuación propongo features adicionales que podrían agregar valor al proyecto. Evalúa cuáles te interesan para afinar el plan:

### 8.1 Funcionalidades Avanzadas

- **Alertas de stock**: Notificaciones automáticas cuando el inventario caiga por debajo del mínimo, ya sea por email o dentro de la app.

- **Reportes PDF**: Generación de reportes mensuales/trimestrales en PDF para exportar: estado de resultados, inventario, historial de compras.

- **Exportación a Excel/CSV**: Exportar cualquier tabla a formato Excel para análisis externo.

- **Multi-moneda**: Soporte para registrar precios en diferentes monedas, con tipo de cambio configurable.

- **Categorías personalizadas**: El usuario puede crear sus propias categorías de gastos, productos, etc.

### 8.2 Mejoras en el Módulo de IA

- **Historial de extracción**: Guardar las imágenes procesadas junto con los datos extraídos para revisión posterior.

- **Validación de confianza**: Mostrar un % de certeza en los datos extraídos por la IA para que el usuario sepa qué verificar.

- **Templates por proveedor**: Si un proveedor emite receipts con formato similar, la IA aprende a reconocerlos mejor.

### 8.3 Funcionalidades de Negocio

- **Presupuestos**: Crear presupuestos para proyectos/obras que incluyan materiales, mano de obra y gastos indirectos.

- **Rentabilidad por producto**: Calcular cuánto ganas por cada insumo vendido considerando costo de compra + gastos indirectos asignados.

- **Cuentas por cobrar**: Seguimiento de ventas a crédito a clientes.

- **Facturación básica**: Generación de facturas simples en PDF.

### 8.4 UX/UI

- **Modo offline**: Progressive Web App (PWA) que permita registrar datos sin conexión y syncar después.

- **Tema oscuro**: Soporte para modo oscuro/claro.

- **Keyboard shortcuts**: Para power users (Ctrl+N para nueva compra, etc.).

- **Búsqueda global**: Search bar en el header que busque en todas las secciones.

### 8.5 Seguridad y Mantenimiento

- **Logs de auditoría**: Registrar quién hizo qué cambio y cuándo.

- **Roles granulares**: Permisos por usuario (admin vs empleado vs vendedor).

- **Backup automático**: Configurar backup diario en Neon.

- **Rate limiting**: Proteger endpoints de API de abuse.

### 8.6 Integraciones Futuras

- **WhatsApp Business**: Enviar facturas o alertas por WhatsApp.

---

## 9. Próximos Pasos

1. **Confirmar stack**: ¿Te sientes cómodo con Next.js + Neon + Tailwind? ¿Prefieres alguna otra librería?

2. **IA seleccionada**: ¿Tienes preferencia por Google Gemini, OpenAI Vision, o prefieres algo completamente gratuito (Tesseract)?

3. **Scope inicial**: ¿Comenzamos con el core (CRUDs + Dashboard) o quieres incluir el módulo de IA desde el inicio?

4. **Configurar Neon**: ¿Ya tienes una cuenta en Neon creada? ¿O necesitas ayuda para configurar la base de datos?

Cuéntame tu decisión sobre estos puntos y cualquier observación sobre el plan para afinarlo antes de comenzar el desarrollo.

---

*Documento generado para revisión y ajuste antes de iniciar desarrollo.*