/**
 * useCycleCountMutations Hook
 *
 * Mutations hook for CycleCount CRUD operations with SWR cache management.
 */

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { cycleCountsService } from '../services/cycleCountsService'
import type { CreateCycleCountRequest, UpdateCycleCountRequest, UseCycleCountMutationsResult } from '../types'

export function useCycleCountMutations(): UseCycleCountMutationsResult {
  const { mutate: globalMutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  // Invalidate all cycle count related caches
  const invalidateCycleCountCaches = useCallback(() => {
    // Invalidate all cycle count lists
    globalMutate(key => Array.isArray(key) && key[0] === 'cycle-counts', undefined, { revalidate: true })

    // Invalidate related caches that might include cycle count data
    globalMutate(
      key =>
        Array.isArray(key) && (key[0] === 'inventory' || key[0] === 'stock' || key[0] === 'dashboard'),
      undefined,
      { revalidate: true }
    )
  }, [globalMutate])

  const createCycleCount = useCallback(
    async (data: CreateCycleCountRequest) => {
      setIsLoading(true)
      try {
        const result = await cycleCountsService.create(data)

        // Invalidate caches to refresh lists
        invalidateCycleCountCaches()

        return result
      } catch (error) {
        console.error('CycleCount creation failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCycleCountCaches]
  )

  const updateCycleCount = useCallback(
    async (id: string, data: UpdateCycleCountRequest) => {
      setIsLoading(true)
      try {
        const result = await cycleCountsService.update(id, data)

        // Invalidate specific cycle count cache
        globalMutate(['cycle-count', id])

        // Invalidate all cycle count lists
        invalidateCycleCountCaches()

        return result
      } catch (error) {
        console.error('CycleCount update failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateCycleCountCaches]
  )

  const deleteCycleCount = useCallback(
    async (id: string) => {
      setIsLoading(true)
      try {
        await cycleCountsService.delete(id)

        // Remove specific cycle count from cache
        globalMutate(['cycle-count', id], undefined, { revalidate: false })

        // Invalidate all cycle count lists
        invalidateCycleCountCaches()
      } catch (error) {
        console.error('CycleCount deletion failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateCycleCountCaches]
  )

  const startCount = useCallback(
    async (id: string) => {
      setIsLoading(true)
      try {
        const result = await cycleCountsService.startCount(id)

        // Invalidate specific cycle count cache
        globalMutate(['cycle-count', id])

        // Invalidate all cycle count lists
        invalidateCycleCountCaches()

        return result
      } catch (error) {
        console.error('CycleCount start failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateCycleCountCaches]
  )

  const recordCount = useCallback(
    async (id: string, countedQuantity: number, notes?: string) => {
      setIsLoading(true)
      try {
        const result = await cycleCountsService.recordCount(id, countedQuantity, notes)

        // Invalidate specific cycle count cache
        globalMutate(['cycle-count', id])

        // Invalidate all cycle count lists
        invalidateCycleCountCaches()

        return result
      } catch (error) {
        console.error('CycleCount record failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateCycleCountCaches]
  )

  const cancelCount = useCallback(
    async (id: string, reason?: string) => {
      setIsLoading(true)
      try {
        const result = await cycleCountsService.cancelCount(id, reason)

        // Invalidate specific cycle count cache
        globalMutate(['cycle-count', id])

        // Invalidate all cycle count lists
        invalidateCycleCountCaches()

        return result
      } catch (error) {
        console.error('CycleCount cancellation failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateCycleCountCaches]
  )

  return {
    createCycleCount,
    updateCycleCount,
    deleteCycleCount,
    startCount,
    recordCount,
    cancelCount,
    isLoading
  }
}
