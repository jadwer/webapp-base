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
      const transformed = transformSalesOrdersResponse(response)
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
      const transformed = transformSalesOrdersResponse(response)
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
      const transformed = transformSalesOrderItemsResponse(response)
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
    const response = await salesService.orders.create(data)
    return response
  }, [])

  const updateSalesOrder = useCallback(async (id: string, data: SalesOrderFormData) => {
    const response = await salesService.orders.update(id, data)
    return response
  }, [])

  const deleteSalesOrder = useCallback(async (id: string) => {
    await salesService.orders.delete(id)
  }, [])

  const updateSalesOrderTotals = useCallback(async (id: string, totals: { totalAmount: number, subtotalAmount?: number, taxAmount?: number }) => {
    const response = await salesService.orders.updateTotals(id, totals)
    return response
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
    const response = await salesService.items.create(data)
    return response
  }, [])

  const updateSalesOrderItem = useCallback(async (id: string, data: Record<string, unknown>) => {
    const response = await salesService.items.update(id, data)
    return response
  }, [])

  const deleteSalesOrderItem = useCallback(async (id: string) => {
    await salesService.items.delete(id)
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