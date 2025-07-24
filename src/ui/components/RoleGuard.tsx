'use client'

import { useAuth } from '@/modules/auth/lib/auth'
import { useRouter } from 'next/navigation'
import { useIsClient } from '@/hooks/useIsClient'
import { useEffect, ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallbackRoute?: string
  loadingComponent?: ReactNode
}

/**
 * Componente para proteger rutas según roles de usuario
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackRoute = '/dashboard/profile',
  loadingComponent 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const isClient = useIsClient()

  useEffect(() => {
    // Solo proceder si estamos en el cliente
    if (!isClient) return

    // Si no está cargando y no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/login?redirect=${window.location.pathname}`)
      return
    }

    // Si está autenticado pero no tiene el rol adecuado
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role?.toLowerCase()
      const hasPermission = allowedRoles.some(role => 
        role.toLowerCase() === userRole
      )

      if (!hasPermission) {
        router.replace(fallbackRoute)
      }
    }
  }, [isClient, user, isAuthenticated, isLoading, router, allowedRoles, fallbackRoute])

  // Mostrar loading mientras se verifica la autenticación o hasta que se hidrate
  if (!isClient || isLoading) {
    return loadingComponent || (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Verificando permisos...</span>
          </div>
          <p className="mt-3 text-muted">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (se está redirigiendo)
  if (!isAuthenticated) {
    return null
  }

  // Verificar si tiene el rol adecuado
  const userRole = user?.role?.toLowerCase()
  const hasPermission = allowedRoles.some(role => 
    role.toLowerCase() === userRole
  )

  // No mostrar nada si no tiene permisos (se está redirigiendo)
  if (!hasPermission) {
    return null
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}

/**
 * HOC para proteger componentes según roles
 */
export function withRoleGuard<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  allowedRoles: string[],
  options?: {
    fallbackRoute?: string
    loadingComponent?: ReactNode
  }
) {
  return function ProtectedComponent(props: T) {
    return (
      <RoleGuard 
        allowedRoles={allowedRoles}
        fallbackRoute={options?.fallbackRoute}
        loadingComponent={options?.loadingComponent}
      >
        <Component {...props} />
      </RoleGuard>
    )
  }
}
