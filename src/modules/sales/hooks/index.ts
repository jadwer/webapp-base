'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import { salesService, salesReportsService, salesContactsService, salesProductsService } from '../services'
import { transformSalesOrdersResponse, transformSalesOrderItemsResponse } from '../utils/transformers'
import { SalesOrderFormData, SalesOrderFilters } from '../types'

// Sales Orders Hooks
export const useSalesOrders = (params?: SalesOrderFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, string | number> = {}
  
  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.contactId) {
    queryParams['filter[contact_id]'] = params.contactId
  }
  if (params?.dateFrom) {
    queryParams['filter[date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0 
    ? ['/api/v1/sales-orders', queryParams] 
    : '/api/v1/sales-orders'
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await salesService.orders.getAll(queryParams)
      console.log('🔄 [Hook] Raw sales orders response:', response)
      const transformed = transformSalesOrdersResponse(response)
      console.log('✅ [Hook] Transformed sales orders:', transformed)
      return transformed
    }
  )

  return {
    salesOrders: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate
  }
}

export const useSalesOrder = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/sales-orders/${id}` : null,
    async () => {
      const response = await salesService.orders.getById(id)
      console.log('🔄 [Hook] Raw sales order response:', response)
      const transformed = transformSalesOrdersResponse(response)
      console.log('✅ [Hook] Transformed sales order:', transformed.data[0])
      return transformed.data[0]
    }
  )

  return {
    salesOrder: data,
    isLoading,
    error,
    mutate
  }
}

export const useSalesOrderItems = (salesOrderId?: string) => {
  const params = salesOrderId ? { 'filter[salesOrderId]': salesOrderId } : undefined
  const key = params ? ['/api/v1/sales-order-items', params] : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!params) return { data: [], meta: {} }
      const response = await salesService.items.getAll(params)
      console.log('🔄 [Hook] Raw sales order items:', response)
      const transformed = transformSalesOrderItemsResponse(response)
      console.log('✅ [Hook] Transformed items:', transformed)
      return transformed
    }
  )

  return {
    salesOrderItems: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate
  }
}

// Sales Reports Hooks
export const useSalesReports = (period = 30) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/sales-orders/reports?period=${period}`,
    () => salesReportsService.getReports(period)
  )

  return {
    reports: data,
    isLoading,
    error,
    mutate
  }
}

export const useSalesCustomers = (period = 90) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/sales-orders/customers?period=${period}`,
    () => salesReportsService.getCustomers(period)
  )

  return {
    customers: data,
    isLoading,
    error,
    mutate
  }
}

export const useSalesAnalytics = (dateFrom?: string, dateTo?: string) => {
  const key = dateFrom || dateTo 
    ? `/api/v1/sales-orders/analytics?${new URLSearchParams({ 
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      }).toString()}`
    : '/api/v1/sales-orders/analytics'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => salesReportsService.getReports(30)
  )

  return {
    analytics: data,
    isLoading,
    error,
    mutate
  }
}

// Sales Contacts Hook (for dropdowns)
export const useSalesContacts = (params?: Record<string, string>) => {
  const queryParams = params || { 'filter[status]': 'active', 'filter[isCustomer]': '1' }
  const key = ['/api/v1/contacts', queryParams]
  
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const response = await salesContactsService.getAll(queryParams)
      console.log('🔄 [Hook] Raw contacts response:', response)
      return response
    }
  )

  return {
    contacts: data?.data || [],
    isLoading,
    error
  }
}

// Sales Products Hook (for order items)
export const useSalesProducts = (params?: Record<string, string>) => {
  // Filter active products by default unless explicitly overridden
  const queryParams = {
    'filter[is_active]': '1',
    ...params
  }
  const key = ['/api/v1/products', queryParams]
  
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const response = await salesProductsService.getAll(queryParams)
      console.log('🔄 [Hook] Raw products response:', response)
      return response
    }
  )

  return {
    products: data?.data || [],
    isLoading,
    error
  }
}

// Sales Order Mutations Hook
export const useSalesOrderMutations = () => {
  const createSalesOrder = useCallback(async (data: SalesOrderFormData) => {
    console.log('🚀 [Mutation] Creating sales order:', data.orderNumber)
    try {
      const response = await salesService.orders.create(data)
      console.log('✅ [Mutation] Sales order created successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error creating sales order:', error)
      throw error
    }
  }, [])

  const updateSalesOrder = useCallback(async (id: string, data: SalesOrderFormData) => {
    console.log('📝 [Mutation] Updating sales order:', id)
    try {
      const response = await salesService.orders.update(id, data)
      console.log('✅ [Mutation] Sales order updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating sales order:', error)
      throw error
    }
  }, [])

  const deleteSalesOrder = useCallback(async (id: string) => {
    console.log('🗑️ [Mutation] Deleting sales order:', id)
    try {
      await salesService.orders.delete(id)
      console.log('✅ [Mutation] Sales order deleted successfully')
    } catch (error) {
      console.error('❌ [Mutation] Error deleting sales order:', error)
      throw error
    }
  }, [])

  const updateSalesOrderTotals = useCallback(async (id: string, totals: { totalAmount: number, subtotalAmount?: number, taxAmount?: number }) => {
    console.log('💰 [Mutation] Updating sales order totals:', id, totals)
    try {
      const response = await salesService.orders.updateTotals(id, totals)
      console.log('✅ [Mutation] Sales order totals updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating sales order totals:', error)
      throw error
    }
  }, [])

  return {
    createSalesOrder,
    updateSalesOrder,
    updateSalesOrderTotals,
    deleteSalesOrder
  }
}

// Sales Order Items Mutations Hook
export const useSalesOrderItemMutations = () => {
  const createSalesOrderItem = useCallback(async (data: Record<string, unknown>) => {
    console.log('🚀 [Mutation] Creating sales order item:', data)
    try {
      const response = await salesService.items.create(data)
      console.log('✅ [Mutation] Sales order item created successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error creating sales order item:', error)
      throw error
    }
  }, [])

  const updateSalesOrderItem = useCallback(async (id: string, data: Record<string, unknown>) => {
    console.log('📝 [Mutation] Updating sales order item:', id)
    try {
      const response = await salesService.items.update(id, data)
      console.log('✅ [Mutation] Sales order item updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating sales order item:', error)
      throw error
    }
  }, [])

  const deleteSalesOrderItem = useCallback(async (id: string) => {
    console.log('🗑️ [Mutation] Deleting sales order item:', id)
    try {
      await salesService.items.delete(id)
      console.log('✅ [Mutation] Sales order item deleted successfully')
    } catch (error) {
      console.error('❌ [Mutation] Error deleting sales order item:', error)
      throw error
    }
  }, [])

  return {
    createSalesOrderItem,
    updateSalesOrderItem,
    deleteSalesOrderItem
  }
}

// Combined hook for sales order with items
export const useSalesOrderWithItems = (id: string) => {
  const { salesOrder, isLoading: orderLoading, error: orderError, mutate: mutateOrder } = useSalesOrder(id)
  const { salesOrderItems, isLoading: itemsLoading, error: itemsError, mutate: mutateItems } = useSalesOrderItems(id)

  return {
    salesOrder,
    salesOrderItems,
    isLoading: orderLoading || itemsLoading,
    error: orderError || itemsError,
    mutateOrder,
    mutateItems,
    mutateAll: () => {
      mutateOrder()
      mutateItems()
    }
  }
}

// DiscountRules Hooks - v1.1 (SA-M003)
export { useDiscountRules } from './useDiscountRules'
export { useDiscountRule } from './useDiscountRule'
export { useDiscountRuleMutations } from './useDiscountRuleMutations'