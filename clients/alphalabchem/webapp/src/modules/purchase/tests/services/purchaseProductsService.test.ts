/**
 * Purchase Products Service Tests
 * Tests for fetching products for sales order items
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { purchaseProductsService } from '../../services'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('purchaseProductsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all products without filters', async () => {
      // Arrange
      const mockProducts = {
        data: [
          {
            id: '1',
            type: 'products',
            attributes: {
              name: 'Product A',
              sku: 'PROD-001',
              price: 100.00
            }
          },
          {
            id: '2',
            type: 'products',
            attributes: {
              name: 'Product B',
              sku: 'PROD-002',
              price: 200.00
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

      // Act
      const result = await purchaseProductsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      expect(callUrl).toContain('/api/v1/products')
      expect(result).toEqual(mockProducts)
    })

    it('should fetch products with search filter', async () => {
      // Arrange
      const mockProducts = {
        data: [
          {
            id: '1',
            type: 'products',
            attributes: {
              name: 'Laptop Pro',
              sku: 'LAP-001',
              price: 1500.00
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

      // Act
      const result = await purchaseProductsService.getAll({ 'filter[search]': 'Laptop' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[search]=Laptop')
      expect(result).toEqual(mockProducts)
    })

    it('should fetch products with includes', async () => {
      // Arrange
      const mockProducts = {
        data: [
          {
            id: '1',
            type: 'products',
            attributes: { name: 'Product A' },
            relationships: {
              unit: { data: { id: '1', type: 'units' } },
              category: { data: { id: '1', type: 'categories' } }
            }
          }
        ],
        included: [
          { id: '1', type: 'units', attributes: { name: 'Piece' } },
          { id: '1', type: 'categories', attributes: { name: 'Electronics' } }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

      // Act
      const result = await purchaseProductsService.getAll({ include: 'unit,category' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('include=unit,category')
      expect(result).toEqual(mockProducts)
    })

    it('should handle empty products response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await purchaseProductsService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Failed to fetch products')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseProductsService.getAll()).rejects.toThrow('Failed to fetch products')
    })

    it('should fetch products with multiple filters', async () => {
      // Arrange
      const mockProducts = {
        data: [
          {
            id: '1',
            type: 'products',
            attributes: {
              name: 'Active Product',
              status: 'active',
              price: 100.00
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockProducts })

      // Act
      const result = await purchaseProductsService.getAll({
        'filter[status]': 'active',
        'filter[search]': 'Active'
      })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[status]=active')
      expect(decodedUrl).toContain('filter[search]=Active')
      expect(result).toEqual(mockProducts)
    })
  })
})
