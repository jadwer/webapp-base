/**
 * Sales Reports Service Tests
 * Tests for sales reports and analytics API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { salesReportsService } from '../../services'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('salesReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReports', () => {
    it('should fetch sales reports with default period', async () => {
      // Arrange
      const mockApiResponse = {
        data: {
          attributes: {
            summary: {
              total_orders: 100,
              total_revenue: 50000,
              average_order_value: 500
            },
            sales_by_status: [
              { status: 'completed', count: 60, total_amount: 30000 },
              { status: 'pending', count: 40, total_amount: 20000 }
            ],
            top_customers: [],
            sales_trend: [],
            period_days: 30
          }
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await salesReportsService.getReports()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders/reports?period=30')
      expect(result.totalOrders).toBe(100)
      expect(result.totalRevenue).toBe(50000)
    })

    it('should fetch sales reports with custom period', async () => {
      // Arrange
      const mockApiResponse = {
        data: {
          attributes: {
            summary: {
              total_orders: 300,
              total_revenue: 150000,
              average_order_value: 500
            },
            sales_by_status: [],
            top_customers: [],
            sales_trend: [],
            period_days: 90
          }
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await salesReportsService.getReports(90)

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders/reports?period=90')
      expect(result.totalOrders).toBe(300)
    })

    it('should handle empty reports', async () => {
      // Arrange
      const emptyApiResponse = {
        data: {
          attributes: {
            summary: {
              total_orders: 0,
              total_revenue: 0,
              average_order_value: 0
            },
            sales_by_status: [],
            top_customers: [],
            sales_trend: []
          }
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: emptyApiResponse })

      // Act
      const result = await salesReportsService.getReports()

      // Assert
      expect(result.totalOrders).toBe(0)
      expect(result.totalRevenue).toBe(0)
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(salesReportsService.getReports()).rejects.toThrow('Network error')
    })
  })

  describe('getCustomers', () => {
    it('should fetch top customers with default period', async () => {
      // Arrange
      const mockApiResponse = {
        data: [
          {
            id: '1',
            attributes: {
              customer_name: 'Customer A',
              customer_email: 'customera@example.com',
              total_orders: 20,
              total_revenue: 10000,
              average_order_value: 500,
              last_order_date: '2025-01-01',
              orders: []
            }
          },
          {
            id: '2',
            attributes: {
              customer_name: 'Customer B',
              customer_email: 'customerb@example.com',
              total_orders: 15,
              total_revenue: 8000,
              average_order_value: 533,
              last_order_date: '2025-01-02',
              orders: []
            }
          }
        ],
        meta: {
          total_customers: 2,
          period_days: 90
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await salesReportsService.getCustomers()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders/customers?period=90')
      expect(result.customers).toHaveLength(2)
      expect(result.customers[0].name).toBe('Customer A')
    })

    it('should fetch top customers with custom period', async () => {
      // Arrange
      const mockApiResponse = {
        data: [
          {
            id: '3',
            attributes: {
              customer_name: 'Customer C',
              total_orders: 50,
              total_revenue: 25000,
              average_order_value: 500,
              orders: []
            }
          }
        ],
        meta: { total_customers: 1, period_days: 365 }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockApiResponse })

      // Act
      const result = await salesReportsService.getCustomers(365)

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders/customers?period=365')
      expect(result.customers).toHaveLength(1)
    })

    it('should handle empty customers list', async () => {
      // Arrange
      const emptyApiResponse = {
        data: [],
        meta: { total_customers: 0 }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: emptyApiResponse })

      // Act
      const result = await salesReportsService.getCustomers()

      // Assert
      expect(result.customers).toEqual([])
      expect((result.meta as Record<string, unknown>).totalCustomers).toBe(0)
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Failed to fetch customers')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(salesReportsService.getCustomers()).rejects.toThrow('Failed to fetch customers')
    })
  })
})
