# Loki - Plataforma de Administración de Negocios

Sistema integral de gestión empresarial con control de inventario, producción, ventas, proveedores, clientes, activos, gastos y reportes PDF.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Base de datos**: PostgreSQL (Neon)
- **Auth**: NextAuth.js
- **Testing**: Playwright E2E
- **Reportes**: @react-pdf/renderer

## Scripts

```bash
pnpm dev           # Desarrollo
pnpm build         # Build de producción
pnpm lint          # Lint del código
pnpm run typecheck # Verificar tipos
pnpm test:e2e      # Tests E2E (requiere DATABASE_URL)
```

## Configuración

1. Copiar `.env.example` a `.env` y configurar las variables
2. `pnpm install`
3. `pnpm exec prisma db push` (crear tablas)
4. `pnpm run dev`

## Documentación

- [Guía de Usuario](/guia) - Manual completo del sistema
- [Testing](/tests/README.md) - Documentación de tests E2E
- [PLAN.md](./PLAN.md) - Plan de desarrollo

## Licencia

MIT