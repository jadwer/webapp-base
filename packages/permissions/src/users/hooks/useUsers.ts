'use client'

/**
 * SWR hooks del sub-modulo users (v2, patron contacts).
 * Keys serializadas por filtros + pagina para que cada combinacion
 * tenga su propia entrada de cache.
 */

import useSWR from 'swr'
import { useCallback } from 'react'
import { usersService, DEFAULT_PAGE_SIZE } from '../services/usersService'
import type { User, UserFilters, UserFormData, UsersMeta } from '../types/user'

const listKey = (filters: UserFilters, page: number, pageSize: number) => [
  'users',
  page,
  pageSize,
  filters.search || '',
  filters.role || '',
  filters.status || '',
  filters.trashed || '',
]

export const useUsers = (
  filters: UserFilters = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  const { data, error, isLoading, mutate } = useSWR(
    listKey(filters, page, pageSize),
    () => usersService.getUsers(filters, page, pageSize),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const users: User[] = data?.users || []
  const meta: UsersMeta = data?.meta || {}

  return { users, meta, isLoading, error, mutate }
}

export const useUser = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['user', id] : null,
    () => (id ? usersService.getUser(id) : null),
    { revalidateOnFocus: false }
  )

  return { user: data || undefined, isLoading, error, mutate }
}

/** Revalida todas las listas y, si aplica, el detalle del usuario. */
const revalidateUserKeys = async (id?: string) => {
  const { mutate } = await import('swr')
  mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === 'users' || (key[0] === 'user' && (!id || key[1] === id)))
  )
}

export const useUserMutations = () => {
  const createUser = useCallback(async (data: UserFormData) => {
    const result = await usersService.createUser(data)
    await revalidateUserKeys()
    return result
  }, [])

  const updateUser = useCallback(async (id: string, data: UserFormData) => {
    const result = await usersService.updateUser(id, data)
    await revalidateUserKeys(id)
    return result
  }, [])

  const removeUser = useCallback(async (id: string) => {
    await usersService.deleteUser(id)
    await revalidateUserKeys(id)
  }, [])

  const restoreUser = useCallback(async (id: string) => {
    const result = await usersService.restoreUser(id)
    await revalidateUserKeys(id)
    return result
  }, [])

  return { createUser, updateUser, removeUser, restoreUser }
}
