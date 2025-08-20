import axiosClient from '@/lib/axiosClient'
import { SalesOrderFormData } from '../types'
import { transformSalesOrderFormToJsonApi, transformSalesOrderItemFormToJsonApi } from '../utils/transformers'

export const salesService = {
  orders: {
    getAll: async (params?: any) => {
      try {
        console.log('🚀 [Service] Fetching sales orders with params:', params)
        
        // Build query string for filtering and includes
        const queryParams = new URLSearchParams()
        
        // Add includes for relationships
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
        const response = await axiosClient.get(`/api/v1/sales-orders/${id}?include=contact,items.product`)
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
    getAll: async (params?: any) => {
      try {
        console.log('🚀 [Service] Fetching sales order items with params:', params)
        
        const queryParams = new URLSearchParams()
        
        // Add includes for relationships
        queryParams.append('include', 'product,sales_order')
        
        // Add filters if provided
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
              queryParams.append(key, params[key])
            }
          })
        }
        
        const queryString = queryParams.toString()
        const url = queryString ? `/api/v1/sales-order-items?${queryString}` : '/api/v1/sales-order-items?include=product,sales_order'
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Sales order items response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching sales order items:', error)
        throw error
      }
    },
    
    create: async (data: any) => {
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
    
    update: async (id: string, data: any) => {
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
  getReports: async (period = 30): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching sales reports for period:', period)
      const response = await axiosClient.get(`/api/v1/sales-orders/reports?period=${period}`)
      console.log('✅ [Service] Sales reports response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching sales reports:', error)
      throw error
    }
  },
  
  getCustomers: async (period = 90): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching customer reports for period:', period)
      const response = await axiosClient.get(`/api/v1/sales-orders/customers?period=${period}`)
      console.log('✅ [Service] Customer reports response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching customer reports:', error)
      throw error
    }
  },
  
  getSalesAnalytics: async (dateFrom?: string, dateTo?: string): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching sales analytics from:', dateFrom, 'to:', dateTo)
      
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      
      const queryString = params.toString()
      const url = queryString ? `/api/v1/sales-orders/analytics?${queryString}` : '/api/v1/sales-orders/analytics'
      
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Sales analytics response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching sales analytics:', error)
      throw error
    }
  }
}

// Contacts service for sales order creation
export const salesContactsService = {
  getAll: async (params?: any) => {
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
  getAll: async (params?: any) => {
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