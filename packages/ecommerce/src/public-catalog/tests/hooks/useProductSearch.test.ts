/**
 * Tests for useProductSearch (debounced typeahead hook)
 * Covers: min-length gating, debounce timing, result mapping, and query switch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductSearch } from '../../hooks/useProductSearch'
import type { EnhancedPublicProduct } from '../../types/publicProduct'

vi.mock('../../services/publicProductsService', () => ({
  publicProductsService: {
    searchProducts: vi.fn(),
  },
}))

import { publicProductsService } from '../../services/publicProductsService'

const mockSearch = publicProductsService.searchProducts as unknown as ReturnType<typeof vi.fn>

function createMockProduct(id: string): EnhancedPublicProduct {
  return {
    id,
    type: 'public-products',
    attributes: {
      name: `Product ${id}`,
      description: null,
      fullDescription: null,
      price: 100,
      cost: null,
      compareAtPrice: null,
      isOnSale: false,
      saleStartsAt: null,
      saleEndsAt: null,
      saleBadge: null,
      sku: `SKU-${id}`,
      iva: true,
      imgPath: null,
      datasheetPath: null,
      imageUrl: `https://example.com/image${id}.jpg`,
      datasheetUrl: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    relationships: {
      unit: { data: null },
      category: { data: null },
      brand: { data: null },
    },
    displayName: `Product ${id}`,
    displayPrice: '$100.00',
    displayCurrency: 'MXN',
    displayCategory: 'Sin categoria',
    displayBrand: 'Sin marca',
    displayUnit: 'Sin unidad',
  }
}

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSearch.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not search for queries under the minimum length', () => {
    renderHook(() => useProductSearch('a'))
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(mockSearch).not.toHaveBeenCalled()
  })

  it('debounces before calling the service', () => {
    mockSearch.mockResolvedValue({ products: [], meta: {}, links: {} })
    renderHook(() => useProductSearch('acido', { debounceMs: 300 }))

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(mockSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(mockSearch).toHaveBeenCalledTimes(1)
    expect(mockSearch).toHaveBeenCalledWith('acido', { size: 8 })
  })

  it('maps service products to light search results', async () => {
    mockSearch.mockResolvedValue({
      products: [createMockProduct('1'), createMockProduct('2')],
      meta: {},
      links: {},
    })

    const { result } = renderHook(() => useProductSearch('prod', { debounceMs: 300 }))

    // Fire the debounce timer, then flush the resolved search promise.
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.results).toHaveLength(2)
    expect(result.current.results[0]).toEqual({
      id: '1',
      name: 'Product 1',
      displayPrice: '$100.00',
      currency: 'MXN',
      imageUrl: 'https://example.com/image1.jpg',
    })
    expect(result.current.loading).toBe(false)
  })
})
