/**
 * Sistema de gestión de permisos dinámico
 * Permite verificar permisos y roles basados en la información del usuario
 */

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  role?: string
  roles?: Role[]
  permissions?: Permission[]
  created_at: string
  updated_at: string
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false

  // Verificar por el campo role directo
  if (user.role && user.role.toLowerCase() === roleName.toLowerCase()) {
    return true
  }

  // Verificar por el array de roles (si existe)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => 
      role.name.toLowerCase() === roleName.toLowerCase()
    )
  }

  return false
}

/**
 * Verifica si un usuario tiene alguno de los roles especificados
 */
export function hasAnyRole(user: User | null, roleNames: readonly string[] | string[]): boolean {
  if (!user || !roleNames.length) return false

  return roleNames.some(roleName => hasRole(user, roleName))
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(user: User | null, permissionName: string): boolean {
  if (!user) return false

  // Verificar permisos directos del usuario
  if (user.permissions && Array.isArray(user.permissions)) {
    const hasDirectPermission = user.permissions.some(permission => 
      permission.name.toLowerCase() === permissionName.toLowerCase()
    )
    if (hasDirectPermission) return true
  }

  // Verificar permisos a través de roles
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => 
      role.permissions && role.permissions.some(permission =>
        permission.name.toLowerCase() === permissionName.toLowerCase()
      )
    )
  }

  return false
}

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 */
export function hasAnyPermission(user: User | null, permissionNames: readonly string[] | string[]): boolean {
  if (!user || !permissionNames.length) return false

  return permissionNames.some(permissionName => hasPermission(user, permissionName))
}

/**
 * Verifica si un usuario es administrador
 * Un usuario es admin si tiene el rol 'god', 'admin' o 'administrator'
 */
export function isAdmin(user: User | null): boolean {
  return hasAnyRole(user, ['god', 'admin', 'administrator'])
}

/**
 * Verifica si un usuario es super administrador (god)
 */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, 'god')
}

/**
 * Obtiene todos los roles de un usuario
 */
export function getUserRoles(user: User | null): string[] {
  if (!user) return []

  const roles: string[] = []

  // Agregar rol directo si existe
  if (user.role) {
    roles.push(user.role)
  }

  // Agregar roles del array si existe
  if (user.roles && Array.isArray(user.roles)) {
    roles.push(...user.roles.map(role => role.name))
  }

  // Remover duplicados y retornar
  return Array.from(new Set(roles))
}

/**
 * Obtiene todos los permisos de un usuario (directos y a través de roles)
 */
export function getUserPermissions(user: User | null): string[] {
  if (!user) return []

  const permissions: string[] = []

  // Agregar permisos directos
  if (user.permissions && Array.isArray(user.permissions)) {
    permissions.push(...user.permissions.map(permission => permission.name))
  }

  // Agregar permisos de roles
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        permissions.push(...role.permissions.map(permission => permission.name))
      }
    })
  }

  // Remover duplicados y retornar
  return Array.from(new Set(permissions))
}

/**
 * Rutas por defecto según el rol del usuario
 */
export function getDefaultRoute(user: User | null): string {
  if (!user) return '/auth/login'

  // Super admin va al dashboard principal
  if (isSuperAdmin(user)) {
    return '/dashboard'
  }

  // Admin va al dashboard principal
  if (isAdmin(user)) {
    return '/dashboard'
  }

  // Usuario normal va a su perfil
  return '/dashboard/profile'
}

/**
 * Configuración de permisos por página/sección
 */
