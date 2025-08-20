import { JsonApiResource, SalesOrder, SalesOrderItem, Contact } from '../types'

export function transformContact(resource: JsonApiResource | any): Contact {
  if (!resource) return { id: '', name: '', type: 'individual' }
  
  const attributes = resource.attributes || resource
  return {
    id: resource.id || '',
    name: (attributes.name || '') as string,
    email: attributes.email as string,
    phone: attributes.phone as string,
    type: (attributes.type || 'individual') as 'individual' | 'company'
  }
}

export function transformJsonApiSalesOrder(resource: JsonApiResource): SalesOrder {
  const attributes = resource.attributes
  return {
    id: resource.id,
    contactId: (attributes.contact_id || attributes.contactId) as number,
    orderNumber: (attributes.order_number || attributes.orderNumber || '') as string,
    orderDate: (attributes.order_date || attributes.orderDate || '') as string,
    status: (attributes.status || 'draft') as 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    totalAmount: (attributes.total_amount || attributes.totalAmount || 0) as number,
    notes: (attributes.notes || '') as string,
    createdAt: attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updated_at || attributes.updatedAt,
    contact: resource.relationships?.contact?.data ? transformContact(resource.relationships.contact.data) : undefined
  }
}

export function transformJsonApiSalesOrderItem(resource: JsonApiResource): SalesOrderItem {
  const attributes = resource.attributes
  
  // Get basic values
  const quantity = (attributes.quantity || 0) as number
  const unitPrice = (attributes.unit_price || attributes.unitPrice || 0) as number
  const discount = Math.abs(attributes.discount || 0) // Make discount positive for calculation
  
  // Try to get total from API, if not available calculate it
  let totalPrice = (attributes.total_price || attributes.totalPrice || attributes.subtotal || attributes.line_total || attributes.amount || 0) as number
  
  // If no total price from API, calculate it
  if (totalPrice === 0 && quantity > 0 && unitPrice > 0) {
    totalPrice = (quantity * unitPrice) - discount
  }
  
  return {
    id: resource.id,
    salesOrderId: (attributes.sales_order_id || attributes.salesOrderId) as string,
    productId: (attributes.product_id || attributes.productId) as number,
    quantity,
    unitPrice,
    totalPrice,
    discount,
    product: resource.relationships?.product?.data || undefined
  }
}

export function transformSalesOrdersResponse(response: any) {
  console.log('🔄 [Transformer] Raw sales orders response:', response)
  
  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }
  
  // Create a map of included resources for quick lookup
  const includedMap = new Map()
  if (response.included) {
    response.included.forEach((item: any) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }
  
  // Transform orders and attach related data
  const data = Array.isArray(response.data) 
    ? response.data.map((order: any) => {
        const transformed = transformJsonApiSalesOrder(order)
        
        // If contact relationship exists, get full contact data from included
        if (order.relationships?.contact?.data) {
          const contactKey = `${order.relationships.contact.data.type}:${order.relationships.contact.data.id}`
          const contactData = includedMap.get(contactKey)
          if (contactData) {
            transformed.contact = transformContact(contactData)
          }
        }
        
        return transformed
      })
    : [transformJsonApiSalesOrder(response.data)]
  
  console.log('✅ [Transformer] Transformed sales orders with contacts:', data)
  return { data, meta: response.meta || {} }
}

export function transformSalesOrderItemsResponse(response: any) {
  console.log('🔄 [Transformer] Raw sales order items response:', response)
  
  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }
  
  // Create a map of included resources for quick lookup
  const includedMap = new Map()
  if (response.included) {
    response.included.forEach((item: any) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }
  
  // Transform items and attach related data
  const data = Array.isArray(response.data)
    ? response.data.map((item: any) => {
        const transformed = transformJsonApiSalesOrderItem(item)
        
        // If product relationship exists, get full product data from included
        if (item.relationships?.product?.data) {
          const productKey = `${item.relationships.product.data.type}:${item.relationships.product.data.id}`
          const productData = includedMap.get(productKey)
          if (productData) {
            transformed.product = productData
          }
        }
        
        // If sales order relationship exists, get full order data from included
        if (item.relationships?.salesOrder?.data) {
          const orderKey = `${item.relationships.salesOrder.data.type}:${item.relationships.salesOrder.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.salesOrder = orderData
          }
        }
        
        return transformed
      })
    : [transformJsonApiSalesOrderItem(response.data)]
  
  console.log('✅ [Transformer] Transformed sales order items with relationships:', data)
  return { data, meta: response.meta || {} }
}

// Utility function to transform form data to JSON:API format
export function transformSalesOrderFormToJsonApi(data: any, type: string = 'sales-orders', id?: string) {
  const payload: any = {
    data: {
      type,
      attributes: {
        contact_id: parseInt(data.contactId), // Convert to integer
        order_number: data.orderNumber,
        status: data.status,
        order_date: data.orderDate,
        total_amount: parseFloat(data.totalAmount || 0), // Convert to float
        subtotal_amount: parseFloat(data.subtotalAmount || 0), // Convert to float
        tax_amount: parseFloat(data.taxAmount || 0), // Convert to float
        notes: data.notes || ''
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  return payload
}

export function transformSalesOrderItemFormToJsonApi(data: any, type: string = 'sales-order-items', id?: string) {
  const payload: any = {
    data: {
      type,
      attributes: {
        salesOrderId: parseInt(data.salesOrderId), // Convert to integer
        productId: parseInt(data.productId), // Convert to integer
        quantity: parseInt(data.quantity), // Convert to integer
        unitPrice: parseFloat(data.unitPrice), // Convert to float
        discount: parseFloat(data.discount || 0), // Convert to float
        total: parseFloat(data.total || ((data.quantity * data.unitPrice) - (data.discount || 0))) // Convert to float
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  return payload
}