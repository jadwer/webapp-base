import axiosClient from '@/lib/axiosClient'
import { PurchaseOrderFormData } from '../types'
import { transformPurchaseOrderFormToJsonApi, transformPurchaseOrderItemFormToJsonApi } from '../utils/transformers'

export const purchaseService = {
  orders: {
    getAll: async (params?: Record<string, string>) => {
      try {
        console.log('🚀 [Service] Fetching purchase orders with params:', params)
        
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
        const response = await axiosClient.get(`/api/v1/purchase-orders/${id}?include=contact,purchaseOrderItems`)
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

    updateTotals: async (id: string, totals: { totalAmount: number }) => {
      try {
        console.log('🚀 [Service] Updating purchase order totals:', id, totals)
        const payload = {
          data: {
            type: 'purchase-orders',
            id: id,
            attributes: {
              totalAmount: parseFloat(totals.totalAmount.toString()) // Ensure float
            }
          }
        }
        console.log('📦 [Service] Totals update payload:', payload)
        
        const response = await axiosClient.patch(`/api/v1/purchase-orders/${id}`, payload)
        console.log('✅ [Service] Updated purchase order totals:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error updating purchase order totals:', error)
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
    getAll: async (params?: Record<string, string> | null) => {
      try {
        console.log('🚀 [Service] Fetching purchase order items with params:', params)
        
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
        
        console.log('📡 [Service] Making request to:', url)
        const response = await axiosClient.get(url)
        console.log('✅ [Service] Purchase order items response:', response.data)
        
        return response.data
      } catch (error) {
        console.error('❌ [Service] Error fetching purchase order items:', error)
        throw error
      }
    },


    create: async (data: Record<string, unknown>) => {
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


    update: async (id: string, data: Record<string, unknown>) => {
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
  // Purchase Reports Summary - fechas específicas, estructura simple (no JSON:API)
  getReports: async (startDate = '1980-01-01', endDate = '2025-12-31'): Promise<Record<string, unknown>> => {
    try {
      console.log('📊 [Service] Fetching purchase reports summary from:', startDate, 'to:', endDate)
      const response = await axiosClient.get(`/api/v1/purchase-orders/reports?start_date=${startDate}&end_date=${endDate}`)
      console.log('✅ [Service] Purchase reports response:', response.data)
      console.log('🔍 [DEBUG] Raw response.data structure:', JSON.stringify(response.data, null, 2))
      
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
      console.error('❌ [Service] Error fetching purchase reports:', error)
      throw error
    }
  },


  // Purchase Suppliers Analytics - fechas específicas
  getSuppliers: async (startDate = '1980-01-01', endDate = '2025-12-31'): Promise<Record<string, unknown>> => {
    try {
      console.log('🏭 [Service] Fetching supplier analytics from:', startDate, 'to:', endDate)
      const response = await axiosClient.get(`/api/v1/purchase-orders/suppliers?start_date=${startDate}&end_date=${endDate}`)
      console.log('✅ [Service] Supplier analytics response:', response.data)
      console.log('🔍 [DEBUG] Raw suppliers response structure:', JSON.stringify(response.data, null, 2))


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
      console.error('❌ [Service] Error fetching supplier analytics:', error)
      throw error
    }
  }
}

// Contacts service for purchase order creation (suppliers)
export const purchaseContactsService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      console.log('🚀 [Service] Fetching suppliers for purchases:', params)
      
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key])
          }
        })
      }
      
      const url = queryParams.toString() ? `/api/v1/contacts?${queryParams.toString()}` : '/api/v1/contacts'
      
      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Suppliers response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching suppliers:', error)
      throw error
    }
  }
}

// Products service for purchase order items
export const purchaseProductsService = {
  getAll: async (params?: Record<string, string>) => {
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