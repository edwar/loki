import { test, expect } from '@playwright/test'

test.describe('Gestión de Proveedores', () => {
  const testSupplier = {
    name: `Proveedor Test ${Date.now()}`,
    email: `test${Date.now()}@supplier.com`,
    phone: '3001234567',
    address: 'Calle Test #123'
  }

  test('debería crear un nuevo proveedor', async ({ page }) => {
    await page.goto('/proveedores')
    
    // Click en botón Nuevo Proveedor
    await page.click('button:has-text("Nuevo Proveedor")')
    
    // Llenar formulario
    await page.fill('input[name="name"]', testSupplier.name)
    await page.fill('input[name="email"]', testSupplier.email)
    await page.fill('input[name="phone"]', testSupplier.phone)
    await page.fill('input[name="address"]', testSupplier.address)
    
    // Submit
    await page.click('button:has-text("Registrar Proveedor")')
    
    // Verificar que aparece en la tabla
    await expect(page.locator(`text=${testSupplier.name}`)).toBeVisible({ timeout: 5000 })
  })

  test('debería editar un proveedor existente', async ({ page }) => {
    await page.goto('/proveedores')
    
    // Click en botón editar del primer proveedor
    const editButton = page.locator('[aria-label="Editar"]').first()
    await editButton.click()
    
    // Modificar nombre
    await page.fill('input[name="name"]', `${testSupplier.name} - Editado`)
    
    // Submit
    await page.click('button:has-text("Actualizar")')
    
    // Verificar que aparece con el nuevo nombre
    await expect(page.locator(`text=${testSupplier.name} - Editado`)).toBeVisible()
  })

  test('debería eliminar un proveedor con confirmación', async ({ page }) => {
    await page.goto('/proveedores')
    
    // Click en botón eliminar
    const deleteButton = page.locator('[aria-label="Eliminar"]').first()
    await deleteButton.click()
    
    // Modal de confirmación debe aparecer
    await expect(page.locator('text=¿Estás seguro')).toBeVisible()
    
    // Confirmar eliminación
    await page.click('button:has-text("Eliminar Proveedor")')
    
    // Verificar que el modal se cerró
    await expect(page.locator('text=¿Estás seguro')).not.toBeVisible()
  })
})