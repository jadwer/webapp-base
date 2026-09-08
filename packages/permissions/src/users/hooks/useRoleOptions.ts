'use client'

/**
 * Opciones de rol para selects/checkboxes del sub-modulo users.
 * Nombre distinto de `useRoles` (sub-modulo roles) para no colisionar
 * en el barrel del package.
 */

import useSWR from 'swr'
import { getRoleOptions } from '../services/rolesService'
import type { UserRole } from '../types/user'

export const useRoleOptions = () => {
  const { data, error, isLoading, mutate } = useSWR(
    ['user-role-options'],
    () => getRoleOptions(),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const roles: UserRole[] = data || []
  return { roles, isLoading, error, mutate }
}
