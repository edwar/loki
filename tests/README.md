# Testing

## Setup

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Running Tests

### Development Mode
```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI (headed)
pnpm exec playwright test --headed

# Run specific test file
pnpm exec playwright test tests/e2e/auth.spec.ts
```

### CI Mode
```bash
# Run with CI defaults (retry failed tests, single worker)
CI=true pnpm test:e2e
```

## Test Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts          # Authentication tests
│   ├── dashboard.spec.ts      # Dashboard tests
│   ├── suppliers.spec.ts     # Supplier CRUD tests
│   ├── customers.spec.ts     # Customer CRUD tests
│   ├── sales.spec.ts         # Sales tests
│   ├── products.spec.ts      # Product tests
│   └── setup.spec.ts         # Test authentication setup
├── .auth/                    # Auth state (gitignored)
└── .gitignore
```

## Environment Variables

Create `.env.test` for test-specific environment:

```env
TEST_EMAIL=admin@test.com
TEST_PASSWORD=Admin123!
DATABASE_URL=postgresql://...
```

## Adding New Tests

1. Create test file in `tests/e2e/`
2. Use `test.describe` to group related tests
3. Add `beforeEach` for common setup
4. Use descriptive test names in Spanish
5. Add assertions with proper timeouts

## CI Pipeline

El pipeline de CI (`.github/workflows/ci.yml`) ejecuta automáticamente:
- **Lint** y **Type Check** en cada PR y push a main/develop

> **Nota**: Los tests E2E requieren una base de datos local (PostgreSQL) y no están incluidos en CI. Para ejecutarlos localmente, sigue las instrucciones de Environment Variables arriba.