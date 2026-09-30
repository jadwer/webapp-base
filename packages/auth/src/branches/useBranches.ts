'use client'

import useSWR from 'swr'
import { branchesService } from './branchesService'
import type { Branch } from './types'

export const BRANCHES_KEY = ['branches'] as const

/** Lista de sucursales para la pantalla de administracion y los selects. */
export const useBranches = () => {
  const { data, error, isLoading, mutate } = useSWR(BRANCHES_KEY, () => branchesService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const branches: Branch[] = data || []
  return { branches, isLoading, error, mutate }
}
