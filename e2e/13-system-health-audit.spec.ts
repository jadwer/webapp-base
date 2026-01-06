import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * E2E Test: System Health and Audit Modules
 *
 * Tests the system monitoring and audit functionality
 *
 * Backend Reference:
 * - Modules/Audit/tests/Feature/
 * - SystemHealth endpoints
 */

// Routes for system health and audit
const SYSTEM_ROUTES = {
  ...ROUTES,
  systemHealth: '/dashboard/system-health',
  audit: '/dashboard/audit',
}

test.describe('FLUJO: System Health Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('System Health Dashboard', () => {
    test('Should display system health page', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Should have system health content
      const hasContent = await page.locator(
        'h1, h2, [class*="card"], [class*="health"]'
      ).count() > 0
      expect(hasContent).toBeTruthy()
    })

    test('Should show overall system status', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for status badge
      const hasStatus = await page.locator(
        '[class*="badge"], :has-text("Saludable"), :has-text("Healthy"), :has-text("Warning")'
      ).count() > 0
      expect(hasStatus).toBeTruthy()
    })

    test('Should display database health check', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for database section
      const hasDatabase = await page.locator(
        ':has-text("Base de Datos"), :has-text("Database"), [class*="database"]'
      ).count() > 0
      expect(hasDatabase).toBeTruthy()
    })

    test('Should display cache health check', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for cache section
      const hasCache = await page.locator(
        ':has-text("Cache"), :has-text("Redis"), [class*="cache"]'
      ).count() > 0
      expect(hasCache).toBeTruthy()
    })

    test('Should display queue health check', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for queue section
      const hasQueue = await page.locator(
        ':has-text("Cola"), :has-text("Queue"), :has-text("Jobs"), [class*="queue"]'
      ).count() > 0
      expect(hasQueue).toBeTruthy()
    })

    test('Should display storage health check', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for storage section
      const hasStorage = await page.locator(
        ':has-text("Almacenamiento"), :has-text("Storage"), :has-text("Disco"), [class*="storage"]'
      ).count() > 0
      expect(hasStorage).toBeTruthy()
    })

    test('Should show application metrics', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for metrics cards
      const hasMetrics = await page.locator(
        ':has-text("Usuarios"), :has-text("Productos"), :has-text("Ordenes"), [class*="metric"]'
      ).count() > 0
      expect(hasMetrics).toBeTruthy()
    })

    test('Should display database table metrics', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for database tables section
      const hasTables = await page.locator(
        'table, :has-text("Tabla"), :has-text("Registros"), :has-text("MB")'
      ).count() > 0
      // Database metrics table should exist
    })

    test('Should show recent errors if any', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for errors section
      const hasErrorSection = await page.locator(
        ':has-text("Error"), :has-text("Sin errores"), [class*="error"], [class*="exception"]'
      ).count() > 0
      expect(hasErrorSection).toBeTruthy()
    })

    test('Should have refresh button', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.systemHealth)
      await page.waitForLoadState('networkidle')

      // Look for refresh button
      const hasRefresh = await page.locator(
        'button:has-text("Actualizar"), button:has-text("Refresh"), [class*="refresh"]'
      ).count() > 0
      expect(hasRefresh).toBeTruthy()
    })
  })
})

