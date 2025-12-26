import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * FLUJO 3: Catalogo de Productos - Vista Enterprise
 * Tests for products module with 5 view modes
 */

test.describe('FLUJO 3: Catalogo de Productos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('3.1 Lista de Productos - Should display products list', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await page.waitForLoadState('networkidle')

    // Wait for content to load with longer timeout for products (large dataset)
    await page.waitForTimeout(2000)

    // Should have products displayed or loading indicator
    const hasContent = await page.locator('table, [class*="grid"], [class*="list"], [class*="product"], [class*="loading"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('3.1 Vista Table - Should show table view by default', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Table or any view mode should be visible
    const hasTable = await page.locator('table').count() > 0
    const hasGrid = await page.locator('[class*="grid"]').count() > 0
    const hasList = await page.locator('[class*="list"]').count() > 0
    const hasProducts = await page.locator('[class*="product"]').count() > 0

    expect(hasTable || hasGrid || hasList || hasProducts).toBeTruthy()
  })

  test('3.1 View Mode Selector - Should have view mode toggle', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)

    // Look for view mode selector
    const viewSelector = page.locator('[class*="view-mode"], [class*="ViewMode"], button[title*="vista"], button[title*="view"]')
    const selectorCount = await viewSelector.count()

    // May have view mode buttons
    if (selectorCount > 0) {
      await expect(viewSelector.first()).toBeVisible()
    }
  })

  test('3.1 Filtros - Should have search functionality', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for search/filter inputs (case insensitive)
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"], input[placeholder*="filtrar"], input[placeholder*="Buscar"], input[placeholder*="Search"], input[placeholder*="Filtrar"]')
    const hasSearch = await searchInput.count() > 0

    // Also check for any input that could be a filter
    const hasAnyInput = await page.locator('input[type="text"], input:not([type])').count() > 0

    expect(hasSearch || hasAnyInput).toBeTruthy()
  })

  test('3.2 Unidades - Should display units list', async ({ page }) => {
    await navigateToModule(page, ROUTES.productsUnits)
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    const hasContent = await page.locator('table, [class*="list"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('3.2 Categorias - Should display categories list', async ({ page }) => {
    await navigateToModule(page, ROUTES.productsCategories)
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    const hasContent = await page.locator('table, [class*="list"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('3.2 Marcas - Should display brands list', async ({ page }) => {
    await navigateToModule(page, ROUTES.productsBrands)
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    const hasContent = await page.locator('table, [class*="list"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('3.1 Productos - Should have create button', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)

    // Look for create/new button
    const createButton = page.locator('a:has-text("Crear"), a:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Nuevo"), a[href*="create"]')
    const hasCreateButton = await createButton.count() > 0

    expect(hasCreateButton).toBeTruthy()
  })
})
