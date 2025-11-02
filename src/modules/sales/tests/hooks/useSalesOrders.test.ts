/**
 * useSalesOrders Hooks Tests
 * Tests for sales SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useSalesOrders,
  useSalesOrder,
  useSalesOrderItems,
  useSalesOrderMutations,
  useSalesOrderItemMutations,
} from '../../hooks'
import { salesService } from '../../services'
import {
  mockSalesOrder,
  mockSalesOrders,
  mockSalesOrderItem,
  mockSalesOrderItems,
  mockSalesOrderFormData,
  mockJsonApiSalesOrderResponse,
  mockJsonApiSalesOrdersResponse,
  mockJsonApiSalesOrderItemsResponse,
  mock404Error,
  mock422Error,
} from '../utils/test-utils'

// Mock the sales service
vi.mock('../../services')

describe('useSalesOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return sales orders', async () => {
    // Arrange
    const orders = mockSalesOrders(3)
    const jsonApiResponse = mockJsonApiSalesOrdersResponse(orders)
    vi.mocked(salesService.orders.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => useSalesOrders())

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.salesOrders).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.salesOrders).toEqual(orders)
    expect(result.current.error).toBeUndefined()
    expect(salesService.orders.getAll).toHaveBeenCalled()
  })

  it('should fetch sales orders with search filter', async () => {
    // Arrange
    const orders = mockSalesOrders(2)
    const jsonApiResponse = mockJsonApiSalesOrdersResponse(orders)
    vi.mocked(salesService.orders.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => useSalesOrders({ search: 'SO-2025' }))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.salesOrders).toEqual(orders)
    expect(salesService.orders.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ 'filter[search]': 'SO-2025' })
    )
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const orders = mockSalesOrders(2)
    vi.mocked(salesService.orders.getAll).mockResolvedValue({
      data: orders,
      meta: {},
    })

    // Act
    const { result } = renderHook(() => useSalesOrders())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useSalesOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single sales order by ID', async () => {
    // Arrange
    const order = mockSalesOrder({ id: '5' })
    const jsonApiResponse = mockJsonApiSalesOrderResponse(order)
    vi.mocked(salesService.orders.getById).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => useSalesOrder('5'))

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.salesOrder).toEqual(order)
    expect(result.current.error).toBeUndefined()
    expect(salesService.orders.getById).toHaveBeenCalledWith('5')
  })

  it('should not fetch when ID is not provided', () => {
    // Act
    const { result } = renderHook(() => useSalesOrder(''))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.salesOrder).toBeUndefined()
    expect(salesService.orders.getById).not.toHaveBeenCalled()
  })
})

describe('useSalesOrderItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch sales order items by order ID', async () => {
    // Arrange
    const items = mockSalesOrderItems(3)
    const jsonApiResponse = mockJsonApiSalesOrderItemsResponse(items)
    vi.mocked(salesService.items.getAll).mockResolvedValue(jsonApiResponse)

    // Act
    const { result } = renderHook(() => useSalesOrderItems('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.salesOrderItems).toEqual(items)
    expect(salesService.items.getAll).toHaveBeenCalledWith({ 'filter[salesOrderId]': '5' })
  })

  it('should not fetch when salesOrderId is not provided', () => {
    // Act
    const { result } = renderHook(() => useSalesOrderItems())

    // Assert
    expect(result.current.salesOrderItems).toEqual([])
    expect(salesService.items.getAll).not.toHaveBeenCalled()
  })
})

describe('useSalesOrderMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSalesOrder', () => {
    it('should create a new sales order', async () => {
      // Arrange
      const formData = mockSalesOrderFormData()
      const createdOrder = mockSalesOrder({
        orderNumber: formData.orderNumber,
      })
      vi.mocked(salesService.orders.create).mockResolvedValue({
        data: createdOrder,
      })

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())
      const createdResult = await result.current.createSalesOrder(formData)

      // Assert
      expect(createdResult).toEqual({ data: createdOrder })
      expect(salesService.orders.create).toHaveBeenCalledWith(formData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const formData = mockSalesOrderFormData()
      const error = mock422Error('order_number', 'Order number is required')
      vi.mocked(salesService.orders.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())

      // Assert
      await expect(result.current.createSalesOrder(formData)).rejects.toEqual(error)
    })
  })

  describe('updateSalesOrder', () => {
    it('should update an existing sales order', async () => {
      // Arrange
      const formData = mockSalesOrderFormData({ orderNumber: 'SO-UPDATED' })
      const updatedOrder = mockSalesOrder({
        id: '1',
        orderNumber: formData.orderNumber,
      })
      vi.mocked(salesService.orders.update).mockResolvedValue({
        data: updatedOrder,
      })

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())
      const updatedResult = await result.current.updateSalesOrder('1', formData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedOrder })
      expect(salesService.orders.update).toHaveBeenCalledWith('1', formData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const formData = mockSalesOrderFormData()
      const error = mock404Error()
      vi.mocked(salesService.orders.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())

      // Assert
      await expect(result.current.updateSalesOrder('999', formData)).rejects.toEqual(error)
    })
  })

  describe('updateSalesOrderTotals', () => {
    it('should update sales order totals', async () => {
      // Arrange
      const totals = { totalAmount: 1500.00, subtotalAmount: 1400.00, taxAmount: 100.00 }
      const updatedOrder = mockSalesOrder({ id: '1', totalAmount: totals.totalAmount })
      vi.mocked(salesService.orders.updateTotals).mockResolvedValue({
        data: updatedOrder,
      })

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())
      const updatedResult = await result.current.updateSalesOrderTotals('1', totals)

      // Assert
      expect(updatedResult).toEqual({ data: updatedOrder })
      expect(salesService.orders.updateTotals).toHaveBeenCalledWith('1', totals)
    })
  })

  describe('deleteSalesOrder', () => {
    it('should delete a sales order', async () => {
      // Arrange
      vi.mocked(salesService.orders.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())
      await result.current.deleteSalesOrder('1')

      // Assert
      expect(salesService.orders.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(salesService.orders.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useSalesOrderMutations())

      // Assert
      await expect(result.current.deleteSalesOrder('999')).rejects.toEqual(error)
    })
  })
})

describe('useSalesOrderItemMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSalesOrderItem', () => {
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
      vi.mocked(salesService.items.create).mockResolvedValue({
        data: createdItem,
      })

      // Act
      const { result } = renderHook(() => useSalesOrderItemMutations())
      const createdResult = await result.current.createSalesOrderItem(itemData)

      // Assert
      expect(createdResult).toEqual({ data: createdItem })
      expect(salesService.items.create).toHaveBeenCalledWith(itemData)
    })
  })

  describe('updateSalesOrderItem', () => {
    it('should update an existing sales order item', async () => {
      // Arrange
      const itemData = { quantity: 20 }
      const updatedItem = mockSalesOrderItem({ id: '1', quantity: 20 })
      vi.mocked(salesService.items.update).mockResolvedValue({
        data: updatedItem,
      })

      // Act
      const { result } = renderHook(() => useSalesOrderItemMutations())
      const updatedResult = await result.current.updateSalesOrderItem('1', itemData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedItem })
      expect(salesService.items.update).toHaveBeenCalledWith('1', itemData)
    })
  })

  describe('deleteSalesOrderItem', () => {
    it('should delete a sales order item', async () => {
      // Arrange
      vi.mocked(salesService.items.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useSalesOrderItemMutations())
      await result.current.deleteSalesOrderItem('1')

      // Assert
      expect(salesService.items.delete).toHaveBeenCalledWith('1')
    })
  })
})
