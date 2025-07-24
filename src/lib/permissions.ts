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
export const PAGE_PERMISSIONS = {
  // Dashboard principal
  '/dashboard': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['dashboard.view']
  },
  
  // Gestión de usuarios
  '/dashboard/users': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['users.view']
  },
  
  // Gestión de permisos
  '/dashboard/permissions': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['permissions.view']
  },
  
  // Page Builder
  '/dashboard/page-builder': {
    roles: ['god', 'admin', 'administrator'],
    permissions: ['page-builder.view']
  },
  
  // Perfil (todos pueden acceder)
  '/dashboard/profile': {
    roles: ['god', 'admin', 'administrator', 'customer', 'user'],
    permissions: []
  }
} as const

/**
 * Verifica si un usuario puede acceder a una página específica
 */
export function canAccessPage(user: User | null, path: string): boolean {
  if (!user) return false

  const pageConfig = PAGE_PERMISSIONS[path as keyof typeof PAGE_PERMISSIONS]
  
  if (!pageConfig) {
    // Si no hay configuración específica, solo usuarios autenticados pueden acceder
    return true
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
