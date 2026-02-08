'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from '@/hooks/useIsClient'
import { hasAnyRole, hasAnyPermission, canAccessPage } from '@/lib/permissions'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: string[]
  requiredPermissions?: string[]
  fallback?: ReactNode
  path?: string
  requireAll?: boolean
}

/**
 * Componente para proteger contenido basado en roles y permisos
 * 
 * @param allowedRoles - Lista de roles que pueden acceder
 * @param requiredPermissions - Lista de permisos requeridos
 * @param path - Ruta para verificar permisos automáticamente
 * @param requireAll - Si true, requiere TODOS los roles/permisos, si false solo uno
 * @param fallback - Componente a mostrar si no tiene acceso
 */
export function DynamicRoleGuard({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = <div className="alert alert-warning">No tienes permisos para ver este contenido.</div>,
  path,
  requireAll = false
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const isClient = useIsClient()

  // Durante la carga o en el servidor, no mostrar nada
  if (!isClient || isLoading) {
    return null
  }

  // Si no está autenticado, mostrar fallback
  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  let hasAccess = false

  // Si se especifica una ruta, usar verificación automática
  if (path) {
    hasAccess = canAccessPage(user, path)
  } else {
    // Verificación manual por roles y permisos
    let roleCheck = true
    let permissionCheck = true

    if (allowedRoles.length > 0) {
      if (requireAll) {
        // Requiere TODOS los roles
        roleCheck = allowedRoles.every(role => hasAnyRole(user, [role]))
      } else {
        // Requiere AL MENOS UNO de los roles
        roleCheck = hasAnyRole(user, allowedRoles)
      }
    }

    if (requiredPermissions.length > 0) {
      if (requireAll) {
        // Requiere TODOS los permisos
        permissionCheck = requiredPermissions.every(permission => hasAnyPermission(user, [permission]))
      } else {
        // Requiere AL MENOS UNO de los permisos
        permissionCheck = hasAnyPermission(user, requiredPermissions)
      }
    }

    hasAccess = roleCheck && permissionCheck
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
