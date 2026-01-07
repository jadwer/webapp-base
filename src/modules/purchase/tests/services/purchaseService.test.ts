/**
 * Purchase Service Tests
 * Tests for the purchase API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { purchaseService } from '../../services'
import {
  mockPurchaseOrder,
  mockPurchaseOrders,
  mockPurchaseOrderFormData,
  mockPurchaseOrderItem,
  mockJsonApiPurchaseOrderResponse,
  mockJsonApiPurchaseOrdersResponse,
  mockJsonApiPurchaseOrderItemsResponse,
  mock422Error,
  mock404Error,
  mock500Error,
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('purchaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('orders.getAll', () => {
    it('should fetch all purchase orders without params', async () => {
      // Arrange
      const orders = mockPurchaseOrders(3)
      const apiResponse = mockJsonApiPurchaseOrdersResponse(orders)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await purchaseService.orders.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders?include=contact')
      expect(result).toEqual(apiResponse)
    })

    it('should fetch all purchase orders with search filter', async () => {
      // Arrange
      const orders = mockPurchaseOrders(2)
      const apiResponse = mockJsonApiPurchaseOrdersResponse(orders)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await purchaseService.orders.getAll({ 'filter[search]': 'PO-2025' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('/api/v1/purchase-orders')
      expect(decodedUrl).toContain('filter[search]=PO-2025')
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await purchaseService.orders.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseService.orders.getAll()).rejects.toEqual(error)
    })
  })

  describe('orders.getById', () => {
    it('should fetch a single purchase order by ID', async () => {
      // Arrange
      const order = mockPurchaseOrder({ id: '5' })
      const apiResponse = mockJsonApiPurchaseOrderResponse(order)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await purchaseService.orders.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/purchase-orders/5?include=contact,purchaseOrderItems')
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when purchase order not found', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseService.orders.getById('999')).rejects.toEqual(error)
    })
  })

  describe('orders.create', () => {
    it('should create a new purchase order', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData()
      const createdOrder = mockPurchaseOrder({
        orderNumber: formData.orderNumber,
        contactId: formData.contactId,
      })
      const apiResponse = {
        data: createdOrder,
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await purchaseService.orders.create(formData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/purchase-orders', expect.objectContaining({
        data: expect.objectContaining({
          type: 'purchase-orders',
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
      const formData = mockPurchaseOrderFormData({ orderNumber: '' })
      const error = mock422Error('order_number', 'Order number is required')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseService.orders.create(formData)).rejects.toEqual(error)
    })
  })

  describe('orders.update', () => {
    it('should update an existing purchase order', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData({ orderNumber: 'PO-UPDATED' })
      const updatedOrder = mockPurchaseOrder({
        id: '1',
        orderNumber: formData.orderNumber,
      })
      const apiResponse = {
        data: updatedOrder,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await purchaseService.orders.update('1', formData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/purchase-orders/1', expect.objectContaining({
        data: expect.objectContaining({
          type: 'purchase-orders',
          id: '1',
        }),
      }))
      expect(result).toEqual(updatedOrder)
    })

    it('should throw 404 error when updating non-existent order', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData()
      const error = mock404Error()
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseService.orders.update('999', formData)).rejects.toEqual(error)
    })
  })

  describe('orders.updateTotals', () => {
    it('should update purchase order totals', async () => {
      // Arrange
      const totals = {
        totalAmount: 1500.00,
      }
      const updatedOrder = mockPurchaseOrder({
        id: '1',
        totalAmount: totals.totalAmount,
      })
      const apiResponse = {
        data: updatedOrder,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await purchaseService.orders.updateTotals('1', totals)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/purchase-orders/1', {
        data: {
          type: 'purchase-orders',
          id: '1',
          attributes: {
            totalAmount: 1500.00,
          },
        },
      })
      expect(result).toEqual(updatedOrder)
    })
  })

  describe('orders.delete', () => {
    it('should delete a purchase order', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await purchaseService.orders.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/purchase-orders/1')
    })

    it('should throw 404 error when deleting non-existent order', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseService.orders.delete('999')).rejects.toEqual(error)
    })
  })

  describe('items.getAll', () => {
    it('should fetch all purchase order items', async () => {
      // Arrange
      const items = [mockPurchaseOrderItem()]
      const apiResponse = mockJsonApiPurchaseOrderItemsResponse(items)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await purchaseService.items.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('/api/v1/purchase-order-items')
      expect(decodedUrl).toContain('include=product,purchaseOrder')
      expect(result).toEqual(apiResponse)
    })

    it('should fetch items filtered by purchase order ID', async () => {
      // Arrange
      const items = [mockPurchaseOrderItem({ purchaseOrderId: 5 })]
      const apiResponse = mockJsonApiPurchaseOrderItemsResponse(items)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await purchaseService.items.getAll({ 'filter[purchaseOrderId]': '5' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[purchaseOrderId]=5')
      expect(result).toEqual(apiResponse)
    })
  })

  describe('items.create', () => {
    it('should create a new purchase order item', async () => {
      // Arrange
      const itemData = {
        purchaseOrderId: 1,
        productId: 1,
        quantity: 10,
        unitPrice: 100.00,
        discount: 0,
        total: 1000.00,
      }
      const createdItem = mockPurchaseOrderItem(itemData as any)
      const apiResponse = {
        data: createdItem,
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await purchaseService.items.create(itemData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/purchase-order-items', expect.any(Object))
      expect(result).toEqual(createdItem)
    })
  })

  describe('items.update', () => {
    it('should update an existing purchase order item', async () => {
      // Arrange
      const itemData = {
        quantity: 20,
        unitPrice: 150.00,
      }
      const updatedItem = mockPurchaseOrderItem({
        id: '1',
        ...itemData,
      })
      const apiResponse = {
        data: updatedItem,
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await purchaseService.items.update('1', itemData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/purchase-order-items/1', expect.any(Object))
      expect(result).toEqual(updatedItem)
    })
  })

  describe('items.delete', () => {
    it('should delete a purchase order item', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await purchaseService.items.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/purchase-order-items/1')
    })
  })
})
