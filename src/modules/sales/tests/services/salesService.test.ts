/**
 * Sales Service Tests
 * Tests for the sales API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { salesService } from '../../services'
import {
  mockSalesOrder,
  mockSalesOrders,
  mockSalesOrderFormData,
  mockSalesOrderItem,
  mockJsonApiSalesOrderResponse,
  mockJsonApiSalesOrdersResponse,
  mockJsonApiSalesOrderItemsResponse,
  mock422Error,
  mock404Error,
  mock500Error,
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('salesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('orders.getAll', () => {
    it('should fetch all sales orders without params', async () => {
      // Arrange
      const orders = mockSalesOrders(3)
      const apiResponse = mockJsonApiSalesOrdersResponse(orders)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await salesService.orders.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders?include=contact')
      expect(result).toEqual(apiResponse)
    })

    it('should fetch all sales orders with search filter', async () => {
      // Arrange
      const orders = mockSalesOrders(2)
      const apiResponse = mockJsonApiSalesOrdersResponse(orders)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await salesService.orders.getAll({ 'filter[search]': 'SO-2025' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('/api/v1/sales-orders')
      expect(decodedUrl).toContain('filter[search]=SO-2025')
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await salesService.orders.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(salesService.orders.getAll()).rejects.toEqual(error)
    })
  })

  describe('orders.getById', () => {
    it('should fetch a single sales order by ID', async () => {
      // Arrange
      const order = mockSalesOrder({ id: '5' })
      const apiResponse = mockJsonApiSalesOrderResponse(order)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await salesService.orders.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/sales-orders/5?include=contact,items')
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when sales order not found', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(salesService.orders.getById('999')).rejects.toEqual(error)
    })
  })

  describe('orders.create', () => {
    it('should create a new sales order', async () => {
      // Arrange
      const formData = mockSalesOrderFormData()
      const createdOrder = mockSalesOrder({
        orderNumber: formData.orderNumber,
        contactId: formData.contactId,
      })
      const apiResponse = {
        data: createdOrder,
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await salesService.orders.create(formData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/sales-orders', expect.objectContaining({
        data: expect.objectContaining({
          type: 'sales-orders',
          attributes: expect.objectContaining({
            order_number: formData.orderNumber,
            contact_id: formData.contactId,
          }),
        }),
      }))
      expect(result).toEqual(createdOrder)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const formData = mockSalesOrderFormData({ orderNumber: '' })
      const error = mock422Error('order_number', 'Order number is required')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(salesService.orders.create(formData)).rejects.toEqual(error)
    })
  })

  describe('orders.update', () => {
    it('should update an existing sales order', async () => {
      // Arrange
      const formData = mockSalesOrderFormData({ orderNumber: 'SO-UPDATED' })
      const updatedOrder = mockSalesOrder({
        id: '1',
        orderNumber: formData.orderNumber,
      })
      const apiResponse = {
        data: updatedOrder,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await salesService.orders.update('1', formData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/sales-orders/1', expect.objectContaining({
        data: expect.objectContaining({
          type: 'sales-orders',
          id: '1',
        }),
      }))
      expect(result).toEqual(updatedOrder)
    })

    it('should throw 404 error when updating non-existent order', async () => {
      // Arrange
      const formData = mockSalesOrderFormData()
      const error = mock404Error()
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(salesService.orders.update('999', formData)).rejects.toEqual(error)
    })
  })

  describe('orders.updateTotals', () => {
    it('should update sales order totals', async () => {
      // Arrange
      const totals = {
        totalAmount: 1500.00,
        subtotalAmount: 1400.00,
        taxAmount: 100.00,
      }
      const updatedOrder = mockSalesOrder({
        id: '1',
        totalAmount: totals.totalAmount,
      })
      const apiResponse = {
        data: updatedOrder,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await salesService.orders.updateTotals('1', totals)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/sales-orders/1', {
        data: {
          type: 'sales-orders',
          id: '1',
          attributes: {
            total_amount: 1500.00,
            subtotal_amount: 1400.00,
            tax_amount: 100.00,
          },
        },
      })
      expect(result).toEqual(updatedOrder)
    })
  })

  describe('orders.delete', () => {
    it('should delete a sales order', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await salesService.orders.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/sales-orders/1')
    })

    it('should throw 404 error when deleting non-existent order', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(salesService.orders.delete('999')).rejects.toEqual(error)
    })
  })

  describe('items.getAll', () => {
    it('should fetch all sales order items', async () => {
      // Arrange
      const items = [mockSalesOrderItem()]
      const apiResponse = mockJsonApiSalesOrderItemsResponse(items)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await salesService.items.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('/api/v1/sales-order-items')
      expect(decodedUrl).toContain('include=product,salesOrder')
      expect(result).toEqual(apiResponse)
    })

    it('should fetch items filtered by sales order ID', async () => {
      // Arrange
      const items = [mockSalesOrderItem({ salesOrderId: '5' })]
      const apiResponse = mockJsonApiSalesOrderItemsResponse(items)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await salesService.items.getAll({ 'filter[salesOrderId]': '5' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[salesOrderId]=5')
      expect(result).toEqual(apiResponse)
    })
  })

  describe('items.create', () => {
    it('should create a new sales order item', async () => {
      // Arrange
      const itemData = {
        salesOrderId: 1,
        productId: 1,
        quantity: 10,
        unitPrice: 100.00,
        discount: 0,
        total: 1000.00,
      }
      const createdItem = mockSalesOrderItem(itemData as any)
      const apiResponse = {
        data: createdItem,
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await salesService.items.create(itemData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/sales-order-items', expect.any(Object))
      expect(result).toEqual(createdItem)
    })
  })

  describe('items.update', () => {
    it('should update an existing sales order item', async () => {
      // Arrange
      const itemData = {
        quantity: 20,
        unitPrice: 150.00,
      }
      const updatedItem = mockSalesOrderItem({
        id: '1',
        ...itemData,
      })
      const apiResponse = {
        data: updatedItem,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await salesService.items.update('1', itemData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/sales-order-items/1', expect.any(Object))
      expect(result).toEqual(updatedItem)
    })
  })

  describe('items.delete', () => {
    it('should delete a sales order item', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await salesService.items.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/sales-order-items/1')
    })
  })
})
