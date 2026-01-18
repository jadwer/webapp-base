/**
 * useProductBatchMutations Hook
 * 
 * Mutations hook for ProductBatch CRUD operations with SWR cache management.
 */

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { productBatchService } from '../services/productBatchService'
import type {
  CreateProductBatchRequest,
  UpdateProductBatchRequest,
  UseProductBatchMutationsResult
} from '../types'

export function useProductBatchMutations(): UseProductBatchMutationsResult {
  const { mutate: globalMutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  // Invalidate all product batch related caches
  const invalidateProductBatchCaches = useCallback(() => {
    // Invalidate all product batch lists
    globalMutate(
      key => Array.isArray(key) && key[0] === 'product-batches',
      undefined,
      { revalidate: true }
    )
    
    // Invalidate related caches that might include product batch data
    globalMutate(
      key => Array.isArray(key) && (
        key[0] === 'inventory' ||
        key[0] === 'stock' ||
        key[0] === 'dashboard'
      ),
      undefined,
      { revalidate: true }
    )
  }, [globalMutate])

  const createProductBatch = useCallback(async (data: CreateProductBatchRequest) => {
    setIsLoading(true)
    try {
      const result = await productBatchService.create(data)

      // Invalidate caches to refresh lists
      invalidateProductBatchCaches()

      return result
    } catch (error) {
      console.error('ProductBatch creation failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [invalidateProductBatchCaches])

  const updateProductBatch = useCallback(async (id: string, data: UpdateProductBatchRequest) => {
    setIsLoading(true)
    try {
      const result = await productBatchService.update(id, data)

      // Invalidate specific product batch cache
      globalMutate(['product-batch', id])

      // Invalidate all product batch lists
      invalidateProductBatchCaches()

      return result
    } catch (error) {
      console.error('ProductBatch update failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [globalMutate, invalidateProductBatchCaches])

  const deleteProductBatch = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      await productBatchService.delete(id)

      // Remove specific product batch from cache
      globalMutate(['product-batch', id], undefined, { revalidate: false })

      // Invalidate all product batch lists
      invalidateProductBatchCaches()
    } catch (error) {
      console.error('ProductBatch deletion failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [globalMutate, invalidateProductBatchCaches])

  return {
    createProductBatch,
    updateProductBatch,
    deleteProductBatch,
    isLoading
  }
}