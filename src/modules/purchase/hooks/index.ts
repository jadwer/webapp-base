import useSWR, { useSWRConfig } from 'swr'
import { useCallback, useState } from 'react'
import { purchaseService, purchaseReportsService, purchaseContactsService, purchaseProductsService, budgetsService } from '../services'
import { transformPurchaseOrdersResponse, transformPurchaseOrderItemsResponse } from '../utils/transformers'
import { PurchaseOrderFormData, PurchaseOrderFilters, BudgetFilters, BudgetSortOptions, CreateBudgetRequest, UpdateBudgetRequest, ParsedBudget } from '../types'

// Purchase Orders Hooks
export const usePurchaseOrders = (params?: PurchaseOrderFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, string> = {}
  
  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.contactId) {
    queryParams['filter[contact_id]'] = String(params.contactId)
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
  const params = purchaseOrderId ? { 'filter[purchaseOrderId]': purchaseOrderId } : null
  const key = params ? ['/api/v1/purchase-order-items', params as Record<string, string>] : null
  
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

// Purchase Reports Hooks - usar fechas específicas según documentación API
export const usePurchaseReports = (startDate = '1980-01-01', endDate = '2025-12-31') => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/purchase-orders/reports?start_date=${startDate}&end_date=${endDate}`,
    () => purchaseReportsService.getReports(startDate, endDate)
  )

  return {
    reports: data,
    isLoading,
    error,
    mutate
  }
}

export const usePurchaseSuppliers = (startDate = '1980-01-01', endDate = '2025-12-31') => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/purchase-orders/suppliers?start_date=${startDate}&end_date=${endDate}`,
    () => purchaseReportsService.getSuppliers(startDate, endDate)
  )

  return {
    suppliers: data,
    isLoading,
    error,
    mutate
  }
}

// Purchase Contacts Hook (for supplier dropdowns)
export const usePurchaseContacts = (params?: Record<string, string>) => {
  // ✅ Usar filtro CORRECTO que funciona: filter[isSupplier]=1
  const queryParams = params || {
    'filter[isSupplier]': '1'
  }
  const key = ['/api/v1/contacts', queryParams]
  
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const response = await purchaseContactsService.getAll(queryParams)
      console.log('🔄 [Hook] Raw contacts response:', response)
      console.log('🏭 [Hook] Suppliers loaded:', response?.data?.length || 0)
      console.log('📡 [Hook] Request URL: /api/v1/contacts?filter[isSupplier]=1')
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
export const usePurchaseProducts = (params?: Record<string, string>) => {
  // TODO: Implementar Status - agregar filter[status]=active después de la presentación
  const queryParams = params || {}
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

  const updatePurchaseOrderTotals = useCallback(async (id: string, totals: { totalAmount: number }) => {
    console.log('💰 [Mutation] Updating purchase order totals:', id, totals)
    try {
      const response = await purchaseService.orders.updateTotals(id, totals)
      console.log('✅ [Mutation] Purchase order totals updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ [Mutation] Error updating purchase order totals:', error)
      throw error
    }
  }, [])

  return {
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderTotals,
    deletePurchaseOrder
  }
}

// Purchase Order Items Mutations Hook
export const usePurchaseOrderItemMutations = () => {
  const createPurchaseOrderItem = useCallback(async (data: Record<string, unknown>) => {
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

  const updatePurchaseOrderItem = useCallback(async (id: string, data: Record<string, unknown>) => {
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

// ===== BUDGET HOOKS (v1.1) =====

interface UseBudgetsOptions {
  filters?: BudgetFilters;
  sort?: BudgetSortOptions;
  page?: number;
  pageSize?: number;
}

/**
 * Hook to fetch budgets with optional filters, sorting, and pagination
 */
export const useBudgets = (options?: UseBudgetsOptions) => {
  const { filters, sort, page = 1, pageSize = 20 } = options || {}

  // Build cache key from options
  const cacheKey = JSON.stringify({ filters, sort, page, pageSize })

  const { data, error, isLoading, mutate } = useSWR(
    [`/api/v1/budgets`, cacheKey],
    () => budgetsService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    budgets: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single budget by ID
 */
export const useBudget = (options: { id: string | null }) => {
  const { id } = options

  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/budgets/${id}` : null,
    () => (id ? budgetsService.getById(id) : null),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    budget: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for budget mutations (create, update, delete)
 */
export const useBudgetMutations = () => {
  const { mutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  const invalidateBudgetCache = useCallback(() => {
    // Invalidate all budget-related cache keys
    mutate(
      (key: unknown) => {
        if (typeof key === 'string' && key.startsWith('/api/v1/budgets')) {
          return true
        }
        if (Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith('/api/v1/budgets')) {
          return true
        }
        return false
      },
      undefined,
      { revalidate: true }
    )
  }, [mutate])

  const createBudget = useCallback(
    async (data: CreateBudgetRequest): Promise<ParsedBudget> => {
      setIsLoading(true)
      try {
        const result = await budgetsService.create(data)
        invalidateBudgetCache()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateBudgetCache]
  )

  const updateBudget = useCallback(
    async (id: string, data: UpdateBudgetRequest): Promise<ParsedBudget> => {
      setIsLoading(true)
      try {
        const result = await budgetsService.update(id, data)
        invalidateBudgetCache()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateBudgetCache]
  )

  const deleteBudget = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true)
      try {
        await budgetsService.delete(id)
        invalidateBudgetCache()
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateBudgetCache]
  )

  return {
    createBudget,
    updateBudget,
    deleteBudget,
    isLoading,
  }
}

/**
 * Hook to fetch budget summary statistics
 */
export const useBudgetSummary = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/budgets/summary',
    () => budgetsService.getSummary(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    summary: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch budgets that need attention
 */
export const useBudgetsNeedingAttention = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/budgets/needs-attention',
    () => budgetsService.getNeedsAttention(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    budgets: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch current/active budgets
 */
export const useCurrentBudgets = (page: number = 1, pageSize: number = 20) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`/api/v1/budgets/current`, page, pageSize],
    () => budgetsService.getCurrent(page, pageSize),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    budgets: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  }
}