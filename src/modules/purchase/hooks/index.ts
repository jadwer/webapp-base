import useSWR from 'swr'
import { useCallback } from 'react'
import { purchaseService, purchaseReportsService, purchaseContactsService, purchaseProductsService } from '../services'
import { transformPurchaseOrdersResponse, transformPurchaseOrderItemsResponse } from '../utils/transformers'
import { PurchaseOrderFormData, PurchaseOrderFilters } from '../types'

// Purchase Orders Hooks
export const usePurchaseOrders = (params?: PurchaseOrderFilters) => {
  // Convert filters to API query parameters
  const queryParams: any = {}
  
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
    ? ['/api/v1/purchase-orders', queryParams] 
    : '/api/v1/purchase-orders'
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await purchaseService.orders.getAll(queryParams)
      console.log('🔄 [Hook] Raw purchase orders response:', response)
      const transformed = transformPurchaseOrdersResponse(response)
      console.log('✅ [Hook] Transformed purchase orders:', transformed)
      return transformed
    }
  )

  return {
    purchaseOrders: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate
  }
}

export const usePurchaseOrder = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/purchase-orders/${id}` : null,
    async () => {
      const response = await purchaseService.orders.getById(id)
      console.log('🔄 [Hook] Raw purchase order response:', response)
      const transformed = transformPurchaseOrdersResponse(response)
      console.log('✅ [Hook] Transformed purchase order:', transformed.data[0])
      return transformed.data[0]
    }
  )

  return {
    purchaseOrder: data,
    isLoading,
    error,
    mutate
  }
}

export const usePurchaseOrderItems = (purchaseOrderId?: string) => {
  const params = purchaseOrderId ? { 'filter[purchase_order_id]': purchaseOrderId } : null
  const key = params ? ['/api/v1/purchase-order-items', params] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await purchaseService.items.getAll(params)
      console.log('🔄 [Hook] Raw purchase order items:', response)
      const transformed = transformPurchaseOrderItemsResponse(response)
      console.log('✅ [Hook] Transformed items:', transformed)
      return transformed
    }
  )

  return {
    purchaseOrderItems: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate
  }
}

// Purchase Reports Hooks
export const usePurchaseReports = (period = 30) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/purchase-orders/reports?period=${period}`,
    () => purchaseReportsService.getReports(period)
  )

  return {
    reports: data,
    isLoading,
    error,
    mutate
  }
}

export const usePurchaseSuppliers = (period = 90) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/purchase-orders/suppliers?period=${period}`,
    () => purchaseReportsService.getSuppliers(period)
  )

  return {
    suppliers: data,
    isLoading,
    error,
    mutate
  }
}

export const usePurchaseAnalytics = (dateFrom?: string, dateTo?: string) => {
  const key = dateFrom || dateTo 
    ? `/api/v1/purchase-orders/analytics?${new URLSearchParams({ 
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      }).toString()}`
    : '/api/v1/purchase-orders/analytics'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => purchaseReportsService.getPurchaseAnalytics(dateFrom, dateTo)
  )

  return {
    analytics: data,
    isLoading,
    error,
    mutate
  }
}

// Purchase Contacts Hook (for supplier dropdowns)
export const usePurchaseContacts = (params?: any) => {
  const queryParams = params || { 'filter[active]': '1' }
  const key = ['/api/v1/contacts', queryParams]
  
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const response = await purchaseContactsService.getAll(queryParams)
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

// Purchase Products Hook (for order items)
export const usePurchaseProducts = (params?: any) => {
  const queryParams = params || { 'filter[active]': '1' }
  const key = ['/api/v1/products', queryParams]
  
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const response = await purchaseProductsService.getAll(queryParams)
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

// Purchase Order Mutations Hook
export const usePurchaseOrderMutations = () => {
  const createPurchaseOrder = useCallback(async (data: PurchaseOrderFormData) => {
    console.log('🚀 [Mutation] Creating purchase order:', data.orderNumber)
    try {
      const response = await purchaseService.orders.create(data)
      console.log('✅ [Mutation] Purchase order created successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error creating purchase order:', error)
      throw error
    }
  }, [])

  const updatePurchaseOrder = useCallback(async (id: string, data: PurchaseOrderFormData) => {
    console.log('📝 [Mutation] Updating purchase order:', id)
    try {
      const response = await purchaseService.orders.update(id, data)
      console.log('✅ [Mutation] Purchase order updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating purchase order:', error)
      throw error
    }
  }, [])

  const deletePurchaseOrder = useCallback(async (id: string) => {
    console.log('🗑️ [Mutation] Deleting purchase order:', id)
    try {
      await purchaseService.orders.delete(id)
      console.log('✅ [Mutation] Purchase order deleted successfully')
    } catch (error) {
      console.error('❌ [Mutation] Error deleting purchase order:', error)
      throw error
    }
  }, [])

  return {
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
  }
}

// Purchase Order Items Mutations Hook
export const usePurchaseOrderItemMutations = () => {
  const createPurchaseOrderItem = useCallback(async (data: any) => {
    console.log('🚀 [Mutation] Creating purchase order item:', data)
    try {
      const response = await purchaseService.items.create(data)
      console.log('✅ [Mutation] Purchase order item created successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error creating purchase order item:', error)
      throw error
    }
  }, [])

  const updatePurchaseOrderItem = useCallback(async (id: string, data: any) => {
    console.log('📝 [Mutation] Updating purchase order item:', id)
    try {
      const response = await purchaseService.items.update(id, data)
      console.log('✅ [Mutation] Purchase order item updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating purchase order item:', error)
      throw error
    }
  }, [])

  const deletePurchaseOrderItem = useCallback(async (id: string) => {
    console.log('🗑️ [Mutation] Deleting purchase order item:', id)
    try {
      await purchaseService.items.delete(id)
      console.log('✅ [Mutation] Purchase order item deleted successfully')
    } catch (error) {
      console.error('❌ [Mutation] Error deleting purchase order item:', error)
      throw error
    }
  }, [])

  return {
    createPurchaseOrderItem,
    updatePurchaseOrderItem,
    deletePurchaseOrderItem
  }
}

// Combined hook for purchase order with items
export const usePurchaseOrderWithItems = (id: string) => {
  const { purchaseOrder, isLoading: orderLoading, error: orderError, mutate: mutateOrder } = usePurchaseOrder(id)
  const { purchaseOrderItems, isLoading: itemsLoading, error: itemsError, mutate: mutateItems } = usePurchaseOrderItems(id)

  return {
    purchaseOrder,
    purchaseOrderItems,
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