/**
 * usePurchaseOrders Hooks Tests
 * Tests for purchase SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePurchaseOrders,
  usePurchaseOrder,
  usePurchaseOrderItems,
  usePurchaseOrderMutations,
  usePurchaseOrderItemMutations,
} from '../../hooks'
import { purchaseService } from '../../services'
import {
  mockPurchaseOrder,
  mockPurchaseOrders,
  mockPurchaseOrderItem,
  mockPurchaseOrderItems,
  mockPurchaseOrderFormData,
  mockJsonApiPurchaseOrderResponse,
  mockJsonApiPurchaseOrdersResponse,
  mockJsonApiPurchaseOrderItemsResponse,
  mock404Error,
  mock422Error,
} from '../utils/test-utils'

// Mock the purchase service
vi.mock('../../services')

describe('usePurchaseOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return purchase orders', async () => {
    // Arrange
    const orders = mockPurchaseOrders(3)
    const jsonApiResponse = mockJsonApiPurchaseOrdersResponse(orders)
    vi.mocked(purchaseService.orders.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => usePurchaseOrders())

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.purchaseOrders).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.purchaseOrders).toEqual(orders)
    expect(result.current.error).toBeUndefined()
    expect(purchaseService.orders.getAll).toHaveBeenCalled()
  })

  it('should fetch purchase orders with search filter', async () => {
    // Arrange
    const orders = mockPurchaseOrders(2)
    const jsonApiResponse = mockJsonApiPurchaseOrdersResponse(orders)
    vi.mocked(purchaseService.orders.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => usePurchaseOrders({ search: 'PO-2025' }))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.purchaseOrders).toEqual(orders)
    expect(purchaseService.orders.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ 'filter[search]': 'PO-2025' })
    )
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const orders = mockPurchaseOrders(2)
    const jsonApiResponse = mockJsonApiPurchaseOrdersResponse(orders)
    vi.mocked(purchaseService.orders.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => usePurchaseOrders())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('usePurchaseOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single purchase order by ID', async () => {
    // Arrange
    const order = mockPurchaseOrder({ id: '5' })
    const jsonApiResponse = mockJsonApiPurchaseOrderResponse(order)
    vi.mocked(purchaseService.orders.getById).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => usePurchaseOrder('5'))

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.purchaseOrder).toEqual(order)
    expect(result.current.error).toBeUndefined()
    expect(purchaseService.orders.getById).toHaveBeenCalledWith('5')
  })

  it('should not fetch when ID is not provided', () => {
    // Act
    const { result } = renderHook(() => usePurchaseOrder(''))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.purchaseOrder).toBeUndefined()
    expect(purchaseService.orders.getById).not.toHaveBeenCalled()
  })
})

describe('usePurchaseOrderItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch purchase order items by order ID', async () => {
    // Arrange
    const items = mockPurchaseOrderItems(3)
    const jsonApiResponse = mockJsonApiPurchaseOrderItemsResponse(items)
    vi.mocked(purchaseService.items.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => usePurchaseOrderItems('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.purchaseOrderItems).toEqual(items)
    expect(purchaseService.items.getAll).toHaveBeenCalledWith({ 'filter[purchaseOrderId]': '5' })
  })

  it('should not fetch when purchaseOrderId is not provided', () => {
    // Act
    const { result } = renderHook(() => usePurchaseOrderItems())

    // Assert
    expect(result.current.purchaseOrderItems).toEqual([])
    expect(purchaseService.items.getAll).not.toHaveBeenCalled()
  })
})

describe('usePurchaseOrderMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPurchaseOrder', () => {
    it('should create a new purchase order', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData()
      const createdOrder = mockPurchaseOrder({
        orderNumber: formData.orderNumber,
      })
      vi.mocked(purchaseService.orders.create).mockResolvedValue({
        data: createdOrder,
      })

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())
      const createdResult = await result.current.createPurchaseOrder(formData)

      // Assert
      expect(createdResult).toEqual({ data: createdOrder })
      expect(purchaseService.orders.create).toHaveBeenCalledWith(formData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData()
      const error = mock422Error('order_number', 'Order number is required')
      vi.mocked(purchaseService.orders.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())

      // Assert
      await expect(result.current.createPurchaseOrder(formData)).rejects.toEqual(error)
    })
  })

  describe('updatePurchaseOrder', () => {
    it('should update an existing purchase order', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData({ orderNumber: 'PO-UPDATED' })
      const updatedOrder = mockPurchaseOrder({
        id: '1',
        orderNumber: formData.orderNumber,
      })
      vi.mocked(purchaseService.orders.update).mockResolvedValue({
        data: updatedOrder,
      })

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())
      const updatedResult = await result.current.updatePurchaseOrder('1', formData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedOrder })
      expect(purchaseService.orders.update).toHaveBeenCalledWith('1', formData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const formData = mockPurchaseOrderFormData()
      const error = mock404Error()
      vi.mocked(purchaseService.orders.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())

      // Assert
      await expect(result.current.updatePurchaseOrder('999', formData)).rejects.toEqual(error)
    })
  })

  describe('updatePurchaseOrderTotals', () => {
    it('should update purchase order totals', async () => {
      // Arrange
      const totals = { totalAmount: 1500.00 }
      const updatedOrder = mockPurchaseOrder({ id: '1', totalAmount: totals.totalAmount })
      vi.mocked(purchaseService.orders.updateTotals).mockResolvedValue({
        data: updatedOrder,
      })

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())
      const updatedResult = await result.current.updatePurchaseOrderTotals('1', totals)

      // Assert
      expect(updatedResult).toEqual({ data: updatedOrder })
      expect(purchaseService.orders.updateTotals).toHaveBeenCalledWith('1', totals)
    })
  })

  describe('deletePurchaseOrder', () => {
    it('should delete a purchase order', async () => {
      // Arrange
      vi.mocked(purchaseService.orders.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())
      await result.current.deletePurchaseOrder('1')

      // Assert
      expect(purchaseService.orders.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(purchaseService.orders.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePurchaseOrderMutations())

      // Assert
      await expect(result.current.deletePurchaseOrder('999')).rejects.toEqual(error)
    })
  })
})

describe('usePurchaseOrderItemMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPurchaseOrderItem', () => {
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
      vi.mocked(purchaseService.items.create).mockResolvedValue({
        data: createdItem,
      })

      // Act
      const { result } = renderHook(() => usePurchaseOrderItemMutations())
      const createdResult = await result.current.createPurchaseOrderItem(itemData)

      // Assert
      expect(createdResult).toEqual({ data: createdItem })
      expect(purchaseService.items.create).toHaveBeenCalledWith(itemData)
    })
  })

  describe('updatePurchaseOrderItem', () => {
    it('should update an existing purchase order item', async () => {
      // Arrange
      const itemData = { quantity: 20 }
      const updatedItem = mockPurchaseOrderItem({ id: '1', quantity: 20 })
      vi.mocked(purchaseService.items.update).mockResolvedValue({
        data: updatedItem,
      })

      // Act
      const { result } = renderHook(() => usePurchaseOrderItemMutations())
      const updatedResult = await result.current.updatePurchaseOrderItem('1', itemData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedItem })
      expect(purchaseService.items.update).toHaveBeenCalledWith('1', itemData)
    })
  })

  describe('deletePurchaseOrderItem', () => {
    it('should delete a purchase order item', async () => {
      // Arrange
      vi.mocked(purchaseService.items.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => usePurchaseOrderItemMutations())
      await result.current.deletePurchaseOrderItem('1')

      // Assert
      expect(purchaseService.items.delete).toHaveBeenCalledWith('1')
    })
  })
})
