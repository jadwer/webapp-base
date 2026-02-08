import axiosClient from '@/lib/axiosClient'
import { PurchaseOrderFormData, BudgetFilters, BudgetSortOptions, ParsedBudget, CreateBudgetRequest, UpdateBudgetRequest, BudgetSummary } from '../types'
import {
  transformPurchaseOrderFormToJsonApi,
  transformPurchaseOrderItemFormToJsonApi,
  transformBudgetsFromAPI,
  transformBudgetFromAPI,
  transformBudgetToParsed,
  transformBudgetToAPI,
  transformBudgetUpdateToAPI,
} from '../utils/transformers'
import type { JsonApiResource } from '../types'

export const purchaseService = {
  orders: {
    getAll: async (params?: Record<string, string>) => {
      try {
        // Build query string for filtering and includes
        const queryParams = new URLSearchParams()

        // Add includes for relationships - include contact (supplier) for purchase orders
        queryParams.append('include', 'contact')

        // Add filters if provided
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
              queryParams.append(key, params[key])
            }
          })
        }

        const queryString = queryParams.toString()
        const url = queryString ? `/api/v1/purchase-orders?${queryString}` : '/api/v1/purchase-orders?include=contact'

        const response = await axiosClient.get(url)

        return response.data
      } catch (error) {
        throw error
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axiosClient.get(`/api/v1/purchase-orders/${id}?include=contact,purchaseOrderItems`)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    create: async (data: PurchaseOrderFormData) => {
      try {
        const payload = transformPurchaseOrderFormToJsonApi(data)
        const response = await axiosClient.post('/api/v1/purchase-orders', payload)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    update: async (id: string, data: PurchaseOrderFormData) => {
      try {
        const payload = transformPurchaseOrderFormToJsonApi(data, 'purchase-orders', id)
        const response = await axiosClient.patch(`/api/v1/purchase-orders/${id}`, payload)
        return response.data
      } catch (error) {
        throw error
      }
    },

    updateTotals: async (id: string, totals: { totalAmount: number }) => {
      try {
        const payload = {
          data: {
            type: 'purchase-orders',
            id: id,
            attributes: {
              totalAmount: parseFloat(totals.totalAmount.toString()) // Ensure float
            }
          }
        }
        const response = await axiosClient.patch(`/api/v1/purchase-orders/${id}`, payload)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        await axiosClient.delete(`/api/v1/purchase-orders/${id}`)
      } catch (error) {
        throw error
      }
    },

    // ===== APPROVAL WORKFLOW =====

    /**
     * Submit purchase order for approval
     * Amount-based approval tiers:
     * - < $5,000: Auto-approved
     * - $5,000 - $25,000: Manager approval
     * - $25,000 - $100,000: Director approval
     * - > $100,000: Executive approval
     */
    submitForApproval: async (id: string): Promise<void> => {
      await axiosClient.post(`/api/v1/purchase-orders/${id}/submit-for-approval`)
    },

    /**
     * Approve a purchase order (requires appropriate permission)
     */
    approve: async (id: string, notes?: string): Promise<void> => {
      await axiosClient.post(`/api/v1/purchase-orders/${id}/approve`, { notes })
    },

    /**
     * Reject a purchase order
     */
    reject: async (id: string, reason: string): Promise<void> => {
      await axiosClient.post(`/api/v1/purchase-orders/${id}/reject`, { reason })
    },

    /**
     * Get approval status for a purchase order
     */
    getApprovalStatus: async (id: string): Promise<{
      status: string
      requiredLevel: string
      submittedAt: string | null
      submittedBy: { id: number; name: string } | null
      approvers: Array<{ level: string; user: { id: number; name: string } | null; status: string }>
    }> => {
      const response = await axiosClient.get(`/api/v1/purchase-orders/${id}/approval-status`)
      return response.data
    },

    // ===== RECEIVING =====

    /**
     * Receive items for a purchase order
     * Creates inventory movements and potentially an AP Invoice if fully received
     */
    receive: async (id: string, data: {
      items: Array<{ itemId: number; receivedQuantity: number; batchNumber?: string; notes?: string }>
      receivedDate: string
      notes?: string
    }): Promise<{
      received: boolean
      inventoryMovements: Array<{ id: number; productId: number; quantity: number; movementType: string }>
      apInvoice?: { id: number; invoiceNumber: string }
    }> => {
      const response = await axiosClient.post(`/api/v1/purchase-orders/${id}/receive`, data)
      return response.data
    },

    // ===== BUDGET VALIDATION =====

    /**
     * Check budget availability before creating a PO
     */
    checkBudget: async (categoryId: number, amount: number): Promise<{
      approved: boolean
      error?: string
      budget: {
        id: number
        name: string
        remaining: number
        requested?: number
        overage?: number
      }
    }> => {
      const response = await axiosClient.post('/api/v1/purchase-orders/check-budget', {
        categoryId,
        amount
      })
      return response.data
    },

    // ===== THREE-WAY MATCH =====

    /**
     * Get three-way match status (PO vs Receipt vs Invoice)
     */
    getThreeWayMatch: async (id: string): Promise<{
      status: 'matched' | 'variance_detected' | 'pending'
      purchaseOrder: {
        total: number
        items: Array<{ productId: number; quantity: number; unitPrice: number }>
      }
      receipt: {
        total: number
        items: Array<{ productId: number; receivedQuantity: number }>
      } | null
      invoice: {
        total: number
        items: Array<{ productId: number; quantity: number; unitPrice: number }>
      } | null
      variances: Array<{
        type: 'price' | 'quantity'
        productId: number
        poPrice?: number
        invoicePrice?: number
        poQuantity?: number
        receivedQuantity?: number
        variance: number
        percentVariance: number
      }>
      requiresApproval: boolean
    }> => {
      const response = await axiosClient.get(`/api/v1/purchase-orders/${id}/three-way-match`)
      return response.data
    }
  },


  items: {
    getAll: async (params?: Record<string, string> | null) => {
      try {
        const queryParams = new URLSearchParams()

        // Add includes for relationships - API doesn't support nested includes
        queryParams.append('include', 'product,purchaseOrder')

        // Add filters if provided
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
              queryParams.append(key, params[key])
            }
          })
        }

        const queryString = queryParams.toString()
        const url = queryString ? `/api/v1/purchase-order-items?${queryString}` : '/api/v1/purchase-order-items?include=product,purchaseOrder'

        const response = await axiosClient.get(url)

        return response.data
      } catch (error) {
        throw error
      }
    },


    create: async (data: Record<string, unknown>) => {
      try {
        const payload = transformPurchaseOrderItemFormToJsonApi(data)
        const response = await axiosClient.post('/api/v1/purchase-order-items', payload)
        return response.data
      } catch (error) {
        throw error
      }
    },


    update: async (id: string, data: Record<string, unknown>) => {
      try {
        const payload = transformPurchaseOrderItemFormToJsonApi(data, 'purchase-order-items', id)
        const response = await axiosClient.patch(`/api/v1/purchase-order-items/${id}`, payload)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        await axiosClient.delete(`/api/v1/purchase-order-items/${id}`)
      } catch (error) {
        throw error
      }
    }
  }
}

