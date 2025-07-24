'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from './useIsClient'
import { getDefaultRoute } from '@/lib/permissions'

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
      console.log('🔍 useAuthRedirect - Usuario autenticado:', user)
      
      const defaultRoute = getDefaultRoute(user)
      console.log('🔍 useAuthRedirect - Redirigiendo a:', defaultRoute)
      
      router.replace(defaultRoute)
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
