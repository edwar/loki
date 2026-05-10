import { test, expect } from '@playwright/test'

test.describe('Gestión de Clientes', () => {
  const testCustomer = {
    name: `Cliente Test ${Date.now()}`,
    email: `test${Date.now()}@customer.com`,
    phone: '3009876543',
    address: 'Carrera Test #456'
  }

  test('debería crear un nuevo cliente', async ({ page }) => {
    await page.goto('/clientes')
    
    await page.click('button:has-text("Nuevo Cliente")')
    
    await page.fill('input[name="name"]', testCustomer.name)
    await page.fill('input[name="email"]', testCustomer.email)
    await page.fill('input[name="phone"]', testCustomer.phone)
    await page.fill('input[name="address"]', testCustomer.address)
    
    await page.click('button:has-text("Registrar Cliente")')
    
    await expect(page.locator(`text=${testCustomer.name}`)).toBeVisible({ timeout: 5000 })
  })

  test('debería editar un cliente existente', async ({ page }) => {
    await page.goto('/clientes')
    
    const editButton = page.locator('[aria-label="Editar"]').first()
    await editButton.click()
    
    await page.fill('input[name="name"]', `${testCustomer.name} - Editado`)
    
    await page.click('button:has-text("Actualizar")')
    
    await expect(page.locator(`text=${testCustomer.name} - Editado`)).toBeVisible()
  })

  test('debería eliminar un cliente con confirmación', async ({ page }) => {
    await page.goto('/clientes')
    
    const deleteButton = page.locator('[aria-label="Eliminar"]').first()
    await deleteButton.click()
    
    await expect(page.locator('text=¿Estás seguro')).toBeVisible()
    
    await page.click('button:has-text("Eliminar Cliente")')
    
    await expect(page.locator('text=¿Estás seguro')).not.toBeVisible()
  })
})