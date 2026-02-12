'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from './useIsClient'
import { getDefaultRoute } from '@/lib/permissions'

/**
 * Hook para redirigir usuarios autenticados según su rol.
 * Respeta el parámetro ?redirect= en la URL si existe.
 */
export function useAuthRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isClient = useIsClient()

  useEffect(() => {
    // Solo proceder si ya estamos en el cliente, cargó y el usuario está autenticado
    if (isClient && !isLoading && isAuthenticated && user) {
      // Respect redirect param if present (e.g., from login?redirect=/cart?action=quote)
      const redirectParam = searchParams.get('redirect')
      const targetRoute = redirectParam || getDefaultRoute(user)

      router.replace(targetRoute)
    }
  }, [isClient, user, isAuthenticated, isLoading, router, searchParams])

  return {
    user,
    isAuthenticated,
    isLoading,
    // Solo mostrar login cuando estamos en cliente, no está cargando y no está autenticado
    shouldShowLogin: isClient && !isLoading && !isAuthenticated
  }
}
