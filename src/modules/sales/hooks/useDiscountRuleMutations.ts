/**
 * useDiscountRuleMutations Hook
 *
 * Mutations hook for DiscountRule CRUD operations with SWR cache management.
 */

'use client'

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { discountRulesService } from '../services/discountRulesService'
import type { CreateDiscountRuleRequest, UpdateDiscountRuleRequest, UseDiscountRuleMutationsResult } from '../types'

export function useDiscountRuleMutations(): UseDiscountRuleMutationsResult {
  const { mutate: globalMutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  // Invalidate all discount rule related caches
  const invalidateDiscountRuleCaches = useCallback(() => {
    // Invalidate all discount rule lists
    globalMutate(
      key => Array.isArray(key) && key[0] === 'discount-rules',
      undefined,
      { revalidate: true }
    )

    // Invalidate related caches that might include discount rule data
    globalMutate(
      key => Array.isArray(key) && (key[0] === 'sales' || key[0] === 'orders'),
      undefined,
      { revalidate: true }
    )
  }, [globalMutate])

  const createDiscountRule = useCallback(
    async (data: CreateDiscountRuleRequest) => {
      setIsLoading(true)
      try {

        const result = await discountRulesService.create(data)

        // Invalidate caches to refresh lists
        invalidateDiscountRuleCaches()

        return result
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateDiscountRuleCaches]
  )

  const updateDiscountRule = useCallback(
    async (id: string, data: UpdateDiscountRuleRequest) => {
      setIsLoading(true)
      try {

        const result = await discountRulesService.update(id, data)

        // Invalidate specific discount rule cache
        globalMutate(['discount-rule', id])

        // Invalidate all discount rule lists
        invalidateDiscountRuleCaches()

        return result
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateDiscountRuleCaches]
  )

  const deleteDiscountRule = useCallback(
    async (id: string) => {
      setIsLoading(true)
      try {

        await discountRulesService.delete(id)

        // Remove specific discount rule from cache
        globalMutate(['discount-rule', id], undefined, { revalidate: false })

        // Invalidate all discount rule lists
        invalidateDiscountRuleCaches()

      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateDiscountRuleCaches]
  )

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      setIsLoading(true)
      try {

        const result = await discountRulesService.toggleActive(id, isActive)

        // Invalidate specific discount rule cache
        globalMutate(['discount-rule', id])

        // Invalidate all discount rule lists
        invalidateDiscountRuleCaches()

        return result
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [globalMutate, invalidateDiscountRuleCaches]
  )

  const validateCode = useCallback(
    async (code: string) => {
      try {
        const result = await discountRulesService.validateCode(code)
        return result
      } catch (error) {
        throw error
      }
    },
    []
  )

  return {
    createDiscountRule,
    updateDiscountRule,
    deleteDiscountRule,
    toggleActive,
    validateCode,
    isLoading
  }
}
