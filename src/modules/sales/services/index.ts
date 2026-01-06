import axiosClient from '@/lib/axiosClient'
import { SalesOrderFormData } from '../types'
import { transformSalesOrderFormToJsonApi, transformSalesOrderItemFormToJsonApi } from '../utils/transformers'

export const salesService = {
  orders: {
    getAll: async (params?: Record<string, string | number>) => {
      try {
        console.log('🚀 [Service] Fetching sales orders with params:', params)
        
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
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Sales orders response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching sales orders:', error)
        throw error
      }
    },
    
    getById: async (id: string) => {
      try {
        console.log('🚀 [Service] Fetching sales order by ID:', id)
        const response = await axiosClient.get(`/api/v1/sales-orders/${id}?include=contact,items`)
        console.log('✅ [Service] Sales order response:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching sales order:', error)
        throw error
      }
    },
    
    create: async (data: SalesOrderFormData) => {
      try {
        console.log('🚀 [Service] Creating sales order:', data)
        const payload = transformSalesOrderFormToJsonApi(data)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.post('/api/v1/sales-orders', payload)
        console.log('✅ [Service] Created sales order:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error creating sales order:', error)
        throw error
      }
    },
    
    update: async (id: string, data: SalesOrderFormData) => {
      try {
        console.log('🚀 [Service] Updating sales order:', id, data)
        const payload = transformSalesOrderFormToJsonApi(data, 'sales-orders', id)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/sales-orders/${id}`, payload)
        console.log('✅ [Service] Updated sales order:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating sales order:', error)
        throw error
      }
    },

    updateTotals: async (id: string, totals: { totalAmount: number, subtotalAmount?: number, taxAmount?: number }) => {
      try {
        console.log('🚀 [Service] Updating sales order totals:', id, totals)
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
        console.log('📦 [Service] Totals update payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/sales-orders/${id}`, payload)
        console.log('✅ [Service] Updated sales order totals:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating sales order totals:', error)
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        console.log('🚀 [Service] Deleting sales order:', id)
        await axiosClient.delete(`/api/v1/sales-orders/${id}`)
        console.log('✅ [Service] Deleted sales order:', id)
      } catch (error) {
        console.error('❌ [Service] Error deleting sales order:', error)
        throw error
      }
    }
  },
  
  items: {
    getAll: async (params?: Record<string, string | number>) => {
      try {
        console.log('🚀 [Service] Fetching sales order items with params:', params)
        
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
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Sales order items response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching sales order items:', error)
        throw error
      }
    },
    
    create: async (data: Record<string, unknown>) => {
      try {
        console.log('🚀 [Service] Creating sales order item:', data)
        const payload = transformSalesOrderItemFormToJsonApi(data)
        console.log('📦 [Service] JSON:API payload:', payload)

        const response = await axiosClient.post('/api/v1/sales-order-items', payload)
        console.log('✅ [Service] Created sales order item:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error creating sales order item:', error)
        throw error
      }
    },

    update: async (id: string, data: Record<string, unknown>) => {
      try {
        console.log('🚀 [Service] Updating sales order item:', id, data)
        const payload = transformSalesOrderItemFormToJsonApi(data, 'sales-order-items', id)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/sales-order-items/${id}`, payload)
        console.log('✅ [Service] Updated sales order item:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating sales order item:', error)
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        console.log('🚀 [Service] Deleting sales order item:', id)
        await axiosClient.delete(`/api/v1/sales-order-items/${id}`)
        console.log('✅ [Service] Deleted sales order item:', id)
      } catch (error) {
        console.error('❌ [Service] Error deleting sales order item:', error)
        throw error
      }
    }
  }
}

export const salesReportsService = {
  // Sales Reports Summary - período en días, respuesta JSON:API
  getReports: async (period = 30): Promise<Record<string, unknown>> => {
    try {
      console.log('📊 [Service] Fetching sales reports summary for period:', period)
      const response = await axiosClient.get(`/api/v1/sales-orders/reports?period=${period}`)
      console.log('✅ [Service] Sales reports response:', response.data)
      
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
    } catch (error) {
      console.error('❌ [Service] Error fetching sales reports:', error)
      throw error
    }
  },
  
  // Sales Customer Analytics - período en días, respuesta JSON:API
  getCustomers: async (period = 90): Promise<Record<string, unknown>> => {
    try {
      console.log('👥 [Service] Fetching customer analytics for period:', period)
      const response = await axiosClient.get(`/api/v1/sales-orders/customers?period=${period}`)
      console.log('✅ [Service] Customer analytics response:', response.data)
      
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
    } catch (error) {
      console.error('❌ [Service] Error fetching customer analytics:', error)
      throw error
    }
  }
}

// Contacts service for sales order creation
export const salesContactsService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      console.log('🚀 [Service] Fetching contacts for sales:', params)
      
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
      console.log('✅ [Service] Contacts response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching contacts:', error)
      throw error
    }
  }
}

// Products service for sales order items
export const salesProductsService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      console.log('🚀 [Service] Fetching products for sales:', params)

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
      console.log('✅ [Service] Products response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching products:', error)
      throw error
    }
  }
}

// DiscountRules Service - v1.1 (SA-M003)
export { discountRulesService } from './discountRulesService'