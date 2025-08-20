import axiosClient from '@/lib/axiosClient'
import { PurchaseOrderFormData } from '../types'
import { transformPurchaseOrderFormToJsonApi, transformPurchaseOrderItemFormToJsonApi } from '../utils/transformers'

export const purchaseService = {
  orders: {
    getAll: async (params?: any) => {
      try {
        console.log('🚀 [Service] Fetching purchase orders with params:', params)
        
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
        const url = queryString ? `/api/v1/purchase-orders?${queryString}` : '/api/v1/purchase-orders?include=contact'
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Purchase orders response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching purchase orders:', error)
        throw error
      }
    },
    
    getById: async (id: string) => {
      try {
        console.log('🚀 [Service] Fetching purchase order by ID:', id)
        const response = await axiosClient.get(`/api/v1/purchase-orders/${id}?include=contact,items.product`)
        console.log('✅ [Service] Purchase order response:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching purchase order:', error)
        throw error
      }
    },
    
    create: async (data: PurchaseOrderFormData) => {
      try {
        console.log('🚀 [Service] Creating purchase order:', data)
        const payload = transformPurchaseOrderFormToJsonApi(data)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.post('/api/v1/purchase-orders', payload)
        console.log('✅ [Service] Created purchase order:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error creating purchase order:', error)
        throw error
      }
    },
    
    update: async (id: string, data: PurchaseOrderFormData) => {
      try {
        console.log('🚀 [Service] Updating purchase order:', id, data)
        const payload = transformPurchaseOrderFormToJsonApi(data, 'purchase-orders', id)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/purchase-orders/${id}`, payload)
        console.log('✅ [Service] Updated purchase order:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating purchase order:', error)
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        console.log('🚀 [Service] Deleting purchase order:', id)
        await axiosClient.delete(`/api/v1/purchase-orders/${id}`)
        console.log('✅ [Service] Deleted purchase order:', id)
      } catch (error) {
        console.error('❌ [Service] Error deleting purchase order:', error)
        throw error
      }
    }
  },
  
  items: {
    getAll: async (params?: any) => {
      try {
        console.log('🚀 [Service] Fetching purchase order items with params:', params)
        
        const queryParams = new URLSearchParams()
        
        // Add includes for relationships
        queryParams.append('include', 'product,purchase_order')
        
        // Add filters if provided
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
              queryParams.append(key, params[key])
            }
          })
        }
        
        const queryString = queryParams.toString()
        const url = queryString ? `/api/v1/purchase-order-items?${queryString}` : '/api/v1/purchase-order-items?include=product,purchase_order'
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Purchase order items response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching purchase order items:', error)
        throw error
      }
    },
    
    create: async (data: any) => {
      try {
        console.log('🚀 [Service] Creating purchase order item:', data)
        const payload = transformPurchaseOrderItemFormToJsonApi(data)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.post('/api/v1/purchase-order-items', payload)
        console.log('✅ [Service] Created purchase order item:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error creating purchase order item:', error)
        throw error
      }
    },
    
    update: async (id: string, data: any) => {
      try {
        console.log('🚀 [Service] Updating purchase order item:', id, data)
        const payload = transformPurchaseOrderItemFormToJsonApi(data, 'purchase-order-items', id)
        console.log('📦 [Service] JSON:API payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/purchase-order-items/${id}`, payload)
        console.log('✅ [Service] Updated purchase order item:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating purchase order item:', error)
        throw error
      }
    },
    
    delete: async (id: string) => {
      try {
        console.log('🚀 [Service] Deleting purchase order item:', id)
        await axiosClient.delete(`/api/v1/purchase-order-items/${id}`)
        console.log('✅ [Service] Deleted purchase order item:', id)
      } catch (error) {
        console.error('❌ [Service] Error deleting purchase order item:', error)
        throw error
      }
    }
  }
}

export const purchaseReportsService = {
  getReports: async (period = 30): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching purchase reports for period:', period)
      const response = await axiosClient.get(`/api/v1/purchase-orders/reports?period=${period}`)
      console.log('✅ [Service] Purchase reports response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching purchase reports:', error)
      throw error
    }
  },
  
  getSuppliers: async (period = 90): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching supplier reports for period:', period)
      const response = await axiosClient.get(`/api/v1/purchase-orders/suppliers?period=${period}`)
      console.log('✅ [Service] Supplier reports response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching supplier reports:', error)
      throw error
    }
  },
  
  getPurchaseAnalytics: async (dateFrom?: string, dateTo?: string): Promise<any> => {
    try {
      console.log('🚀 [Service] Fetching purchase analytics from:', dateFrom, 'to:', dateTo)
      
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      
      const queryString = params.toString()
      const url = queryString ? `/api/v1/purchase-orders/analytics?${queryString}` : '/api/v1/purchase-orders/analytics'
      
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Purchase analytics response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching purchase analytics:', error)
      throw error
    }
  }
}

// Contacts service for purchase order creation (suppliers)
export const purchaseContactsService = {
  getAll: async (params?: any) => {
    try {
      console.log('🚀 [Service] Fetching contacts for purchases:', params)
      
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

// Products service for purchase order items
export const purchaseProductsService = {
  getAll: async (params?: any) => {
    try {
      console.log('🚀 [Service] Fetching products for purchases:', params)
      
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