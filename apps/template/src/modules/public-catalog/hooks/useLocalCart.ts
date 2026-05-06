/**
 * useLocalCart Hook
 *
 * Complete localStorage-based shopping cart for public/guest users.
 * No backend required - cart persists in browser until checkout.
 *
 * Features:
 * - Add/remove/update cart items
 * - Quantity management
 * - Cart totals calculation
 * - Event-based updates for cross-component sync
 * - TypeScript strict typing
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { EnhancedPublicProduct } from '../types/publicProduct'

// ============================================
// Types
// ============================================

export interface LocalCartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  iva: boolean
  imageUrl: string | null
  sku: string | null
  unitName: string | null
  categoryName: string | null
  brandName: string | null
  addedAt: string
}

export interface LocalCart {
  items: LocalCartItem[]
  createdAt: string
  updatedAt: string
}

export interface CartTotals {
  subtotal: number
  taxAmount: number
  total: number
  itemCount: number
  uniqueItems: number
}

// ============================================
// Constants
// ============================================

const CART_STORAGE_KEY = 'laborwasser_cart'

// ============================================
// Internal Sync System (same-tab updates)
// ============================================

type CartListener = () => void
const cartListeners = new Set<CartListener>()

function notifyCartListeners() {
  // Use queueMicrotask to avoid updating state during render of another component
  queueMicrotask(() => {
    cartListeners.forEach(listener => listener())
  })
}

function subscribeToCart(listener: CartListener): () => void {
  cartListeners.add(listener)
  return () => cartListeners.delete(listener)
}

// ============================================
// Helper Functions
// ============================================

function getEmptyCart(): LocalCart {
  return {
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function loadCartFromStorage(): LocalCart {
  if (typeof window === 'undefined') {
    return getEmptyCart()
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as LocalCart
      // Validate structure
      if (parsed && Array.isArray(parsed.items)) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }

  return getEmptyCart()
}

function saveCartToStorage(cart: LocalCart): void {
  if (typeof window === 'undefined') return

  try {
    const updated = { ...cart, updatedAt: new Date().toISOString() }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated))
    // Notify same-tab listeners
    notifyCartListeners()
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

function productToCartItem(product: EnhancedPublicProduct, quantity: number = 1): LocalCartItem {
  return {
    id: `item_${product.id}_${Date.now()}`,
    productId: product.id,
    name: product.attributes.name,
    price: product.attributes.price ?? 0,
    quantity,
    iva: product.attributes.iva ?? true,
    imageUrl: product.attributes.imageUrl,
    sku: product.attributes.sku,
    unitName: product.unit?.attributes.name ?? null,
    categoryName: product.category?.attributes.name ?? null,
    brandName: product.brand?.attributes.name ?? null,
    addedAt: new Date().toISOString()
  }
}

// ============================================
// Main Hook
// ============================================

export function useLocalCart() {
  const [cart, setCart] = useState<LocalCart>(getEmptyCart)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadedCart = loadCartFromStorage()
    setCart(loadedCart)
    setIsInitialized(true)
  }, [])

  // Listen for cart updates from OTHER browser tabs only
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setCart(loadCartFromStorage())
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Calculate totals
  const totals = useMemo<CartTotals>(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const taxAmount = cart.items.reduce((sum, item) => {
      // Default to true for backwards compatibility with existing carts without iva field
      if (item.iva !== false) {
        return sum + (item.price * item.quantity * 0.16)
      }
      return sum
    }, 0)
    const total = subtotal + taxAmount
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const uniqueItems = cart.items.length

    return { subtotal, taxAmount, total, itemCount, uniqueItems }
  }, [cart.items])

  // Add product to cart
  const addToCart = useCallback((product: EnhancedPublicProduct, quantity: number = 1) => {
    setCart(prevCart => {
      // Check if product already exists
      const existingIndex = prevCart.items.findIndex(item => item.productId === product.id)

      let newItems: LocalCartItem[]

      if (existingIndex >= 0) {
        // Update quantity
        newItems = [...prevCart.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        }
      } else {
        // Add new item
        const newItem = productToCartItem(product, quantity)
        newItems = [...prevCart.items, newItem]
      }

      const newCart = { ...prevCart, items: newItems }
      saveCartToStorage(newCart)
      return newCart
    })
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.productId !== productId)
      const newCart = { ...prevCart, items: newItems }
      saveCartToStorage(newCart)
      return newCart
    })
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
      const newCart = { ...prevCart, items: newItems }
      saveCartToStorage(newCart)
      return newCart
    })
  }, [removeFromCart])

  // Increment quantity
  const incrementQuantity = useCallback((productId: string) => {
    const item = cart.items.find(i => i.productId === productId)
    if (item) {
      updateQuantity(productId, item.quantity + 1)
    }
  }, [cart.items, updateQuantity])

  // Decrement quantity
  const decrementQuantity = useCallback((productId: string) => {
    const item = cart.items.find(i => i.productId === productId)
    if (item) {
      updateQuantity(productId, item.quantity - 1)
    }
  }, [cart.items, updateQuantity])

  // Clear entire cart
  const clearCart = useCallback(() => {
    const emptyCart = getEmptyCart()
    setCart(emptyCart)
    saveCartToStorage(emptyCart)
  }, [])

  // Check if product is in cart
  const isInCart = useCallback((productId: string): boolean => {
    return cart.items.some(item => item.productId === productId)
  }, [cart.items])

  // Get quantity of product in cart
  const getQuantity = useCallback((productId: string): number => {
    const item = cart.items.find(i => i.productId === productId)
    return item?.quantity ?? 0
  }, [cart.items])

  // Get cart for checkout (serializable format)
  const getCartForCheckout = useCallback(() => {
    return {
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        iva: item.iva
      })),
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      itemCount: totals.itemCount
    }
  }, [cart.items, totals])

  return {
    // State
    cart,
    items: cart.items,
    totals,
    isInitialized,
    isEmpty: cart.items.length === 0,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,

    // Queries
    isInCart,
    getQuantity,
    getCartForCheckout
  }
}

// ============================================
// Utility Hook for Item Count Only (lightweight)
// ============================================

export function useLocalCartCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY)
        if (cartData) {
          const cart = JSON.parse(cartData) as LocalCart
          const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
          setCount(itemCount)
        } else {
          setCount(0)
        }
      } catch {
        setCount(0)
      }
    }

    // Initial load
    updateCount()

    // Listen for changes from OTHER browser tabs
    window.addEventListener('storage', updateCount)

    // Listen for changes from SAME browser tab
    const unsubscribe = subscribeToCart(updateCount)

    return () => {
      window.removeEventListener('storage', updateCount)
      unsubscribe()
    }
  }, [])

  return count
}

export default useLocalCart
