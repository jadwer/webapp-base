/**
 * Tests for useLocalCart and useLocalCartCount hooks
 * Tests localStorage-based shopping cart functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLocalCart, useLocalCartCount } from '../../hooks/useLocalCart'
import type { EnhancedPublicProduct } from '../../types/publicProduct'

// Constants matching the hook
const CART_STORAGE_KEY = 'laborwasser_cart'

// Mock product factory
function createMockProduct(id: string = '1', overrides: Partial<EnhancedPublicProduct> = {}): EnhancedPublicProduct {
  return {
    id,
    type: 'public-products',
    attributes: {
      name: `Product ${id}`,
      description: `Description for product ${id}`,
      price: 100,
      sku: `SKU-${id}`,
      barcode: `BAR-${id}`,
      imageUrl: `https://example.com/image${id}.jpg`,
      isActive: true,
      iva: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    relationships: {
      unit: { data: { id: '1', type: 'units' } },
      category: { data: { id: '1', type: 'categories' } },
      brand: { data: { id: '1', type: 'brands' } },
    },
    displayName: `Product ${id}`,
    displayPrice: '$100.00',
    displayUnit: 'pz',
    displayCategory: 'Category 1',
    displayBrand: 'Brand 1',
    unit: {
      id: '1',
      type: 'units',
      attributes: {
        name: 'Pieces',
        abbreviation: 'pz',
        description: null,
      },
    },
    category: {
      id: '1',
      type: 'categories',
      attributes: {
        name: 'Category 1',
        description: null,
        slug: 'category-1',
        imageUrl: null,
      },
    },
    brand: {
      id: '1',
      type: 'brands',
      attributes: {
        name: 'Brand 1',
        description: null,
        slug: 'brand-1',
        logoUrl: null,
        websiteUrl: null,
      },
    },
    ...overrides,
  }
}

describe('useLocalCart', () => {
  // Setup and cleanup - use real localStorage
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with empty cart', async () => {
      const { result } = renderHook(() => useLocalCart())

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.items).toEqual([])
      expect(result.current.isEmpty).toBe(true)
      expect(result.current.totals.itemCount).toBe(0)
      expect(result.current.totals.subtotal).toBe(0)
    })

    it('should load cart from localStorage on mount', async () => {
      // Pre-populate localStorage
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.items.length).toBe(1)
      expect(result.current.items[0].name).toBe('Test Product')
      expect(result.current.items[0].quantity).toBe(2)
    })
  })

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const mockProduct = createMockProduct('1')

      act(() => {
        result.current.addToCart(mockProduct, 1)
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(1)
      })

      expect(result.current.items[0].productId).toBe('1')
      expect(result.current.items[0].quantity).toBe(1)
      expect(result.current.items[0].name).toBe('Product 1')
    })

    it('should increment quantity if product already in cart', async () => {
      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const mockProduct = createMockProduct('1')

      // Add product first time
      act(() => {
        result.current.addToCart(mockProduct, 1)
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(1)
      })

      // Add same product again
      act(() => {
        result.current.addToCart(mockProduct, 2)
      })

      await waitFor(() => {
        expect(result.current.items[0].quantity).toBe(3)
      })

      expect(result.current.items.length).toBe(1) // Still 1 item
    })

    it('should save cart to localStorage after adding', async () => {
      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const mockProduct = createMockProduct('1')

      act(() => {
        result.current.addToCart(mockProduct, 1)
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(1)
      })

      const stored = localStorage.getItem(CART_STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsedCart = JSON.parse(stored!)
      expect(parsedCart.items.length).toBe(1)
      expect(parsedCart.items[0].productId).toBe('1')
    })
  })

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.items.length).toBe(1)
      })

      act(() => {
        result.current.removeFromCart('1')
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(0)
      })

      expect(result.current.isEmpty).toBe(true)
    })

    it('should only remove specified item', async () => {
      // Pre-populate cart with 2 items
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'item_2_124',
            productId: '2',
            name: 'Product 2',
            price: 200,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-2',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.items.length).toBe(2)
      })

      act(() => {
        result.current.removeFromCart('1')
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(1)
      })

      expect(result.current.items[0].productId).toBe('2')
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.items.length).toBe(1)
      })

      act(() => {
        result.current.updateQuantity('1', 5)
      })

      await waitFor(() => {
        expect(result.current.items[0].quantity).toBe(5)
      })
    })

    it('should remove item if quantity is set to 0', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 2,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.items.length).toBe(1)
      })

      act(() => {
        result.current.updateQuantity('1', 0)
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(0)
      })
    })
  })

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'item_2_124',
            productId: '2',
            name: 'Product 2',
            price: 200,
            quantity: 2,
            imageUrl: null,
            sku: 'SKU-2',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.items.length).toBe(2)
      })

      act(() => {
        result.current.clearCart()
      })

      await waitFor(() => {
        expect(result.current.items.length).toBe(0)
      })

      expect(result.current.isEmpty).toBe(true)
    })
  })

  describe('totals calculation', () => {
    it('should calculate correct subtotal and tax', async () => {
      // Pre-populate cart with mixed IVA products
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 2, // subtotal: 200, iva: 32
            iva: true,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'item_2_124',
            productId: '2',
            name: 'Product 2',
            price: 50,
            quantity: 3, // subtotal: 150, iva: 0 (exempt)
            iva: false,
            imageUrl: null,
            sku: 'SKU-2',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.totals.subtotal).toBe(350) // 200 + 150
      expect(result.current.totals.taxAmount).toBe(32) // only Product 1: 200 * 0.16
      expect(result.current.totals.total).toBe(382) // 350 + 32
      expect(result.current.totals.itemCount).toBe(5) // 2 + 3
      expect(result.current.totals.uniqueItems).toBe(2)
    })

    it('should default iva to true for items without iva field (backwards compatibility)', async () => {
      // Simulate old cart format without iva field
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 1,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      // Without iva field, should default to true (16% tax)
      expect(result.current.totals.subtotal).toBe(100)
      expect(result.current.totals.taxAmount).toBe(16) // 100 * 0.16
      expect(result.current.totals.total).toBe(116)
    })
  })

  describe('isInCart and getQuantity', () => {
    it('should correctly identify items in cart', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 3,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.isInCart('1')).toBe(true)
      expect(result.current.isInCart('999')).toBe(false)
      expect(result.current.getQuantity('1')).toBe(3)
      expect(result.current.getQuantity('999')).toBe(0)
    })
  })

  describe('getCartForCheckout', () => {
    it('should return serializable checkout data with tax info', async () => {
      // Pre-populate cart
      const existingCart = {
        items: [
          {
            id: 'item_1_123',
            productId: '1',
            name: 'Product 1',
            price: 100,
            quantity: 2,
            iva: true,
            imageUrl: null,
            sku: 'SKU-1',
            unitName: 'pz',
            categoryName: 'Category',
            brandName: 'Brand',
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

      const { result } = renderHook(() => useLocalCart())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const checkoutData = result.current.getCartForCheckout()

      expect(checkoutData.items.length).toBe(1)
      expect(checkoutData.items[0].productId).toBe('1')
      expect(checkoutData.items[0].quantity).toBe(2)
      expect(checkoutData.items[0].price).toBe(100)
      expect(checkoutData.items[0].iva).toBe(true)
      expect(checkoutData.subtotal).toBe(200)
      expect(checkoutData.taxAmount).toBe(32) // 200 * 0.16
      expect(checkoutData.total).toBe(232) // 200 + 32
      expect(checkoutData.itemCount).toBe(2)
    })
  })
})

describe('useLocalCartCount', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return 0 for empty cart', async () => {
    const { result } = renderHook(() => useLocalCartCount())

    // Need to wait for useEffect to run
    await waitFor(() => {
      expect(result.current).toBe(0)
    })
  })

  it('should return correct count from localStorage', async () => {
    // Pre-populate cart
    const existingCart = {
      items: [
        {
          id: 'item_1_123',
          productId: '1',
          name: 'Product 1',
          price: 100,
          quantity: 2,
          imageUrl: null,
          sku: 'SKU-1',
          unitName: 'pz',
          categoryName: 'Category',
          brandName: 'Brand',
          addedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'item_2_124',
          productId: '2',
          name: 'Product 2',
          price: 200,
          quantity: 3,
          imageUrl: null,
          sku: 'SKU-2',
          unitName: 'pz',
          categoryName: 'Category',
          brandName: 'Brand',
          addedAt: '2024-01-01T00:00:00Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart))

    const { result } = renderHook(() => useLocalCartCount())

    await waitFor(() => {
      expect(result.current).toBe(5) // 2 + 3
    })
  })

  it('should update count when cart changes via storage event (cross-tab)', async () => {
    const { result } = renderHook(() => useLocalCartCount())

    await waitFor(() => {
      expect(result.current).toBe(0)
    })

    // Simulate cart update from another browser tab via storage event
    const newCart = {
      items: [
        {
          id: 'item_1_123',
          productId: '1',
          name: 'Product 1',
          price: 100,
          quantity: 4,
          imageUrl: null,
          sku: 'SKU-1',
          unitName: 'pz',
          categoryName: 'Category',
          brandName: 'Brand',
          addedAt: '2024-01-01T00:00:00Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))

    // Dispatch storage event (simulates change from another tab)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(newCart),
        oldValue: null,
        storageArea: localStorage,
      }))
    })

    await waitFor(() => {
      expect(result.current).toBe(4)
    })
  })

  it('should update count when cart changes from same tab via useLocalCart', async () => {
    // Render both hooks to test same-tab sync
    const { result: cartResult } = renderHook(() => useLocalCart())
    const { result: countResult } = renderHook(() => useLocalCartCount())

    // Wait for initialization
    await waitFor(() => {
      expect(cartResult.current.isInitialized).toBe(true)
    })

    await waitFor(() => {
      expect(countResult.current).toBe(0)
    })

    // Create a mock product
    const mockProduct: EnhancedPublicProduct = {
      id: '1',
      type: 'public-products',
      attributes: {
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        sku: 'SKU-1',
        barcode: 'BAR-1',
        imageUrl: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      relationships: {
        unit: { data: { id: '1', type: 'units' } },
        category: { data: { id: '1', type: 'categories' } },
        brand: { data: { id: '1', type: 'brands' } },
      },
      displayName: 'Test Product',
      displayPrice: '$100.00',
      displayUnit: 'pz',
      displayCategory: 'Category 1',
      displayBrand: 'Brand 1',
      unit: {
        id: '1',
        type: 'units',
        attributes: { name: 'Pieces', abbreviation: 'pz', description: null },
      },
      category: {
        id: '1',
        type: 'categories',
        attributes: { name: 'Category 1', description: null, slug: 'cat-1', imageUrl: null },
      },
      brand: {
        id: '1',
        type: 'brands',
        attributes: { name: 'Brand 1', description: null, slug: 'brand-1', logoUrl: null, websiteUrl: null },
      },
    }

    // Add product to cart using useLocalCart
    act(() => {
      cartResult.current.addToCart(mockProduct, 3)
    })

    // Verify the count hook updates (same-tab sync)
    await waitFor(() => {
      expect(countResult.current).toBe(3)
    })

    // Add more of the same product
    act(() => {
      cartResult.current.addToCart(mockProduct, 2)
    })

    await waitFor(() => {
      expect(countResult.current).toBe(5)
    })
  })
})
