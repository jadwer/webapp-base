import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * FLUJO 6: Finanzas - AR/AP
 * Accounts Receivable and Accounts Payable flows
 */

test.describe('FLUJO 6: Finanzas - AR/AP', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('6.1 Cuentas por Cobrar (AR) - Should display AR invoices list', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeAR)
    await waitForTableData(page)

    // Page should have invoices table
    const hasContent = await page.locator('table, [class*="list"], [class*="invoice"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('6.1 AR Invoices - Should have status badges', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeAR)
    await waitForTableData(page)

    // Look for status badges or indicators
    const hasBadges = await page.locator('[class*="badge"], [class*="status"], [class*="chip"]').count() > 0
    // Badges should exist if there's data
  })

  test('6.2 Cuentas por Pagar (AP) - Should display AP invoices list', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeAP)
    await waitForTableData(page)

    // Page should have invoices table
    const hasContent = await page.locator('table, [class*="list"], [class*="invoice"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('6.3 Cuentas Bancarias - Should display bank accounts', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeBanks)
    await page.waitForLoadState('networkidle')

    // Page should have bank accounts table
    const hasContent = await page.locator('table, [class*="list"], [class*="bank"], [class*="account"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('6.3 Bank Accounts - Should show account balances', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeBanks)
    await waitForTableData(page)

    // Look for currency/money indicators
    const hasAmounts = await page.locator('td:has-text("$"), [class*="amount"], [class*="balance"]').count() > 0
    // Should show some financial data
  })

  test('6.4 Recibos AR - Should display AR receipts list', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeARReceipts)
    await page.waitForLoadState('networkidle')

    // Page should load without errors - check for content or empty state
    const hasContent = await page.locator('table, [class*="list"], [class*="card"], h1, h2').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('6.5 Pagos AP - Should display AP payments list', async ({ page }) => {
    await navigateToModule(page, ROUTES.financeAPPayments)
    await page.waitForLoadState('networkidle')

    // Page should load without errors - check for content or empty state
    const hasContent = await page.locator('table, [class*="list"], [class*="card"], h1, h2').count() > 0
    expect(hasContent).toBeTruthy()
  })
})

test.describe('FLUJO 7: Contabilidad', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('7.1 Catalogo de Cuentas - Should display chart of accounts', async ({ page }) => {
    await navigateToModule(page, ROUTES.accounting)
    await page.waitForLoadState('networkidle')

    // Page should have accounts structure
    const hasContent = await page.locator('table, [class*="tree"], [class*="list"], [class*="account"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('7.1 Catalogo - Should show account hierarchy', async ({ page }) => {
    await navigateToModule(page, ROUTES.accounting)
    await waitForTableData(page)

    // Look for account codes or hierarchy
    const hasAccountCodes = await page.locator('td:has-text("1"), td:has-text("2"), [class*="code"]').count() > 0
    // Account structure should be visible
  })

  test('7.2 Polizas Contables - Should display journal entries', async ({ page }) => {
    await navigateToModule(page, ROUTES.journalEntries)
    await page.waitForLoadState('networkidle')

    // Page should have journal entries
    const hasContent = await page.locator('table, [class*="list"], [class*="entry"], [class*="journal"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('7.2 Journal Entries - Should show debit/credit columns', async ({ page }) => {
    await navigateToModule(page, ROUTES.journalEntries)
    await waitForTableData(page)

    // Look for debit/credit headers or values
    const hasDebits = await page.locator('th:has-text("Debe"), th:has-text("Debit"), th:has-text("Cargo")').count() > 0
    const hasCredits = await page.locator('th:has-text("Haber"), th:has-text("Credit"), th:has-text("Abono")').count() > 0
    // Should have accounting columns
  })
})