export const PAGE_PERMISSIONS: Record<string, { roles: readonly string[]; permissions: readonly string[] }> = {
  // Dashboard principal - admin ve dashboard admin, customer ve dashboard cliente
  '/dashboard': {
    roles: ['god', 'admin', 'administrator', 'customer', 'cliente'],
    permissions: []
  },

  // Perfil (todos pueden acceder)
  '/dashboard/profile': {
    roles: ['god', 'admin', 'administrator', 'customer', 'cliente', 'tech', 'user'],
    permissions: []
  },

  // Customer Portal pages
  '/dashboard/my-quotes': {
    roles: ['god', 'admin', 'administrator', 'customer', 'cliente'],
    permissions: []
  },
  '/dashboard/my-orders': {
    roles: ['god', 'admin', 'administrator', 'customer', 'cliente'],
    permissions: []
  },
  '/dashboard/my-cart': {
    roles: ['god', 'admin', 'administrator', 'customer', 'cliente'],
    permissions: []
  },

  // Gestion de usuarios y permisos
  '/dashboard/users': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['users.show']
  },
  '/dashboard/permissions': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['permissions.show']
  },
  '/dashboard/roles': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['roles.show']
  },
  '/dashboard/permission-manager': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['permissions.show']
  },

  // Page Builder
  '/dashboard/pages': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['page.index']
  },
  '/dashboard/page-builder': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['page.index']
  },

  // System
  '/dashboard/audit': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['audits.index']
  },
  '/dashboard/system-health': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['system-health.index']
  },
  '/dashboard/diagnostic': {
    roles: ['god', 'admin', 'administrator'],
    permissions: []
  },
  '/dashboard/design-system': {
    roles: ['god', 'admin', 'administrator'],
    permissions: []
  },

  // Products
  '/dashboard/products': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['products.index']
  },

  // Contacts
  '/dashboard/contacts': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['contacts.index']
  },

  // Inventory
  '/dashboard/inventory': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['stocks.index']
  },

  // Quotes
  '/dashboard/quotes': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['quotes.index']
  },

  // Sales
  '/dashboard/sales': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['sales-orders.index']
  },

  // Purchase
  '/dashboard/purchase': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['purchase-orders.index']
  },

  // Finance
  '/dashboard/finance': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['ar-invoices.index']
  },

  // Accounting
  '/dashboard/accounting': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['accounts.index']
  },

  // Reports
  '/dashboard/reports': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['reports.balance-sheets.index']
  },

  // CRM
  '/dashboard/crm': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['crm.leads.index']
  },

  // HR
  '/dashboard/hr': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['employees.index']
  },

  // Billing
  '/dashboard/billing': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['cfdi-invoices.index']
  },

  // Catalog management
  '/dashboard/catalog': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['products.index']
  },

  // E-commerce admin
  '/dashboard/ecommerce': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['sales-orders.index']
  },

  // Settings
  '/dashboard/settings': {
    roles: ['god', 'admin', 'administrator'],
    permissions: []
  },
}

/**
 * Verifica si un usuario puede acceder a una página específica
 */
export function canAccessPage(user: User | null, path: string): boolean {
  if (!user) return false

  // God/admin always has access to everything
  if (isAdmin(user)) return true

  // Try exact match first, then prefix match for sub-routes
  let pageConfig = PAGE_PERMISSIONS[path]

  if (!pageConfig) {
    // Find the longest matching prefix (e.g., /dashboard/products matches /dashboard/products/categories)
    const matchingPaths = Object.keys(PAGE_PERMISSIONS)
      .filter(key => path.startsWith(key + '/') || path === key)
      .sort((a, b) => b.length - a.length)

    if (matchingPaths.length > 0) {
      pageConfig = PAGE_PERMISSIONS[matchingPaths[0]]
    }
  }

  if (!pageConfig) {
    // No configuration found - deny by default for security
    return false
  }

  // Verificar roles
  if (pageConfig.roles.length > 0) {
    const hasRequiredRole = hasAnyRole(user, pageConfig.roles)
    if (hasRequiredRole) return true
  }

  // Verificar permisos
  if (pageConfig.permissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(user, pageConfig.permissions)
    if (hasRequiredPermission) return true
  }

  // Si no tiene ni roles ni permisos requeridos, denegar acceso
  return false
}
