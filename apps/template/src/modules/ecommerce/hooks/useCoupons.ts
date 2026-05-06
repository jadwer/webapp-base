/**
 * useCoupons Hooks
 *
 * SWR-based hooks for fetching and applying coupons.
 */

'use client'

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { couponsService, Coupon } from '../services/couponsService'

// Re-export the Coupon type from service
export type { Coupon } from '../services/couponsService'

export interface CouponValidation {
  valid: boolean
  coupon?: Coupon
  discountAmount?: number
  message?: string
  errors?: string[]
}

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch all coupons (admin)
 */
export function useCoupons(filters?: {
  isActive?: boolean
  search?: string
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['coupons', filters],
    () => couponsService.getAll(filters)
  )

  return {
    coupons: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single coupon
 */
export function useCoupon(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `coupons/${id}` : null,
    () => couponsService.getById(id!)
  )

  return {
    coupon: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to validate a coupon code
 */
export function useCouponValidation(code?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    code ? ['coupon-validate', code] : null,
    () => couponsService.validate(code!)
  )

  return {
    validation: data,
    isLoading,
    error,
    revalidate: mutate,
  }
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for coupon admin mutations
 */
export function useCouponMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const createCoupon = useCallback(async (data: Omit<Coupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => {
    setIsCreating(true)
    try {
      const result = await couponsService.create(data)
      return result
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateCoupon = useCallback(async (id: string, data: Partial<Coupon>) => {
    setIsUpdating(true)
    try {
      const result = await couponsService.update(id, data)
      return result
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const deleteCoupon = useCallback(async (id: string) => {
    setIsDeleting(true)
    try {
      await couponsService.delete(id)
    } finally {
      setIsDeleting(false)
    }
  }, [])

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    setIsUpdating(true)
    try {
      const result = await couponsService.update(id, { isActive })
      return result
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleActive,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

/**
 * Hook for cart coupon operations
 */
export function useCartCoupon(cartId?: string) {
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [validationResult, setValidationResult] = useState<CouponValidation | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateCoupon = useCallback(async (code: string, _cartTotal?: number) => {
    const result = await couponsService.validate(code)
    setValidationResult(result)
    return result
  }, [])

  const applyCoupon = useCallback(async (code: string) => {
    if (!cartId) throw new Error('Cart ID required')
    setIsApplying(true)
    try {
      const result = await couponsService.applyToCart(cartId, code)
      return result
    } finally {
      setIsApplying(false)
    }
  }, [cartId])

  const removeCoupon = useCallback(async () => {
    if (!cartId) throw new Error('Cart ID required')
    setIsRemoving(true)
    try {
      await couponsService.removeFromCart(cartId)
      setValidationResult(null)
    } finally {
      setIsRemoving(false)
    }
  }, [cartId])

  return {
    validateCoupon,
    applyCoupon,
    removeCoupon,
    validationResult,
    isApplying,
    isRemoving,
  }
}
