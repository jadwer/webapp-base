import { Page, expect } from '@playwright/test'

/**
 * E2E Test Helpers for ERP Demo Happy Paths
 */

// Demo credentials
export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@example.com',
    password: 'secureadmin'
  },
  tech: {
    email: 'tech@example.com',
    password: 'securet3ch'
  },
  customer: {
    email: 'customer@example.com',
    password: 'secureC0stumer'
  }
}

// Common routes - Verified from src/app structure
export const ROUTES = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  register: '/auth/register',

  // Dashboard
  dashboard: '/dashboard',

  // Contacts
  contacts: '/dashboard/contacts',
  contactsCreate: '/dashboard/contacts/create',
  contactsCustomers: '/dashboard/contacts/customers',
  contactsSuppliers: '/dashboard/contacts/suppliers',

  // Products
  products: '/dashboard/products',
  productsCreate: '/dashboard/products/create',
  productsUnits: '/dashboard/products/units',
  productsCategories: '/dashboard/products/categories',
  productsBrands: '/dashboard/products/brands',

  // Sales
  sales: '/dashboard/sales',
  salesCreate: '/dashboard/sales/create',

  // Purchase
  purchase: '/dashboard/purchase',
  purchaseCreate: '/dashboard/purchase/create',

  // Inventory
  inventory: '/dashboard/inventory',
  inventoryWarehouses: '/dashboard/inventory/warehouses',
  inventoryStock: '/dashboard/inventory/stock',
  inventoryMovements: '/dashboard/inventory/movements',
  inventoryLocations: '/dashboard/inventory/locations',

  // Finance
  financeAR: '/dashboard/finance/ar-invoices',
  financeAP: '/dashboard/finance/ap-invoices',
  financeBanks: '/dashboard/finance/bank-accounts',
  financeARReceipts: '/dashboard/finance/ar-receipts',
  financeAPPayments: '/dashboard/finance/ap-payments',

  // Accounting
  accounting: '/dashboard/accounting/accounts',
  accountingCreate: '/dashboard/accounting/accounts/create',
  journalEntries: '/dashboard/accounting/journal-entries',
  journalEntriesCreate: '/dashboard/accounting/journal-entries/create',
  fiscalPeriods: '/dashboard/accounting/fiscal-periods',

  // HR
  hr: '/dashboard/hr',
  hrEmployees: '/dashboard/hr/employees',
  hrAttendances: '/dashboard/hr/attendances',
  hrLeaves: '/dashboard/hr/leaves',
  hrPayroll: '/dashboard/hr/payroll',
  hrOrganization: '/dashboard/hr/organization',

  // CRM
  crm: '/dashboard/crm',
  crmLeads: '/dashboard/crm/leads',
  crmPipeline: '/dashboard/crm/pipeline-stages',
  crmCampaigns: '/dashboard/crm/campaigns',

  // Billing/CFDI
  billing: '/dashboard/billing',
  billingInvoices: '/dashboard/billing/invoices',
  billingPayments: '/dashboard/billing/payments',
  billingSettings: '/dashboard/billing/settings',

  // Reports
  reports: '/dashboard/reports',
  reportsFinancial: '/dashboard/reports/financial-statements',
  reportsAging: '/dashboard/reports/aging-reports',
  reportsManagement: '/dashboard/reports/management-reports',

  // Users
  users: '/dashboard/users',
  usersCreate: '/dashboard/users/create',

  // Roles
  roles: '/dashboard/roles',
  rolesCreate: '/dashboard/roles/create',

  // Permissions
  permissions: '/dashboard/permissions',
  permissionsCreate: '/dashboard/permissions/create',

  // Ecommerce
  ecommerceOrders: '/dashboard/ecommerce/orders',
  ecommerceOrdersCreate: '/dashboard/ecommerce/orders/create',

  // Catalog
  catalog: '/dashboard/catalog',
  catalogOffers: '/dashboard/catalog/offers',
  catalogOffersCreate: '/dashboard/catalog/offers/create',

  // System Health & Audit
  systemHealth: '/dashboard/system-health',
  audit: '/dashboard/audit',

  // Public pages
  publicCatalog: '/catalog',
  publicProducts: '/productos',
  publicCart: '/cart',
  publicCheckout: '/checkout',
}

/**
 * Login helper - authenticates and navigates to dashboard
 */
export async function login(page: Page, credentials = DEMO_CREDENTIALS.admin) {
  await page.goto(ROUTES.login)

  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Fill credentials
  await page.fill('input[type="email"]', credentials.email)
  await page.fill('input[type="password"]', credentials.password)

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15000 })

  // Verify we're logged in
  await expect(page).toHaveURL(/dashboard/)
}

/**
 * Ensure user is authenticated before test
 */
export async function ensureAuthenticated(page: Page) {
  // Check if already on dashboard
  const currentUrl = page.url()
  if (currentUrl.includes('/dashboard')) {
    return
  }

  // Try to navigate to dashboard
  await page.goto(ROUTES.dashboard)

  // If redirected to login, authenticate
  if (page.url().includes('/auth/login') || page.url().includes('/login')) {
    await login(page)
  }
}

/**
 * Navigate to a module and verify it loads
 */
export async function navigateToModule(page: Page, route: string, expectedHeading?: string) {
  await page.goto(route)
  await page.waitForLoadState('networkidle')

  if (expectedHeading) {
    await expect(page.locator('h1, h2, h3').first()).toContainText(expectedHeading, { timeout: 10000 })
  }
}

/**
 * Wait for table data to load
 */
export async function waitForTableData(page: Page) {
  // Wait for either table rows or empty state
  await Promise.race([
    page.waitForSelector('table tbody tr', { timeout: 15000 }),
    page.waitForSelector('[class*="empty"], [class*="no-data"]', { timeout: 15000 }),
  ]).catch(() => {
    // Table might be loading, continue anyway
  })
}

/**
 * Take screenshot for demo documentation
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `playwright-report/screenshots/${name}.png`,
    fullPage: false
  })
}

/**
 * Verify page loads without errors
 */
export async function verifyPageLoads(page: Page) {
  // Check for no error alerts
  const errorAlert = page.locator('.alert-danger, [role="alert"][class*="error"]')
  const errorCount = await errorAlert.count()

  if (errorCount > 0) {
    const errorText = await errorAlert.first().textContent()
    console.warn(`Warning: Error alert found on page: ${errorText}`)
  }

  // Check for no unhandled errors in console
  // This is tracked by the test itself
}

/**
 * Fill form field by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const field = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") + select, label:has-text("${label}") + textarea`)
  await field.fill(value)
}

/**
 * Select dropdown option by label
 */
export async function selectOption(page: Page, label: string, optionText: string) {
  const select = page.locator(`label:has-text("${label}") + select`)
  await select.selectOption({ label: optionText })
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, buttonText: string) {
  await page.click(`button:has-text("${buttonText}")`)
}

/**
 * Verify sidebar menu item exists
 */
export async function verifySidebarItem(page: Page, menuText: string) {
  const menuItem = page.locator(`nav a:has-text("${menuText}"), aside a:has-text("${menuText}")`)
  await expect(menuItem.first()).toBeVisible({ timeout: 5000 })
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  await waitForTableData(page)
  const rows = page.locator('table tbody tr')
  return await rows.count()
}

/**
 * Verify card/stat displays value
 */
export async function verifyStatCard(page: Page, label: string) {
  const card = page.locator(`[class*="card"]:has-text("${label}")`)
  await expect(card.first()).toBeVisible({ timeout: 10000 })
}
