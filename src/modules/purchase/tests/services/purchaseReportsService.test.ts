/**
 * Purchase Reports Service Tests
 * Tests for purchase reports and analytics API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { purchaseReportsService } from '../../services'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('purchaseReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReports', () => {
    it('should fetch purchase reports with default dates', async () => {
      // Arrange
      const mockApiResponse = {
        data: {
          summary: {
            total_orders: 100,
            total_amount: 50000,
            average_order_value: 500,
            pending_orders: 20,
            completed_orders: 80
          },
          by_status: [
            { status: 'completed', count: 80, total_amount: 40000 },
            { status: 'pending', count: 20, total_amount: 10000 }
          ],
          by_supplier: [],
          monthly_trend: []
        },
        period: { start_date: '1980-01-01', end_date: '2025-12-31' }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await purchaseReportsService.getReports()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders/reports?start_date=1980-01-01&end_date=2025-12-31')
      expect(result.totalOrders).toBe(100)
      expect(result.totalAmount).toBe(50000)
      expect(result.averageOrderValue).toBe(500)
      expect(result.pendingOrders).toBe(20)
      expect(result.completedOrders).toBe(80)
    })

    it('should fetch purchase reports with custom date range', async () => {
      // Arrange
      const mockApiResponse = {
        data: {
          summary: {
            total_orders: 50,
            total_amount: 25000,
            average_order_value: 500,
            pending_orders: 10,
            completed_orders: 40
          },
          by_status: [],
          by_supplier: [],
          monthly_trend: []
        },
        period: { start_date: '2025-01-01', end_date: '2025-01-31' }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await purchaseReportsService.getReports('2025-01-01', '2025-01-31')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders/reports?start_date=2025-01-01&end_date=2025-01-31')
      expect(result.totalOrders).toBe(50)
      expect(result.totalAmount).toBe(25000)
    })

    it('should handle empty reports', async () => {
      // Arrange
      const emptyApiResponse = {
        data: {
          summary: {
            total_orders: 0,
            total_amount: 0,
            average_order_value: 0,
            pending_orders: 0,
            completed_orders: 0
          },
          by_status: [],
          by_supplier: [],
          monthly_trend: []
        },
        period: { start_date: '1980-01-01', end_date: '2025-12-31' }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: emptyApiResponse })

      // Act
      const result = await purchaseReportsService.getReports()

      // Assert
      expect(result.totalOrders).toBe(0)
      expect(result.totalAmount).toBe(0)
      expect(result.pendingOrders).toBe(0)
      expect(result.completedOrders).toBe(0)
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseReportsService.getReports()).rejects.toThrow('Network error')
    })
  })

  describe('getSuppliers', () => {
    it('should fetch top suppliers with default dates', async () => {
      // Arrange
      const mockApiResponse = {
        data: [
          {
            id: '1',
            type: 'suppliers',
            attributes: {
              supplier_name: 'Supplier A',
              supplier_email: 'suppliera@example.com',
              supplier_phone: '555-0001',
              total_orders: 20,
              total_purchased: 10000,
              average_order_value: 500,
              last_order_date: '2025-01-01',
              orders: []
            }
          },
          {
            id: '2',
            type: 'suppliers',
            attributes: {
              supplier_name: 'Supplier B',
              supplier_email: 'supplierb@example.com',
              supplier_phone: '555-0002',
              total_orders: 15,
              total_purchased: 8000,
              average_order_value: 533,
              last_order_date: '2025-01-02',
              orders: []
            }
          }
        ],
        meta: {
          total_suppliers: 2,
          period: { start_date: '1980-01-01', end_date: '2025-12-31' }
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await purchaseReportsService.getSuppliers()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders/suppliers?start_date=1980-01-01&end_date=2025-12-31')
      expect(result.suppliers).toHaveLength(2)
      expect(result.suppliers[0].name).toBe('Supplier A')
      expect(result.suppliers[0].totalPurchased).toBe(10000)
    })

    it('should fetch top suppliers with custom date range', async () => {
      // Arrange
      const mockApiResponse = {
        data: [
          {
            id: '3',
            type: 'suppliers',
            attributes: {
              supplier_name: 'Supplier C',
              total_orders: 50,
              total_purchased: 25000,
              average_order_value: 500,
              orders: []
            }
          }
        ],
        meta: {
          total_suppliers: 1,
          period: { start_date: '2025-01-01', end_date: '2025-12-31' }
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await purchaseReportsService.getSuppliers('2025-01-01', '2025-12-31')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders/suppliers?start_date=2025-01-01&end_date=2025-12-31')
      expect(result.suppliers).toHaveLength(1)
      expect(result.suppliers[0].name).toBe('Supplier C')
    })

    it('should handle empty suppliers list', async () => {
      // Arrange
      const emptyApiResponse = {
        data: [],
        meta: { total_suppliers: 0 }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: emptyApiResponse })

      // Act
      const result = await purchaseReportsService.getSuppliers()

      // Assert
      expect(result.suppliers).toEqual([])
      expect(result.meta.totalSuppliers).toBe(0)
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Failed to fetch suppliers')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseReportsService.getSuppliers()).rejects.toThrow('Failed to fetch suppliers')
    })
  })
})
