/**
 * useWishlist Hooks
 *
 * SWR-based hooks for fetching and mutating wishlists.
 */

'use client'

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { wishlistService } from '../services/wishlistService'

// Re-export types from service
export type { Wishlist, WishlistItem } from '../services/wishlistService'

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch user's wishlists
 */
export function useWishlists() {
  const { data, error, isLoading, mutate } = useSWR(
    'wishlists',
    () => wishlistService.getAll()
  )

  return {
    wishlists: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single wishlist by ID
 */
export function useWishlist(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `wishlists/${id}` : null,
    () => wishlistService.getById(id!)
  )

  return {
    wishlist: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch wishlist items
 */
export function useWishlistItems(wishlistId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    wishlistId ? `wishlists/${wishlistId}/items` : null,
    () => wishlistService.getItems(wishlistId!)
  )

  return {
    items: data || [],
    isLoading,
    error,
    mutate,
  }
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for wishlist mutations
 */
export function useWishlistMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isRemovingItem, setIsRemovingItem] = useState(false)
  const [isMovingToCart, setIsMovingToCart] = useState(false)

  const createWishlist = useCallback(async (data: {
    name: string
    isPublic?: boolean
  }) => {
    setIsCreating(true)
    try {
      const result = await wishlistService.create(data)
      return result
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateWishlist = useCallback(async (id: string, data: {
    name?: string
    isPublic?: boolean
  }) => {
    setIsUpdating(true)
    try {
      const result = await wishlistService.update(id, data)
      return result
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const deleteWishlist = useCallback(async (id: string) => {
    setIsDeleting(true)
    try {
      await wishlistService.delete(id)
    } finally {
      setIsDeleting(false)
    }
  }, [])

  const addItem = useCallback(async (wishlistId: number, productId: number, notes?: string) => {
    setIsAddingItem(true)
    try {
      const result = await wishlistService.addItem(wishlistId, productId, notes)
      return result
    } finally {
      setIsAddingItem(false)
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    setIsRemovingItem(true)
    try {
      await wishlistService.removeItem(itemId)
    } finally {
      setIsRemovingItem(false)
    }
  }, [])

  const moveToCart = useCallback(async (itemId: string) => {
    setIsMovingToCart(true)
    try {
      await wishlistService.moveToCart(itemId)
    } finally {
      setIsMovingToCart(false)
    }
  }, [])

  return {
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addItem,
    removeItem,
    moveToCart,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingItem,
    isRemovingItem,
    isMovingToCart,
  }
}

/**
 * Comprehensive wishlist hook
 */
export function useUserWishlist() {
  const { wishlists, isLoading, mutate } = useWishlists()
  const mutations = useWishlistMutations()

  const defaultWishlist = wishlists[0]

  const addToWishlist = useCallback(async (productId: number, wishlistId?: number) => {
    const targetId = wishlistId || (defaultWishlist ? parseInt(defaultWishlist.id) : undefined)
    if (!targetId) {
      // Create default wishlist if none exists
      const newWishlist = await mutations.createWishlist({
        name: 'Mi Lista de Deseos',
        isPublic: false,
      })
      await mutations.addItem(parseInt(newWishlist.id), productId)
    } else {
      await mutations.addItem(targetId, productId)
    }
    await mutate()
  }, [defaultWishlist, mutations, mutate])

  const removeFromWishlist = useCallback(async (itemId: string) => {
    await mutations.removeItem(itemId)
    await mutate()
  }, [mutations, mutate])

  return {
    wishlists,
    defaultWishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    mutations,
    refresh: mutate,
  }
}
