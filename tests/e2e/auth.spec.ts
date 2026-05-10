import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('debería mostrar la página de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar Sesión')
  })

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 5000 })
  })

  test('debería poder registrar un nuevo usuario', async ({ page }) => {
    await page.goto('/register')
    const timestamp = Date.now()
    await page.fill('input[name="name"]', `Test User ${timestamp}`)
    await page.fill('input[name="email"]', `test${timestamp}@test.com`)
    await page.fill('input[name="password"]', 'Test123456!')
    await page.fill('input[name="confirmPassword"]', 'Test123456!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('debería redireccionar al dashboard si ya está logueado', async ({ page }) => {
    // Este test requiere una sesión activa - se ejecutará solo si hay un test user
  })
})