export const purchaseReportsService = {
  // Purchase Reports Summary - fechas específicas, estructura simple (no JSON:API)
  getReports: async (startDate = '1980-01-01', endDate = '2025-12-31'): Promise<Record<string, unknown>> => {
    try {
      const response = await axiosClient.get(`/api/v1/purchase-orders/reports?start_date=${startDate}&end_date=${endDate}`)
      
      // Estructura exacta según curl: { data: { summary, by_status, by_supplier, monthly_trend }, period }
      const data = response.data?.data
      if (data) {
        return {
          // Summary fields - nombres exactos de la API real
          totalOrders: data.summary?.total_orders || 0,
          totalAmount: parseFloat(data.summary?.total_amount || 0),
          averageOrderValue: parseFloat(data.summary?.average_order_value || 0),
          pendingOrders: data.summary?.pending_orders || 0,
          completedOrders: data.summary?.completed_orders || 0,
          
          // Arrays con nombres exactos de Purchase API real
          byStatus: data.by_status || [],        // ← by_status (no sales_by_status)
          bySupplier: data.by_supplier || [],    // ← by_supplier (no top_customers)  
          monthlyTrend: data.monthly_trend || [], // ← monthly_trend (no sales_trend)
          
          // Period info
          period: response.data.period,
          raw: response.data // datos completos incluyendo period
        }
      }
      
      return response.data
    } catch (error) {
      throw error
    }
  },


  // Purchase Suppliers Analytics - fechas específicas
  getSuppliers: async (startDate = '1980-01-01', endDate = '2025-12-31'): Promise<Record<string, unknown>> => {
    try {
      const response = await axiosClient.get(`/api/v1/purchase-orders/suppliers?start_date=${startDate}&end_date=${endDate}`)


      // Estructura exacta JSON:API según curl: { data: [{ id, type, attributes }], meta }
      const suppliers = (response.data?.data || []) as Array<{
        id: string
        attributes?: Record<string, unknown>
      }>
      const meta = response.data?.meta || {}

      return {
        suppliers: suppliers.map((supplier) => ({
          id: supplier.id,
          name: supplier.attributes?.supplier_name,        // ← supplier_name según curl real
          email: supplier.attributes?.supplier_email,      // ← supplier_email según curl real
          phone: supplier.attributes?.supplier_phone,      // ← supplier_phone según curl real
          classification: supplier.attributes?.supplier_classification,
          totalOrders: supplier.attributes?.total_orders || 0,
          totalPurchased: parseFloat(String(supplier.attributes?.total_purchased || 0)), // ← total_purchased según curl real
          lastOrderDate: supplier.attributes?.last_order_date,
          averageOrderValue: parseFloat(String(supplier.attributes?.average_order_value || 0)),
          orders: supplier.attributes?.orders || []
        })),
        meta: {
          totalSuppliers: meta.total_suppliers || 0,    // ← total_suppliers según curl real
          period: meta.period,
          generatedAt: meta.generated_at
        }
      }
    } catch (error) {
      throw error
    }
  }
}

