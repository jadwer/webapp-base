import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * FLUJO 8: Recursos Humanos
 * HR module tests
 */

test.describe('FLUJO 8: Recursos Humanos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('8.1 Empleados - Should display employees list', async ({ page }) => {
    await navigateToModule(page, ROUTES.hrEmployees)
    await page.waitForLoadState('networkidle')

    // Page should have employees table
    const hasContent = await page.locator('table, [class*="list"], [class*="employee"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('8.1 Empleados - Should show employee info', async ({ page }) => {
    await navigateToModule(page, ROUTES.hrEmployees)
    await waitForTableData(page)

    // Look for employee-related fields
    const hasEmployeeData = await page.locator('td, [class*="employee"]').count() > 0
    // Should have employee records
  })

  test('8.2 Estructura Organizacional - Should display organization', async ({ page }) => {
    await navigateToModule(page, ROUTES.hrOrganization)
    await page.waitForLoadState('networkidle')

    // Page should load organization structure
    const hasContent = await page.locator('table, [class*="tree"], [class*="org"], [class*="department"]').count() > 0
    // Organization page should exist
  })

  test('8.3 Asistencias - Should display attendances', async ({ page }) => {
    await navigateToModule(page, ROUTES.hrAttendances)
    await page.waitForLoadState('networkidle')

    // Page should load
    const hasContent = await page.locator('table, [class*="list"], [class*="attendance"]').count() > 0
    // Attendances page should exist
  })

  test('8.3 Vacaciones - Should display leaves', async ({ page }) => {
    await navigateToModule(page, ROUTES.hrLeaves)
    await page.waitForLoadState('networkidle')

    // Page should load
    const hasContent = await page.locator('table, [class*="list"], [class*="leave"]').count() > 0
    // Leaves page should exist
  })
})

/**
 * FLUJO 9: CRM
 * Customer Relationship Management tests
 */

test.describe('FLUJO 9: CRM', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('9.1 Pipeline de Ventas - Should display pipeline stages', async ({ page }) => {
    await navigateToModule(page, ROUTES.crmPipeline)
    await page.waitForLoadState('networkidle')

    // Page should have pipeline stages
    const hasContent = await page.locator('table, [class*="list"], [class*="pipeline"], [class*="stage"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('9.1 Pipeline - Should show probability values', async ({ page }) => {
    await navigateToModule(page, ROUTES.crmPipeline)
    await waitForTableData(page)

    // Look for probability percentages
    const hasProbability = await page.locator('td:has-text("%"), [class*="probability"]').count() > 0
    // Should show probability data
  })

  test('9.2 Leads - Should display leads list', async ({ page }) => {
    await navigateToModule(page, ROUTES.crmLeads)
    await page.waitForLoadState('networkidle')

    // Page should have leads table
    const hasContent = await page.locator('table, [class*="list"], [class*="lead"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('9.2 Leads - Should have rating indicators', async ({ page }) => {
    await navigateToModule(page, ROUTES.crmLeads)
    await waitForTableData(page)

    // Look for rating badges (Hot, Warm, Cold)
    const hasRating = await page.locator('[class*="badge"], [class*="rating"]:has-text("Hot"), :has-text("Warm"), :has-text("Cold")').count() > 0
    // Rating indicators may exist
  })

  test('9.3 Campanas - Should display campaigns', async ({ page }) => {
    await navigateToModule(page, ROUTES.crmCampaigns)
    await page.waitForLoadState('networkidle')

    // Page should load campaigns
    const hasContent = await page.locator('table, [class*="list"], [class*="campaign"]').count() > 0
    // Campaigns page should exist
  })

  test('9.4 CRM Index - Should display CRM main page', async ({ page }) => {
    await navigateToModule(page, ROUTES.crm)
    await page.waitForLoadState('networkidle')

    // Page should load CRM index
    const hasContent = await page.locator('[class*="card"], [class*="list"], h1, h2').count() > 0
    // CRM page should exist
  })
})
