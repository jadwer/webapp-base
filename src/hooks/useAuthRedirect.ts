'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from './useIsClient'

/**
 * Hook para redirigir usuarios autenticados según su rol
 */
export function useAuthRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const isClient = useIsClient()

  useEffect(() => {
    // Solo proceder si ya estamos en el cliente, cargó y el usuario está autenticado
    if (isClient && !isLoading && isAuthenticated && user) {
      const role = user.role?.toLowerCase()
      
      // Redirigir según el rol del usuario
      switch (role) {
        case 'admin':
        case 'administrator':
          router.replace('/dashboard')
          break
        case 'customer':
        case 'user':
          router.replace('/dashboard/profile')
          break
        default:
          // Rol desconocido, redirigir a perfil por defecto
          router.replace('/dashboard/profile')
          break
      }
    }
  }, [isClient, user, isAuthenticated, isLoading, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    // Solo mostrar login cuando estamos en cliente, no está cargando y no está autenticado
    shouldShowLogin: isClient && !isLoading && !isAuthenticated
  }
}

/**
 * Función helper para obtener la ruta por defecto según el rol
 */
export function getDefaultRouteForRole(role?: string): string {
  if (!role) return '/dashboard/profile'
  
  const normalizedRole = role.toLowerCase()
  
  switch (normalizedRole) {
    case 'admin':
    case 'administrator':
      return '/dashboard'
    case 'customer':
    case 'user':
      return '/dashboard/profile'
    default:
      return '/dashboard/profile'
  }
}
