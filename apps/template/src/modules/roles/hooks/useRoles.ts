import useSWR, { mutate } from 'swr'
import { useCallback, useMemo } from 'react'
import { Role, RoleFormData } from '../types/role'
import { rolesService } from '../services/rolesService'

// Hook para obtener todos los roles
export function useRoles(include?: string[]) {
  const key = include ? ['roles', include.join(',')] : 'roles'
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => rolesService.getAll(include),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    roles: data || [],
    error,
    isLoading,
    mutate
  }
}

// Hook para obtener un rol específico
export function useRole(id: string | number | null, include?: string[]) {
  const key = id ? (include ? ['role', id.toString(), include.join(',')] : ['role', id.toString()]) : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => id ? rolesService.getById(id, include) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    role: data,
    error,
    isLoading,
    mutate
  }
}

// Hook para operaciones CRUD de roles
export function useRoleActions() {
  const createRole = useCallback(async (data: RoleFormData): Promise<Role> => {
    try {
      const newRole = await rolesService.create(data)
      // Invalidar todas las claves relacionadas con roles
      await mutate(key => typeof key === 'string' && key.startsWith('roles'))
      await mutate(key => Array.isArray(key) && key[0] === 'roles')
      return newRole
    } catch (error) {
      throw error
    }
  }, [])

  const updateRole = useCallback(async (id: string | number, data: RoleFormData): Promise<Role> => {
    try {
      const updatedRole = await rolesService.update(id, data)
      // Invalidar todas las claves relacionadas con roles
      await mutate(key => typeof key === 'string' && key.startsWith('roles'))
      await mutate(key => Array.isArray(key) && key[0] === 'roles')
      return updatedRole
    } catch (error) {
      throw error
    }
  }, [])

  const deleteRole = useCallback(async (id: string | number): Promise<void> => {
    try {
      await rolesService.delete(id)
      // Invalidar todas las claves relacionadas con roles
      await mutate(key => typeof key === 'string' && key.startsWith('roles'))
      await mutate(key => Array.isArray(key) && key[0] === 'roles')
    } catch (error) {
      throw error
    }
  }, [])

  return {
    createRole,
    updateRole,
    deleteRole
  }
}

// Hook para estadísticas de roles
export function useRoleStats() {
  const { roles, isLoading, error, mutate } = useRoles(['permissions'])

  const stats = useMemo(() => {
    return {
      total: roles.length,
      withPermissions: roles.filter(role => role.permissions && role.permissions.length > 0).length,
      withoutPermissions: roles.filter(role => !role.permissions || role.permissions.length === 0).length
    }
  }, [roles])

  return {
    stats,
    error,
    isLoading,
    mutate
  }
}
