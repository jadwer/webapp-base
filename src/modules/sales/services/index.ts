import axiosClient from '@/lib/axiosClient'
import { SalesOrderFormData } from '../types'
import { transformSalesOrderFormToJsonApi, transformSalesOrderItemFormToJsonApi } from '../utils/transformers'

export const salesService = {
  orders: {
    getAll: async (params?: Record<string, string | number>) => {
      // Build query string for filtering and includes
      const queryParams = new URLSearchParams()

      // Add includes for relationships - include contact for better performance
      queryParams.append('include', 'contact')

      // Add filters if provided
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString ? `/api/v1/sales-orders?${queryString}` : '/api/v1/sales-orders?include=contact'

      const response = await axiosClient.get(url)
      return response.data
    },

    getById: async (id: string) => {
      const response = await axiosClient.get(`/api/v1/sales-orders/${id}?include=contact,items`)
      return response.data
    },

    create: async (data: SalesOrderFormData) => {
      const payload = transformSalesOrderFormToJsonApi(data)
      const response = await axiosClient.post('/api/v1/sales-orders', payload)
      return response.data
    },

    update: async (id: string, data: SalesOrderFormData) => {
      const payload = transformSalesOrderFormToJsonApi(data, 'sales-orders', id)
      const response = await axiosClient.patch(`/api/v1/sales-orders/${id}`, payload)
      return response.data
    },

    updateTotals: async (id: string, totals: { totalAmount: number, subtotalAmount?: number, taxAmount?: number }) => {
      const payload = {
        data: {
          type: 'sales-orders',
          id: id,
          attributes: {
            total_amount: parseFloat(totals.totalAmount.toString()), // Ensure float
            subtotal_amount: parseFloat((totals.subtotalAmount || totals.totalAmount).toString()), // Ensure float
            tax_amount: parseFloat((totals.taxAmount || 0).toString()) // Ensure float
          }
        }
      }
      const response = await axiosClient.patch(`/api/v1/sales-orders/${id}`, payload)
      return response.data
    },

    delete: async (id: string) => {
      await axiosClient.delete(`/api/v1/sales-orders/${id}`)
    },

    cancel: async (id: string) => {
      const response = await axiosClient.post(`/api/v1/sales-orders/${id}/cancel`)
      return response.data
    }
  },

  items: {
    getAll: async (params?: Record<string, string | number>) => {
      const queryParams = new URLSearchParams()

      // Add includes for relationships - API doesn't support nested includes
      queryParams.append('include', 'product,salesOrder')

      // Add filters if provided
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString ? `/api/v1/sales-order-items?${queryString}` : '/api/v1/sales-order-items?include=product,salesOrder'

      const response = await axiosClient.get(url)
      return response.data
    },

    create: async (data: Record<string, unknown>) => {
      const payload = transformSalesOrderItemFormToJsonApi(data)
      const response = await axiosClient.post('/api/v1/sales-order-items', payload)
      return response.data
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const payload = transformSalesOrderItemFormToJsonApi(data, 'sales-order-items', id)
      const response = await axiosClient.patch(`/api/v1/sales-order-items/${id}`, payload)
      return response.data
    },

    delete: async (id: string) => {
      await axiosClient.delete(`/api/v1/sales-order-items/${id}`)
    }
  }
}

export const salesReportsService = {
  // Sales Reports Summary - período en días, respuesta JSON:API
  getReports: async (period = 30): Promise<Record<string, unknown>> => {
    const response = await axiosClient.get(`/api/v1/sales-orders/reports?period=${period}`)

    // Extraer datos de la estructura JSON:API según documentación exacta
    const attributes = response.data?.data?.attributes
    if (attributes) {
      return {
        ...attributes,
        // Summary fields - nombres exactos de Sales API
        totalOrders: attributes.summary?.total_orders || 0,
        totalRevenue: parseFloat(attributes.summary?.total_revenue || 0),  // ← total_revenue (no total_amount)
        averageOrderValue: parseFloat(attributes.summary?.average_order_value || 0),

        // Arrays con nombres exactos de Sales API
        salesByStatus: attributes.sales_by_status || [],    // ← sales_by_status (no by_status)
        topCustomers: attributes.top_customers || [],       // ← top_customers (no by_supplier)
        salesTrend: attributes.sales_trend || [],           // ← sales_trend (no monthly_trend)

        // Metadata fields
        periodDays: attributes.period_days,
        startDate: attributes.start_date,
        endDate: attributes.end_date,
        generatedAt: attributes.generated_at
      }
    }

    return response.data
  },

  // Sales Customer Analytics - período en días, respuesta JSON:API
  getCustomers: async (period = 90): Promise<Record<string, unknown>> => {
    const response = await axiosClient.get(`/api/v1/sales-orders/customers?period=${period}`)

    // Estructura JSON:API: data es array de customer-sales objects
    const customers = response.data?.data || []
    const meta = response.data?.meta || {}

    return {
      customers: customers.map((customer: Record<string, unknown>) => {
        const attributes = (customer.attributes || {}) as Record<string, unknown>
        return {
          id: customer.id,
          name: attributes.customer_name,         // ← customer_name (no supplier_name)
          email: attributes.customer_email,       // ← customer_email (no supplier_email)
          classification: attributes.customer_classification,
          totalOrders: attributes.total_orders || 0,
          totalRevenue: parseFloat(String(attributes.total_revenue || 0)), // ← total_revenue (no total_purchased)
          lastOrderDate: attributes.last_order_date,
          averageOrderValue: parseFloat(String(attributes.average_order_value || 0)),
          orders: ((attributes.orders as Record<string, unknown>[] || []).map((order: Record<string, unknown>) => ({
            ...order,
            orderNumber: order.order_number  // ← order_number incluido en Sales (no en Purchase)
          }))) || []
        }
      }),
      meta: {
        totalCustomers: meta.total_customers || 0,  // ← total_customers (no total_suppliers)
        periodDays: meta.period_days,
        startDate: meta.start_date,
        endDate: meta.end_date,
        generatedAt: meta.generated_at
      }
    }
  }
}

