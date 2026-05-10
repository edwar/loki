import { test as setup, expect } from '@playwright/test'

// Test de setup para autenticación
setup('autenticarse para tests', async ({ page }) => {
  // Ir a login
  await page.goto('/login')
  
  // Llenar credenciales de test
  const email = process.env.TEST_EMAIL || 'admin@test.com'
  const password = process.env.TEST_PASSWORD || 'Admin123!'
  
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Esperar a que redirccione al dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
  
  // Guardar estado de autenticación para otros tests
  await page.context().storageState({ path: 'tests/.auth/user.json' })
})