import { test, expect } from '@playwright/test'

test.describe('Gestión de Productos', () => {
  const testProduct = {
    name: `Producto Test ${Date.now()}`,
    category: 'Empanadas',
    salePrice: '5000'
  }

  test('debería mostrar empty state cuando no hay productos', async ({ page }) => {
    await page.goto('/productos')
    
    await expect(page.locator('text=No hay productos registrados')).toBeVisible({ timeout: 5000 })
  })

  test('debería crear un nuevo producto con receta', async ({ page }) => {
    await page.goto('/productos')
    
    // Click en botón Nuevo Producto
    await page.click('button:has-text("Nuevo Producto")')
    
    // Modal debería abrirse
    await expect(page.locator('text=Nuevo Producto')).toBeVisible()
    
    // Llenar datos básicos
    await page.fill('input[name="name"]', testProduct.name)
    
    // Seleccionar categoría
    await page.click('text=Seleccionar categoría')
    await page.click(`text=${testProduct.category}`)
    
    // Ingresar precio de venta
    await page.fill('input[name="salePrice"]', testProduct.salePrice)
    
    // Agregar al menos un insumo a la receta
    const addSupplyButton = page.locator('button:has-text("Agregar Insumo")')
    if (await addSupplyButton.isVisible()) {
      await addSupplyButton.click()
      
      // Seleccionar un insumo
      const supplySelect = page.locator('[role="combobox"]').last()
      await supplySelect.click()
      
      const firstSupply = page.locator('[role="option"]').first()
      if (await firstSupply.isVisible()) {
        await firstSupply.click()
      }
      
      // Ingresar cantidad
      const quantityInput = page.locator('input[name="quantityRequired"]')
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('100')
      }
    }
    
    // Submit
    await page.click('button:has-text("Crear Producto")')
    
    // Verificar que el producto aparece
    await expect(page.locator(`text=${testProduct.name}`)).toBeVisible({ timeout: 5000 })
  })

  test('debería editar un producto existente', async ({ page }) => {
    await page.goto('/productos')
    
    // Click en el primer producto para expandir
    const productCard = page.locator('[class*="border"]').filter({ hasText: testProduct.name }).first()
    await productCard.click()
    
    // Click en botón editar
    const editButton = page.locator('button:has-text("Editar")')
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Modificar nombre
      await page.fill('input[name="name"]', `${testProduct.name} - Editado`)
      
      await page.click('button:has-text("Actualizar")')
      
      await expect(page.locator(`text=${testProduct.name} - Editado`)).toBeVisible()
    }
  })
})