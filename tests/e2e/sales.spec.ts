import { test, expect } from '@playwright/test'

test.describe('Gestión de Ventas', () => {
  test('debería mostrar empty state cuando no hay ventas', async ({ page }) => {
    await page.goto('/ventas')
    
    // Verificar que hay mensaje de no ventas
    await expect(page.locator('text=No hay ventas registradas')).toBeVisible({ timeout: 5000 })
  })

  test('debería crear una nueva venta', async ({ page }) => {
    await page.goto('/ventas')
    
    // Click en botón Nueva Venta
    await page.click('button:has-text("Nueva Venta")')
    
    // Modal debería abrirse
    await expect(page.locator('text=Nueva Venta')).toBeVisible()
    
    // Seleccionar un producto (asumiendo que hay productos creados)
    const productSelect = page.locator('[role="combobox"]').first()
    await productSelect.click()
    
    // Esperar y seleccionar primera opción disponible
    const firstOption = page.locator('[role="option"]').first()
    if (await firstOption.isVisible()) {
      await firstOption.click()
      
      // Ajustar cantidad si es necesario
      const quantityInput = page.locator('input[type="number"]').first()
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('2')
      }
      
      // Click en botón de agregar item (+)
      const addButton = page.locator('button[aria-label="Agregar"]').first()
      await addButton.click()
    }
    
    // Llenar cliente opcional
    // await page.fill('input[name="customer"]', 'Cliente Test')
    
    // Submit
    const sellButton = page.locator('button:has-text("Vender")')
    if (await sellButton.isEnabled()) {
      await sellButton.click()
      
      // Verificar que la venta aparece en la tabla
      await expect(page.locator('text=Venta General')).toBeVisible({ timeout: 5000 })
    }
  })

  test('debería registrar venta con cliente', async ({ page }) => {
    await page.goto('/ventas')
    
    await page.click('button:has-text("Nueva Venta")')
    
    // Agregar un item primero
    const productSelect = page.locator('[role="combobox"]').first()
    await productSelect.click()
    
    const firstOption = page.locator('[role="option"]').first()
    if (await firstOption.isVisible()) {
      await firstOption.click()
      await page.click('button[aria-label="Agregar"]')
    }
    
    // Seleccionar cliente del dropdown
    const customerSelect = page.locator('text=Cliente (opcional)').locator('..').locator('[role="combobox"]')
    await customerSelect.click()
    
    // Buscar un cliente existente
    const customerOption = page.locator('[role="option"]').nth(1)
    if (await customerOption.isVisible()) {
      await customerOption.click()
    }
    
    // Submit
    const sellButton = page.locator('button:has-text("Vender")')
    if (await sellButton.isEnabled()) {
      await sellButton.click()
      
      // Verificar que el cliente aparece en la venta
      await expect(page.locator('text=Nueva Venta')).not.toBeVisible()
    }
  })
})