// Contacts service for purchase order creation (suppliers)
export const purchaseContactsService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      const queryParams = new URLSearchParams()

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key])
          }
        })
      }

      const url = queryParams.toString() ? `/api/v1/contacts?${queryParams.toString()}` : '/api/v1/contacts'

      const response = await axiosClient.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Products service for purchase order items
export const purchaseProductsService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('include', 'unit,category,brand')

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key])
          }
        })
      }

      const queryString = queryParams.toString()
      const url = `/api/v1/products?${queryString}`

      const response = await axiosClient.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// ===== BUDGET SERVICE (v1.1) =====

export const budgetsService = {
  /**
   * Get all budgets with optional filters, sorting, and pagination
   */
  async getAll(
    filters?: BudgetFilters,
    sort?: BudgetSortOptions,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ParsedBudget[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    const params: Record<string, string> = {}

    // Apply filters
    if (filters?.budgetType) params['filter[budget_type]'] = filters.budgetType
    if (filters?.periodType) params['filter[period_type]'] = filters.periodType
    if (filters?.departmentCode) params['filter[department_code]'] = filters.departmentCode
    if (filters?.categoryId) params['filter[category_id]'] = String(filters.categoryId)
    if (filters?.contactId) params['filter[contact_id]'] = String(filters.contactId)
    if (filters?.fiscalYear) params['filter[fiscal_year]'] = String(filters.fiscalYear)
    if (filters?.isActive !== undefined) params['filter[is_active]'] = filters.isActive ? '1' : '0'
    if (filters?.current) params['filter[current]'] = 'true'
    if (filters?.overWarning) params['filter[over_warning]'] = 'true'
    if (filters?.overCritical) params['filter[over_critical]'] = 'true'

    // Apply sorting
    if (sort) {
      const sortPrefix = sort.direction === 'desc' ? '-' : ''
      const fieldMap: Record<string, string> = {
        name: 'name',
        code: 'code',
        budgetType: 'budget_type',
        periodType: 'period_type',
        startDate: 'start_date',
        endDate: 'end_date',
        budgetedAmount: 'budgeted_amount',
        isActive: 'is_active',
        createdAt: 'created_at',
      }
      params.sort = `${sortPrefix}${fieldMap[sort.field] || sort.field}`
    }

    // Apply pagination
    params['page[number]'] = String(page)
    params['page[size]'] = String(pageSize)

    // Include relationships
    params.include = 'category,contact'

    const response = await axiosClient.get('/api/v1/budgets', { params })
    const transformedData = transformBudgetsFromAPI(response.data)

    return {
      data: transformedData,
      meta: response.data.meta?.page ? {
        currentPage: response.data.meta.page.currentPage || page,
        perPage: response.data.meta.page.perPage || pageSize,
        total: response.data.meta.page.total || transformedData.length,
        lastPage: response.data.meta.page.lastPage || 1,
      } : undefined,
    }
  },

  /**
   * Get a single budget by ID
   */
  async getById(id: string): Promise<ParsedBudget> {
    const response = await axiosClient.get(`/api/v1/budgets/${id}?include=category,contact,allocations`)
    const budget = transformBudgetFromAPI(response.data.data as JsonApiResource, response.data.included || [])
    return transformBudgetToParsed(budget)
  },

  /**
   * Create a new budget
   */
  async create(data: CreateBudgetRequest): Promise<ParsedBudget> {
    const payload = transformBudgetToAPI(data)
    const response = await axiosClient.post('/api/v1/budgets', payload)
    const budget = transformBudgetFromAPI(response.data.data as JsonApiResource)
    return transformBudgetToParsed(budget)
  },

  /**
   * Update an existing budget
   */
  async update(id: string, data: UpdateBudgetRequest): Promise<ParsedBudget> {
    const payload = transformBudgetUpdateToAPI(id, data)
    const response = await axiosClient.patch(`/api/v1/budgets/${id}`, payload)
    const budget = transformBudgetFromAPI(response.data.data as JsonApiResource)
    return transformBudgetToParsed(budget)
  },

  /**
   * Delete a budget
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/budgets/${id}`)
  },

  /**
   * Get budget summary statistics
   */
  async getSummary(): Promise<BudgetSummary> {
    const response = await axiosClient.get('/api/v1/budgets/summary')
    const data = response.data.data || response.data
    return {
      totalBudgets: data.totalBudgets || data.total_budgets || 0,
      activeBudgets: data.activeBudgets || data.active_budgets || 0,
      totalBudgeted: data.totalBudgeted || data.total_budgeted || 0,
      totalCommitted: data.totalCommitted || data.total_committed || 0,
      totalSpent: data.totalSpent || data.total_spent || 0,
      totalAvailable: data.totalAvailable || data.total_available || 0,
      budgetsOverWarning: data.budgetsOverWarning || data.budgets_over_warning || 0,
      budgetsOverCritical: data.budgetsOverCritical || data.budgets_over_critical || 0,
    }
  },

  /**
   * Get budgets that need attention (over warning or critical threshold)
   */
  async getNeedsAttention(): Promise<ParsedBudget[]> {
    const response = await axiosClient.get('/api/v1/budgets/needs-attention')
    const data = response.data.data || []
    return data.map((item: Record<string, unknown>) => {
      // This endpoint returns simplified data, map it
      return {
        id: String(item.id),
        name: item.name as string,
        code: item.code as string,
        budgetedAmount: item.budgeted_amount as number,
        utilizationPercent: item.utilization_percent as number,
        statusLevel: item.status_level as string,
        availableAmount: item.available_amount as number,
        // Parsed fields
        budgetedAmountDisplay: (item.budgeted_amount as number).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        utilizationDisplay: `${(item.utilization_percent as number).toFixed(1)}%`,
      } as ParsedBudget
    })
  },

  /**
   * Get current/active budgets only
   */
  async getCurrent(page: number = 1, pageSize: number = 20): Promise<{ data: ParsedBudget[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    return this.getAll({ current: true, isActive: true }, { field: 'name', direction: 'asc' }, page, pageSize)
  },

  /**
   * Get budgets by type
   */
  async getByType(
    budgetType: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ParsedBudget[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    return this.getAll({ budgetType: budgetType as BudgetFilters['budgetType'] }, { field: 'name', direction: 'asc' }, page, pageSize)
  },
}

// Export individual functions for Budgets
export const getBudgets = (params?: {
  filters?: BudgetFilters;
  sort?: BudgetSortOptions;
  page?: number;
  pageSize?: number;
}) => budgetsService.getAll(params?.filters, params?.sort, params?.page, params?.pageSize)

export const getBudget = (id: string) => budgetsService.getById(id)
export const createBudget = (data: CreateBudgetRequest) => budgetsService.create(data)
export const updateBudget = (id: string, data: UpdateBudgetRequest) => budgetsService.update(id, data)
export const deleteBudget = (id: string) => budgetsService.delete(id)