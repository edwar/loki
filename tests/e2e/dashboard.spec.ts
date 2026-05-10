import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Ir al login y autenticarse
    await page.goto('/login')
    // Asumiendo que hay un usuario de test configurado
    // En un entorno real, esto vendría de variables de entorno o setup
  })

  test('debería cargar el dashboard con estadísticas', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Resumen Ejecutivo')
    
    // Verificar que las stats cards existan
    await expect(page.locator('text=Stock Crítico')).toBeVisible()
    await expect(page.locator('text=Catálogo Activo')).toBeVisible()
  })

  test('debería mostrar gráficos de ventas y gastos', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Distribución de Gastos')).toBeVisible()
    await expect(page.locator('text=Actividad Reciente')).toBeVisible()
  })

  test('debería filtrar datos por período', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click en el filtro de período
    const filterButton = page.locator('button:has-text("últimos 30 días")').first()
    await filterButton.click()
    
    // Seleccionar opción de 7 días
    await page.locator('text=últimos 7 días').click()
    
    // Verificar que el filtro cambió
    await expect(page.locator('button:has-text("últimos 7 días")')).toBeVisible()
  })
})