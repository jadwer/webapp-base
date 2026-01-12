/**
 * useProductReviews Hooks
 *
 * SWR-based hooks for fetching and mutating product reviews.
 */

'use client'

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { productReviewsService, type CreateReviewRequest } from '../services/productReviewsService'

// Re-export types from service
export type { ProductReview, RatingSummary, CreateReviewRequest } from '../services/productReviewsService'

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch reviews for a product
 */
export function useProductReviews(productId?: number, approvedOnly: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? ['product-reviews', productId, approvedOnly] : null,
    () => productReviewsService.getByProduct(productId!, approvedOnly)
  )

  return {
    reviews: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch rating summary for a product
 */
export function useRatingSummary(productId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `product-reviews/${productId}/summary` : null,
    () => productReviewsService.getRatingSummary(productId!)
  )

  return {
    summary: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch product recommendations
 */
export function useProductRecommendations(productId?: number) {
  const { data, error, isLoading } = useSWR(
    productId ? `product-recommendations/${productId}` : null,
    () => productReviewsService.getRecommendations(productId!)
  )

  return {
    frequentlyBought: data?.frequentlyBoughtTogether || [],
    similarProducts: data?.similarProducts || [],
    customersAlsoViewed: data?.customersAlsoViewed || [],
    isLoading,
    error,
  }
}

/**
 * Hook to fetch personalized recommendations
 */
export function usePersonalizedRecommendations() {
  const { data, error, isLoading } = useSWR(
    'recommendations/personalized',
    () => productReviewsService.getPersonalizedRecommendations()
  )

  return {
    recommendations: data || [],
    isLoading,
    error,
  }
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for review mutations
 */
export function useReviewMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const createReview = useCallback(async (data: CreateReviewRequest) => {
    setIsCreating(true)
    try {
      const result = await productReviewsService.create(data)
      return result
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateReview = useCallback(async (id: string, data: {
    rating?: number
    title?: string
    content?: string
  }) => {
    setIsUpdating(true)
    try {
      const result = await productReviewsService.update(id, data)
      return result
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const deleteReview = useCallback(async (id: string) => {
    setIsDeleting(true)
    try {
      await productReviewsService.delete(id)
    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    createReview,
    updateReview,
    deleteReview,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

/**
 * Comprehensive hook for product reviews
 */
export function useProductReviewsWithSummary(productId?: number) {
  const { reviews, isLoading: isLoadingReviews, mutate } = useProductReviews(productId)
  const { summary, isLoading: isLoadingSummary } = useRatingSummary(productId)
  const mutations = useReviewMutations()

  const submitReview = useCallback(async (data: Omit<CreateReviewRequest, 'productId'>) => {
    if (!productId) throw new Error('Product ID required')
    await mutations.createReview({ ...data, productId })
    await mutate()
  }, [productId, mutations, mutate])

  return {
    reviews,
    summary,
    isLoading: isLoadingReviews || isLoadingSummary,
    submitReview,
    mutations,
    refresh: mutate,
  }
}