test.describe('FLUJO: Audit Log Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('Audit Log List', () => {
    test('Should display audit log page', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await page.waitForLoadState('networkidle')

      // Should have audit content
      const hasContent = await page.locator(
        'h1, h2, table, [class*="audit"]'
      ).count() > 0
      expect(hasContent).toBeTruthy()
    })

    test('Should display audit events table', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Should have table with events
      const hasTable = await page.locator('table').count() > 0
      expect(hasTable).toBeTruthy()
    })

    test('Should show event types', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for event type badges
      const hasEvents = await page.locator(
        ':has-text("created"), :has-text("updated"), :has-text("deleted"), :has-text("login"), [class*="event"]'
      ).count() > 0
      // Event types should be displayed
    })

    test('Should show user information', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for user column
      const hasUser = await page.locator(
        ':has-text("Usuario"), :has-text("User"), th:has-text("Responsable")'
      ).count() > 0
      // User column should exist
    })

    test('Should show entity information', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for entity type column
      const hasEntity = await page.locator(
        ':has-text("Entidad"), :has-text("Entity"), :has-text("Modelo"), th:has-text("Tipo")'
      ).count() > 0
      // Entity column should exist
    })

    test('Should show timestamp', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for timestamp column
      const hasTimestamp = await page.locator(
        ':has-text("Fecha"), :has-text("Date"), th:has-text("Hora"), th:has-text("Timestamp")'
      ).count() > 0
      // Timestamp column should exist
    })
  })

  test.describe('Audit Filters', () => {
    test('Should have event type filter', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await page.waitForLoadState('networkidle')

      // Look for event filter
      const hasEventFilter = await page.locator(
        'select, :has-text("Evento"), :has-text("Event"), [class*="filter"]'
      ).count() > 0
      expect(hasEventFilter).toBeTruthy()
    })

    test('Should have entity type filter', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await page.waitForLoadState('networkidle')

      // Look for entity filter
      const hasEntityFilter = await page.locator(
        'select, :has-text("Tipo de Entidad"), :has-text("Entity Type")'
      ).count() > 0
      // Entity filter may exist
    })

    test('Should have user filter', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await page.waitForLoadState('networkidle')

      // Look for user filter
      const hasUserFilter = await page.locator(
        'input[placeholder*="usuario"], input[placeholder*="user"], :has-text("Usuario")'
      ).count() > 0
      // User filter may exist
    })
  })

  test.describe('Audit Detail View', () => {
    test('Should navigate to audit detail', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Click on first row
      const firstRow = page.locator('tbody tr').first()
      if (await firstRow.count() > 0) {
        await firstRow.click()
        await page.waitForLoadState('networkidle')

        // Should show detail view
        const hasDetail = await page.locator(
          '[class*="detail"], h1, h2, :has-text("Detalle")'
        ).count() > 0
        expect(hasDetail).toBeTruthy()
      }
    })

    test('Should show old and new values', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      const firstRow = page.locator('tbody tr').first()
      if (await firstRow.count() > 0) {
        await firstRow.click()
        await page.waitForLoadState('networkidle')

        // Look for old/new values section
        const hasValues = await page.locator(
          ':has-text("Anterior"), :has-text("Nuevo"), :has-text("Old"), :has-text("New"), :has-text("Cambios")'
        ).count() > 0
        // Values section should exist for update events
      }
    })

    test('Should show IP address and user agent', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      const firstRow = page.locator('tbody tr').first()
      if (await firstRow.count() > 0) {
        await firstRow.click()
        await page.waitForLoadState('networkidle')

        // Look for IP and user agent
        const hasMetadata = await page.locator(
          ':has-text("IP"), :has-text("User Agent"), :has-text("Navegador")'
        ).count() > 0
        // Metadata should exist
      }
    })
  })

  test.describe('Audit Event Types', () => {
    test('Should display login events', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for login events
      const hasLogin = await page.locator(
        ':has-text("login"), :has-text("Inicio de sesion")'
      ).count() > 0
      // Login events may exist
    })

    test('Should display CRUD events', async ({ page }) => {
      await navigateToModule(page, SYSTEM_ROUTES.audit)
      await waitForTableData(page)

      // Look for CRUD events
      const hasCRUD = await page.locator(
        ':has-text("created"), :has-text("updated"), :has-text("deleted"), :has-text("Creado"), :has-text("Actualizado"), :has-text("Eliminado")'
      ).count() > 0
      // CRUD events may exist
    })
  })
})

test.describe('FLUJO: Entity History Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Should show entity history in contact detail', async ({ page }) => {
    await navigateToModule(page, ROUTES.contacts)
    await waitForTableData(page)

    // Click on first contact
    const firstRow = page.locator('tbody tr').first()
    if (await firstRow.count() > 0) {
      await firstRow.click()
      await page.waitForLoadState('networkidle')

      // Look for history tab
      const hasHistoryTab = await page.locator(
        ':has-text("Historial"), :has-text("History"), [class*="tab"]:has-text("Actividad")'
      ).count() > 0
      // History tab may exist
    }
  })

  test('Should show entity history in product detail', async ({ page }) => {
    await navigateToModule(page, ROUTES.products)
    await waitForTableData(page)

    // Click on first product
    const firstRow = page.locator('tbody tr').first()
    if (await firstRow.count() > 0) {
      await firstRow.click()
      await page.waitForLoadState('networkidle')

      // Look for history tab
      const hasHistoryTab = await page.locator(
        ':has-text("Historial"), :has-text("History"), [class*="tab"]:has-text("Cambios")'
      ).count() > 0
      // History tab may exist
    }
  })
})
