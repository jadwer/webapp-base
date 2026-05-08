'use client'

import useSWR from 'swr'
import { permissionsService } from '../services/permissionsService'

// Hook para obtener todos los permisos.
// La SWR key esta namespaceada como 'roles:permissions' para evitar la
// colision con la `usePermissions` del top-level del paquete (que usa la
// key cruda 'permissions' y devuelve un shape distinto). Aliased en el
// barrel principal como `useRolePermissions`.
export function usePermissions() {
  const { data, error, isLoading, mutate } = useSWR(
    'roles:permissions',
    () => permissionsService.getAll(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache por 5 minutos (los permisos cambian poco)
    }
  )

  return {
    permissions: data || [],
    error,
    isLoading,
    mutate
  }
}

// Hook para obtener permisos agrupados
export function useGroupedPermissions() {
  const { data, error, isLoading, mutate } = useSWR(
    'permissions-grouped',
    () => permissionsService.getGrouped(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  )

  return {
    groupedPermissions: data || {},
    error,
    isLoading,
    mutate
  }
}

// Hook para búsqueda de permisos
export function usePermissionSearch(query: string) {
  const { data, error, isLoading, mutate } = useSWR(
    query ? ['permissions-search', query] : null,
    () => query ? permissionsService.search(query) : [],
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    searchResults: data || [],
    error,
    isLoading,
    mutate
  }
}
