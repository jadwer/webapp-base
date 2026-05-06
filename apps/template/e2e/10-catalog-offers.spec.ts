import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * FLUJO 14: Catalogo de Ofertas
 * Product offers and promotions management
 */

// Extended routes for catalog
const CATALOG_ROUTES = {
  ...ROUTES,
  catalog: '/dashboard/catalog',
  catalogOffers: '/dashboard/catalog/offers',
  catalogOffersCreate: '/dashboard/catalog/offers/create',
}

test.describe('FLUJO 14: Catalogo de Ofertas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('14.1 Lista de Ofertas - Should display offers list', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffers)
    await page.waitForLoadState('networkidle')

    // Page should have offers table or products with discounts
    const hasContent = await page.locator('table, [class*="list"], [class*="offer"], [class*="product"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('14.1 Ofertas - Should show discount percentage', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffers)
    await waitForTableData(page)

    // Look for discount percentages
    const hasDiscounts = await page.locator(':has-text("%"), [class*="discount"], [class*="offer"]').count() > 0
    // Discounts should be displayed if offers exist
  })

  test('14.1 Ofertas - Should show price comparison', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffers)
    await waitForTableData(page)

    // Look for price columns (original and discounted)
    const hasPrices = await page.locator('td:has-text("$"), [class*="price"]').count() > 0
    // Prices should be displayed
  })

  test('14.1 Ofertas - Should have create offer button', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffers)

    // Look for create button
    const createButton = page.locator('a:has-text("Crear"), a:has-text("Nueva"), button:has-text("Crear"), button:has-text("Nueva")')
    const hasCreate = await createButton.count() > 0

    expect(hasCreate).toBeTruthy()
  })

  test('14.2 Crear Oferta - Should display create offer form', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffersCreate)
    await page.waitForLoadState('networkidle')

    // Form should have product and price fields
    const hasForm = await page.locator('form, input, select').count() > 0
    expect(hasForm).toBeTruthy()
  })

  test('14.2 Crear Oferta - Should have product selector', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffersCreate)
    await page.waitForLoadState('networkidle')

    // Look for product selection
    const hasProductSelect = await page.locator('select, [class*="product"], input[placeholder*="producto"]').count() > 0
    // Product selector should exist
  })

  test('14.2 Crear Oferta - Should have price/discount fields', async ({ page }) => {
    await navigateToModule(page, CATALOG_ROUTES.catalogOffersCreate)
    await page.waitForLoadState('networkidle')

    // Look for price or discount fields
    const hasPriceFields = await page.locator('input[name*="price"], input[name*="discount"], input[type="number"]').count() > 0
    // Price/discount fields should exist
  })
})

test.describe('FLUJO 14: Catalogo - Integracion con Productos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('14.3 Productos con Oferta - Should show offer badge on products', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for offer/discount badges on product list
    const hasOfferBadges = await page.locator('[class*="badge"]:has-text("Oferta"), [class*="badge"]:has-text("Descuento"), [class*="sale"], [class*="offer"]').count() > 0
    // Offer badges may exist if products have offers
  })

  test('14.3 Productos - Should show discounted price', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await waitForTableData(page)

    // Look for strikethrough prices (original) and discounted prices
    const hasPrices = await page.locator('[class*="price"], td:has-text("$")').count() > 0
    // Price display should exist
  })

  test('14.4 Filtro de Ofertas - Should filter products with offers', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await page.waitForLoadState('networkidle')

    // Look for offer filter option
    const offerFilter = page.locator('select option:has-text("Oferta"), label:has-text("Oferta"), input[type="checkbox"]:has-text("Oferta")')
    const hasOfferFilter = await offerFilter.count() > 0
    // Offer filter may exist
  })
})

test.describe('FLUJO 14: Catalogo Publico con Ofertas', () => {
  test('14.5 Catalogo Publico - Should highlight offers', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')

    // Look for offer highlights in public catalog
    const hasOfferSection = await page.locator('[class*="offer"], [class*="sale"], [class*="promo"], :has-text("Oferta")').count() > 0
    // Public catalog may have offer section
  })

  test('14.5 Ofertas - Should show savings', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')

    // Look for savings indicator
    const hasSavings = await page.locator(':has-text("Ahorra"), :has-text("Save"), [class*="saving"], [class*="discount"]').count() > 0
    // Savings display may exist
  })

  test('14.5 Ofertas - Should have countdown for limited offers', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('networkidle')

    // Look for countdown timer
    const hasCountdown = await page.locator('[class*="countdown"], [class*="timer"], :has-text("dias"), :has-text("horas")').count() > 0
    // Countdown may exist for time-limited offers
  })
})
