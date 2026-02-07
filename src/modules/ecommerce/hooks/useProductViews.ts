'use client'

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import { productViewService } from '../services/productViewService'
import { useAuth } from '@/modules/auth'

/**
 * Hook to fetch recently viewed products for the authenticated user.
 */
export function useRecentlyViewed(limit: number = 8) {
  const { user } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    user ? ['recently-viewed', limit] : null,
    () => productViewService.getRecentlyViewed(limit)
  )

  return {
    recentProducts: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to auto-track a product view when the component mounts.
 * Uses a ref to prevent duplicate tracking on re-renders.
 * Should be used on the product detail page.
 */
export function useTrackProductView(productId: string | undefined) {
  const trackedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!productId || trackedRef.current === productId) return

    trackedRef.current = productId
    productViewService.trackView(productId)
  }, [productId])
}
