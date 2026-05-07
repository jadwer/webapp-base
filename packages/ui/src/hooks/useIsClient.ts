'use client'

import { useEffect, useState } from 'react'

/**
 * Hook para evitar errores de hidratación
 * Retorna false durante el renderizado del servidor y true después de la hidratación
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
