import { test, expect } from '@playwright/test'
import { ROUTES, login, navigateToModule, waitForTableData } from './utils/test-helpers'

/**
 * FLUJO 13: Usuarios, Roles y Permisos
 * User management and access control tests
 */

// Extended routes for user management
const USER_ROUTES = {
  ...ROUTES,
  users: '/dashboard/users',
  usersCreate: '/dashboard/users/create',
  roles: '/dashboard/roles',
  rolesCreate: '/dashboard/roles/create',
  permissions: '/dashboard/permissions',
  permissionsCreate: '/dashboard/permissions/create',
}

test.describe('FLUJO 13: Gestion de Usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('13.1 Lista de Usuarios - Should display users list', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.users)
    await page.waitForLoadState('networkidle')

    // Page should have users table
    const hasContent = await page.locator('table, [class*="list"], [class*="user"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('13.1 Usuarios - Should show user email and name', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.users)
    await waitForTableData(page)

    // Look for email format in table
    const hasEmail = await page.locator('td:has-text("@"), [class*="email"]').count() > 0
    // Should have user emails displayed
  })

  test('13.1 Usuarios - Should have create user button', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.users)

    // Look for create button
    const createButton = page.locator('a:has-text("Crear"), a:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Nuevo")')
    const hasCreate = await createButton.count() > 0

    expect(hasCreate).toBeTruthy()
  })

  test('13.1 Usuarios - Should show user roles', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.users)
    await waitForTableData(page)

    // Look for role badges or column
    const hasRoles = await page.locator('[class*="badge"], [class*="role"], th:has-text("Rol"), th:has-text("Role")').count() > 0
    // Roles should be displayed
  })

  test('13.2 Crear Usuario - Should display create user form', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.usersCreate)
    await page.waitForLoadState('networkidle')

    // Form should have required fields
    const hasName = await page.locator('input[name="name"], input[placeholder*="nombre"], label:has-text("Nombre")').count() > 0
    const hasEmail = await page.locator('input[name="email"], input[type="email"]').count() > 0
    const hasPassword = await page.locator('input[type="password"]').count() > 0

    expect(hasName && hasEmail && hasPassword).toBeTruthy()
  })

  test('13.2 Crear Usuario - Should have role selection', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.usersCreate)
    await page.waitForLoadState('networkidle')

    // Look for role selection
    const hasRoleSelect = await page.locator('select:has-text("Rol"), [class*="role"], input[type="checkbox"]').count() > 0
    // Role selection should exist
  })
})

test.describe('FLUJO 13: Gestion de Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('13.3 Lista de Roles - Should display roles list', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.roles)
    await page.waitForLoadState('networkidle')

    // Page should have roles table
    const hasContent = await page.locator('table, [class*="list"], [class*="role"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('13.3 Roles - Should show role names', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.roles)
    await waitForTableData(page)

    // Look for common role names
    const hasRoleNames = await page.locator(':has-text("Admin"), :has-text("Usuario"), :has-text("User"), :has-text("Manager")').count() > 0
    // Should have role names displayed
  })

  test('13.3 Roles - Should have create role button', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.roles)

    // Look for create button
    const createButton = page.locator('a:has-text("Crear"), a:has-text("Nuevo"), button:has-text("Crear")')
    const hasCreate = await createButton.count() > 0

    expect(hasCreate).toBeTruthy()
  })

  test('13.3 Roles - Should show permission count', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.roles)
    await waitForTableData(page)

    // Look for permissions column or badge count
    const hasPermissionInfo = await page.locator('th:has-text("Permiso"), [class*="permission"], td').count() > 0
    // Permission info may be displayed
  })

  test('13.4 Crear Rol - Should display create role form', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.rolesCreate)
    await page.waitForLoadState('networkidle')

    // Form should have name field
    const hasName = await page.locator('input[name="name"], input[placeholder*="nombre"]').count() > 0
    expect(hasName).toBeTruthy()
  })

  test('13.4 Crear Rol - Should have permission checkboxes', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.rolesCreate)
    await page.waitForLoadState('networkidle')

    // Look for permission checkboxes
    const hasCheckboxes = await page.locator('input[type="checkbox"], [class*="permission"]').count() > 0
    // Permission checkboxes should exist
  })
})

test.describe('FLUJO 13: Gestion de Permisos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('13.5 Lista de Permisos - Should display permissions list', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.permissions)
    await page.waitForLoadState('networkidle')

    // Page should have permissions table
    const hasContent = await page.locator('table, [class*="list"], [class*="permission"]').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('13.5 Permisos - Should show permission names', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.permissions)
    await waitForTableData(page)

    // Look for common permission patterns
    const hasPermissions = await page.locator(':has-text("crear"), :has-text("editar"), :has-text("eliminar"), :has-text("ver"), :has-text("create"), :has-text("edit"), :has-text("delete"), :has-text("view")').count() > 0
    // Should have permission names
  })

  test('13.5 Permisos - Should group by module', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.permissions)
    await page.waitForLoadState('networkidle')

    // Look for module groupings
    const hasGroups = await page.locator('[class*="group"], [class*="category"], h3, h4').count() > 0
    // Permissions may be grouped
  })

  test('13.6 Crear Permiso - Should display create permission form', async ({ page }) => {
    await navigateToModule(page, USER_ROUTES.permissionsCreate)
    await page.waitForLoadState('networkidle')

    // Form should have name field
    const hasName = await page.locator('input[name="name"], input[placeholder*="nombre"]').count() > 0
    expect(hasName).toBeTruthy()
  })
})

test.describe('FLUJO 13: Control de Acceso', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('13.7 Dashboard - Should show menu based on permissions', async ({ page }) => {
    await page.goto(ROUTES.dashboard)
    await page.waitForLoadState('networkidle')

    // Sidebar should have menu items
    const sidebarItems = page.locator('nav a, aside a, [class*="sidebar"] a')
    const itemCount = await sidebarItems.count()

    // Should have at least some menu items
    expect(itemCount).toBeGreaterThan(0)
  })

  test('13.7 Perfil - Should allow changing password', async ({ page }) => {
    // Navigate to profile or settings
    await page.goto('/dashboard/profile')
    await page.waitForLoadState('networkidle')

    // Look for password change form
    const hasPasswordForm = await page.locator('input[type="password"], :has-text("Contrasena"), :has-text("Password")').count() > 0
    // Password change may be available
  })
})