// Contacts service for sales order creation
export const salesContactsService = {
  getAll: async (params?: Record<string, string>) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key])
        }
      })
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/api/v1/contacts?${queryString}` : '/api/v1/contacts'

    const response = await axiosClient.get(url)
    return response.data
  }
}

// Products service for sales order items
export const salesProductsService = {
  getAll: async (params?: Record<string, string>) => {
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
  }
}

// DiscountRules Service - v1.1 (SA-M003)
export { discountRulesService } from './discountRulesService'

// ============================================================================
// ORDER TRACKING SERVICE
// ============================================================================

export const orderTrackingService = {
  /**
   * Get tracking info for an order
   */
  getTracking: async (orderId: string) => {
    const response = await axiosClient.get(`/api/v1/orders/${orderId}/tracking`)
    return response.data
  },

  /**
   * Update order status (admin)
   */
  updateStatus: async (orderId: string, data: {
    status: string
    notes?: string
    tracking_number?: string
  }) => {
    const response = await axiosClient.post(`/api/v1/orders/${orderId}/status`, data)
    return response.data
  },

  /**
   * Mark order as shipped (admin)
   */
  ship: async (orderId: string, data: {
    tracking_number: string
    tracking_url?: string
    carrier?: string
  }) => {
    const response = await axiosClient.post(`/api/v1/orders/${orderId}/ship`, data)
    return response.data
  },

  /**
   * Get status history for an order
   */
  getStatusHistory: async (orderId: string) => {
    const response = await axiosClient.get(`/api/v1/orders/${orderId}/status-history`)
    return response.data
  }
}

// ============================================================================
// MY ORDERS SERVICE (Customer Portal)
// ============================================================================

export const myOrdersService = {
  /**
   * List customer's own orders
   */
  getAll: async () => {
    const response = await axiosClient.get('/api/v1/my-orders')
    return response.data
  },

  /**
   * Get customer's order details
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/my-orders/${id}`)
    return response.data
  },

  /**
   * Cancel customer's order (draft/confirmed only)
   */
  cancel: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/my-orders/${id}/cancel`)
    return response.data
  },

  /**
   * Request return (delivered only)
   */
  requestReturn: async (id: string, data: {
    reason: string
    items: Array<{ itemId: number; quantity: number; reason: string }>
  }) => {
    const response = await axiosClient.post(`/api/v1/my-orders/${id}/return`, data)
    return response.data
  },

  /**
   * Download invoice
   */
  downloadInvoice: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/my-orders/${id}/invoice`, {
      responseType: 'blob'
    })
    return response.data
  }
}

// ============================================================================
// BACKORDERS SERVICE
// ============================================================================

