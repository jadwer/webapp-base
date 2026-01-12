/**
 * CATALOG MODULE - OFFERS SERVICE TESTS
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { offersService } from '../../services/offersService'
import { productService } from '@/modules/products'

// Mock product service
vi.mock('@/modules/products', () => ({
  productService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    updateProduct: vi.fn()
  }
}))

describe('Offers Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all offers (products where price > cost)', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, cost: 80, isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', name: 'Product 2', price: 50, cost: 50, isActive: true, createdAt: '', updatedAt: '' }, // Not an offer
        { id: '3', name: 'Product 3', price: 200, cost: 150, isActive: true, createdAt: '', updatedAt: '' }
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 3 }
      })

      // Act
      const result = await offersService.getAll()

      // Assert
      expect(result.data).toHaveLength(2) // Only products where price > cost
      expect(result.data[0].name).toBe('Product 3') // Sorted by discount percent descending
      expect(result.data[1].name).toBe('Product 1')
      expect(productService.getProducts).toHaveBeenCalledWith({
        include: ['unit', 'category', 'brand']
      })
    })

    it('should apply search filter', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Apple iPhone', sku: 'IP-001', price: 1000, cost: 800, isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', name: 'Samsung Galaxy', sku: 'SG-001', price: 900, cost: 700, isActive: true, createdAt: '', updatedAt: '' }
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 2 }
      })

      // Act
      const result = await offersService.getAll({ search: 'iPhone' })

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Apple iPhone')
    })

    it('should apply minDiscount filter', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, cost: 90, isActive: true, createdAt: '', updatedAt: '' }, // 10% discount
        { id: '2', name: 'Product 2', price: 100, cost: 70, isActive: true, createdAt: '', updatedAt: '' }  // 30% discount
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 2 }
      })

      // Act
      const result = await offersService.getAll({ minDiscount: 20 })

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Product 2')
    })

    it('should return empty array when no offers exist', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, cost: 100, isActive: true, createdAt: '', updatedAt: '' } // No discount
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 1 }
      })

      // Act
      const result = await offersService.getAll()

      // Assert
      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      // Arrange
      vi.mocked(productService.getProducts).mockRejectedValue(new Error('API Error'))

      // Act & Assert
      await expect(offersService.getAll()).rejects.toThrow('API Error')
    })
  })

  describe('getById', () => {
    it('should fetch a single offer by product ID', async () => {
      // Arrange
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        cost: 80,
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }

      vi.mocked(productService.getProduct).mockResolvedValue({
        data: mockProduct
      })

      // Act
      const result = await offersService.getById('1')

      // Assert
      expect(result.data).not.toBeNull()
      expect(result.data?.discount).toBe(20)
      expect(result.data?.discountPercent).toBe(20)
      expect(productService.getProduct).toHaveBeenCalledWith('1', ['unit', 'category', 'brand'])
    })

    it('should return null for product without offer', async () => {
      // Arrange
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        cost: 100, // No discount
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }

      vi.mocked(productService.getProduct).mockResolvedValue({
        data: mockProduct
      })

      // Act
      const result = await offersService.getById('1')

      // Assert
      expect(result.data).toBeNull()
    })
  })

  describe('getProductsForOffer', () => {
    it('should fetch products available for offers', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product A', price: 100, cost: null, isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', name: 'Product B', price: 100, cost: 80, isActive: true, createdAt: '', updatedAt: '' }
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 2 }
      })

      // Act
      const result = await offersService.getProductsForOffer()

      // Assert
      expect(result.data).toHaveLength(2)
      // Products without offers should come first
      expect(result.data[0].hasOffer).toBe(false)
      expect(result.data[1].hasOffer).toBe(true)
    })

    it('should apply search filter', async () => {
      // Arrange
      vi.mocked(productService.getProducts).mockResolvedValue({
        data: [{ id: '1', name: 'Searched Product', price: 100, cost: null, isActive: true, createdAt: '', updatedAt: '' }],
        meta: { total: 1 }
      })

      // Act
      await offersService.getProductsForOffer('Searched')

      // Assert
      expect(productService.getProducts).toHaveBeenCalledWith({
        include: ['category', 'brand'],
        name: 'Searched'
      })
    })
  })

  describe('create', () => {
    it('should create an offer by updating product prices', async () => {
      // Arrange
      const mockUpdatedProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        cost: 80,
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }

      vi.mocked(productService.updateProduct).mockResolvedValue({ data: mockUpdatedProduct })
      vi.mocked(productService.getProduct).mockResolvedValue({ data: mockUpdatedProduct })

      // Act
      const result = await offersService.create({
        productId: '1',
        price: 100,
        cost: 80
      })

      // Assert
      expect(result.data).not.toBeNull()
      expect(result.data?.discount).toBe(20)
      expect(productService.updateProduct).toHaveBeenCalledWith('1', {
        price: 100,
        cost: 80
      })
    })

    it('should throw error when price <= cost', async () => {
      // Act & Assert
      await expect(offersService.create({
        productId: '1',
        price: 80,
        cost: 100
      })).rejects.toThrow('El precio debe ser mayor que el costo para crear una oferta')
    })
  })

  describe('update', () => {
    it('should update an offer by updating product prices', async () => {
      // Arrange
      const mockUpdatedProduct = {
        id: '1',
        name: 'Test Product',
        price: 120,
        cost: 90,
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }

      vi.mocked(productService.updateProduct).mockResolvedValue({ data: mockUpdatedProduct })
      vi.mocked(productService.getProduct).mockResolvedValue({ data: mockUpdatedProduct })

      // Act
      const result = await offersService.update('1', {
        price: 120,
        cost: 90
      })

      // Assert
      expect(result.data).not.toBeNull()
      expect(result.data?.discount).toBe(30)
      expect(result.data?.discountPercent).toBe(25)
    })

    it('should throw error when price <= cost', async () => {
      // Act & Assert
      await expect(offersService.update('1', {
        price: 100,
        cost: 100
      })).rejects.toThrow('El precio debe ser mayor que el costo para mantener una oferta')
    })
  })

  describe('remove', () => {
    it('should remove an offer by setting cost = price', async () => {
      // Arrange
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        cost: 80,
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }

      vi.mocked(productService.getProduct).mockResolvedValue({ data: mockProduct })
      vi.mocked(productService.updateProduct).mockResolvedValue({ data: { ...mockProduct, cost: 100 } })

      // Act
      const result = await offersService.remove('1')

      // Assert
      expect(result.success).toBe(true)
      expect(productService.updateProduct).toHaveBeenCalledWith('1', {
        cost: 100
      })
    })

    it('should throw error when product not found', async () => {
      // Arrange
      vi.mocked(productService.getProduct).mockResolvedValue({ data: null })

      // Act & Assert
      await expect(offersService.remove('999')).rejects.toThrow('Producto no encontrado')
    })
  })

  describe('getMetrics', () => {
    it('should calculate offers metrics', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, cost: 80, isActive: true, createdAt: '', updatedAt: '', category: { id: '1', name: 'Electronics' } },
        { id: '2', name: 'Product 2', price: 200, cost: 150, isActive: true, createdAt: '', updatedAt: '', category: { id: '1', name: 'Electronics' } }
      ]

      vi.mocked(productService.getProducts).mockResolvedValue({
        data: mockProducts,
        meta: { total: 2 }
      })

      // Act
      const result = await offersService.getMetrics()

      // Assert
      expect(result.activeOffers).toBe(2)
      expect(result.totalDiscount).toBe(70) // 20 + 50
      expect(result.averageDiscount).toBe(35) // 70 / 2
      expect(result.topCategory).toBe('Electronics')
    })

    it('should return zero metrics when no offers exist', async () => {
      // Arrange
      vi.mocked(productService.getProducts).mockResolvedValue({
        data: [],
        meta: { total: 0 }
      })

      // Act
      const result = await offersService.getMetrics()

      // Assert
      expect(result.activeOffers).toBe(0)
      expect(result.totalDiscount).toBe(0)
      expect(result.averageDiscount).toBe(0)
    })
  })
})