export const backordersService = {
  /**
   * Get all backorders with optional status filter
   */
  getAll: async (params?: { status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) {
      queryParams.append('filter[status]', params.status)
    }
    const url = queryParams.toString()
      ? `/api/v1/backorders?${queryParams.toString()}`
      : '/api/v1/backorders'
    const response = await axiosClient.get(url)
    return response.data
  },

  /**
   * Get pending backorders for a specific product
   */
  getPendingForProduct: async (productId: number) => {
    const response = await axiosClient.get(`/api/v1/backorders/pending-for-product/${productId}`)
    return response.data
  },

  /**
   * Fulfill backorder (partial or full)
   */
  fulfill: async (id: string, data: { quantity: number; notes?: string }) => {
    const response = await axiosClient.post(`/api/v1/backorders/${id}/fulfill`, data)
    return response.data
  },

  /**
   * Cancel backorder
   */
  cancel: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/backorders/${id}/cancel`)
    return response.data
  },

  /**
   * Auto-fulfill backorders when stock arrives
   */
  fulfillForProduct: async (data: { product_id: number; quantity_available: number }) => {
    const response = await axiosClient.post('/api/v1/backorders/fulfill-for-product', data)
    return response.data
  }
}

// ============================================================================
// SHIPMENTS SERVICE
// ============================================================================

export const shipmentsService = {
  /**
   * Get all shipments
   */
  getAll: async (params?: Record<string, string | number>) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, String(params[key]))
        }
      })
    }
    const url = queryParams.toString()
      ? `/api/v1/shipments?${queryParams.toString()}`
      : '/api/v1/shipments'
    const response = await axiosClient.get(url)
    return response.data
  },

  /**
   * Get shipment by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/shipments/${id}`)
    return response.data
  },

  /**
   * Create shipment
   */
  create: async (data: Record<string, unknown>) => {
    const payload = {
      data: {
        type: 'shipments',
        attributes: data
      }
    }
    const response = await axiosClient.post('/api/v1/shipments', payload)
    return response.data
  },

  /**
   * Update shipment
   */
  update: async (id: string, data: Record<string, unknown>) => {
    const payload = {
      data: {
        type: 'shipments',
        id,
        attributes: data
      }
    }
    const response = await axiosClient.patch(`/api/v1/shipments/${id}`, payload)
    return response.data
  },

  /**
   * Create shipment from a sales order with selected items
   */
  createFromOrder: async (data: {
    sales_order_id: number
    items: Array<{ sales_order_item_id: number; quantity: number }>
    carrier?: string
    tracking_number?: string
    warehouse_id?: number
    notes?: string
  }) => {
    const response = await axiosClient.post('/api/v1/shipments/create-from-order', data)
    return response.data
  },

  /**
   * Mark shipment as shipped
   */
  ship: async (id: string, data?: { tracking_number?: string; carrier?: string }) => {
    const response = await axiosClient.post(`/api/v1/shipments/${id}/ship`, data ?? {})
    return response.data
  },

  /**
   * Mark shipment as delivered
   */
  deliver: async (id: string, data?: { actual_delivery?: string }) => {
    const response = await axiosClient.post(`/api/v1/shipments/${id}/deliver`, data ?? {})
    return response.data
  },

  /**
   * Cancel a shipment
   */
  cancel: async (id: string, data?: { reason?: string }) => {
    const response = await axiosClient.post(`/api/v1/shipments/${id}/cancel`, data ?? {})
    return response.data
  },

  /**
   * Get shipment summary for a sales order
   */
  getOrderSummary: async (orderId: string) => {
    const response = await axiosClient.get(`/api/v1/sales-orders/${orderId}/shipment-summary`)
    return response.data
  }
}

// ============================================================================
// REMISSIONS SERVICE (Delivery Notes)
// ============================================================================

export const remissionsService = {
  /**
   * Get all remissions
   */
  getAll: async (params?: Record<string, string | number>) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, String(params[key]))
        }
      })
    }
    const url = queryParams.toString()
      ? `/api/v1/remissions?${queryParams.toString()}`
      : '/api/v1/remissions'
    const response = await axiosClient.get(url)
    return response.data
  },

  /**
   * Get remission by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/remissions/${id}?include=salesOrder,items`)
    return response.data
  },

  /**
   * Create remission from order with selected items
   */
  createFromOrder: async (data: {
    sales_order_id: number
    warehouse_id?: number
    shipment_id?: number
    items: Array<{
      sales_order_item_id: number
      quantity: number
      batch_number?: string
      expiry_date?: string
      notes?: string
    }>
    shipping_address?: Record<string, string>
    delivery_notes?: string
    internal_notes?: string
  }) => {
    const response = await axiosClient.post('/api/v1/remissions/from-order', data)
    return response.data
  },

  /**
   * Create remission with ALL items from order
   */
  createFromOrderFull: async (data: {
    sales_order_id: number
    warehouse_id?: number
    shipment_id?: number
    shipping_address?: Record<string, string>
    delivery_notes?: string
    internal_notes?: string
  }) => {
    const response = await axiosClient.post('/api/v1/remissions/from-order-full', data)
    return response.data
  },

  /**
   * Get remission statistics summary
   */
  summary: async () => {
    const response = await axiosClient.get('/api/v1/remissions/summary')
    return response.data
  },

  /**
   * Mark remission as printed (generates PDF)
   */
  print: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/remissions/${id}/print`)
    return response.data
  },

  /**
   * Mark remission as delivered
   */
  deliver: async (id: string, data?: { received_by?: string; delivery_notes?: string }) => {
    const response = await axiosClient.post(`/api/v1/remissions/${id}/deliver`, data ?? {})
    return response.data
  },

  /**
   * Cancel a remission
   */
  cancel: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/remissions/${id}/cancel`)
    return response.data
  },

  /**
   * Get all remissions for a specific sales order
   */
  forOrder: async (orderId: string) => {
    const response = await axiosClient.get(`/api/v1/sales-orders/${orderId}/remissions`)
    return response.data
  },

  /**
   * Download remission PDF
   */
  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/api/v1/remissions/${id}/pdf/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Get remission PDF preview URL
   */
  previewPdf: (id: string): string => {
    return `/api/v1/remissions/${id}/pdf/preview`
  }
}

// ============================================================================
// APPLY DISCOUNTS TO ORDER
// ============================================================================

export const applyDiscountsToOrder = async (orderId: string) => {
  const response = await axiosClient.post(`/api/v1/sales-orders/${orderId}/apply-discounts`)
  return response.data
}
