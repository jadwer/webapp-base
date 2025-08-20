import { JsonApiResource, PurchaseOrder, PurchaseOrderItem, Contact } from '../types'

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

export function transformJsonApiPurchaseOrder(resource: JsonApiResource): PurchaseOrder {
  const attributes = resource.attributes
  return {
    id: resource.id,
    contactId: (attributes.contact_id || attributes.contactId) as number,
    orderNumber: `PO-${resource.id}`, // Generate order number from ID since API doesn't provide one
    orderDate: (attributes.orderDate || attributes.order_date || '') as string,
    status: (attributes.status || 'pending') as 'pending' | 'approved' | 'received' | 'cancelled',
    totalAmount: (attributes.totalAmount || attributes.total_amount || 0) as number,
    notes: (attributes.notes || '') as string,
    createdAt: attributes.createdAt || attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updatedAt || attributes.updated_at || attributes.updatedAt,
    contact: resource.relationships?.contact?.data ? transformContact(resource.relationships.contact.data) : undefined
  }
}

export function transformJsonApiPurchaseOrderItem(resource: JsonApiResource): PurchaseOrderItem {
  const attributes = resource.attributes
  
  // Get basic values
  const quantity = (attributes.quantity || 0) as number
  const unitPrice = (attributes.unit_price || attributes.unitPrice || 0) as number
  const discount = Math.abs(attributes.discount || 0) // Make discount positive for calculation
  
  // Use the 'total' field first (calculated automatically), then fallback to subtotal or calculated
  let totalPrice = (attributes.total || attributes.subtotal || attributes.total_price || attributes.totalPrice || 0) as number
  
  // If no total price from API, calculate it
  if (totalPrice === 0 && quantity > 0 && unitPrice > 0) {
    totalPrice = (quantity * unitPrice) - discount
  }
  
  return {
    id: resource.id,
    purchaseOrderId: (attributes.purchase_order_id || attributes.purchaseOrderId) as string,
    productId: (attributes.product_id || attributes.productId) as number,
    quantity,
    unitPrice,
    totalPrice,
    discount,
    product: resource.relationships?.product?.data || undefined
  }
}

export function transformPurchaseOrdersResponse(response: any) {
  console.log('🔄 [Transformer] Raw purchase orders response:', response)
  
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
        const transformed = transformJsonApiPurchaseOrder(order)
        
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
    : [transformJsonApiPurchaseOrder(response.data)]
  
  console.log('✅ [Transformer] Transformed purchase orders with contacts:', data)
  return { data, meta: response.meta || {} }
}

export function transformPurchaseOrderItemsResponse(response: any) {
  console.log('🔄 [Transformer] Raw purchase order items response:', response)
  
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
        const transformed = transformJsonApiPurchaseOrderItem(item)
        
        // If product relationship exists, get full product data from included
        if (item.relationships?.product?.data) {
          const productKey = `${item.relationships.product.data.type}:${item.relationships.product.data.id}`
          const productData = includedMap.get(productKey)
          if (productData) {
            transformed.product = productData
          }
        }
        
        // If purchase order relationship exists, get full order data from included
        if (item.relationships?.purchaseOrder?.data) {
          const orderKey = `${item.relationships.purchaseOrder.data.type}:${item.relationships.purchaseOrder.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.purchaseOrder = orderData
          }
        }
        
        return transformed
      })
    : [transformJsonApiPurchaseOrderItem(response.data)]
  
  console.log('✅ [Transformer] Transformed purchase order items with relationships:', data)
  return { data, meta: response.meta || {} }
}

// Utility function to transform form data to JSON:API format
export function transformPurchaseOrderFormToJsonApi(data: any, type: string = 'purchase-orders', id?: string) {
  const payload: any = {
    data: {
      type,
      attributes: {
        contact_id: parseInt(data.contactId), // ✅ AMBOS: contact_id como atributo
        orderDate: data.orderDate,
        status: data.status,
        notes: data.notes || '',
        totalAmount: parseFloat(data.totalAmount || 0)
      },
      relationships: {
        contact: {
          data: { 
            type: "contacts", 
            id: parseInt(data.contactId).toString() // ✅ Y contact como relationship
          }
        }
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  console.log('📦 [Transformer] Purchase Order payload:', JSON.stringify(payload, null, 2))
  return payload
}

export function transformPurchaseOrderItemFormToJsonApi(data: any, type: string = 'purchase-order-items', id?: string) {
  const calculatedTotal = (parseFloat(data.quantity) * parseFloat(data.unitPrice)) - parseFloat(data.discount || 0)
  
  const payload: any = {
    data: {
      type,
      attributes: {
        purchaseOrderId: parseInt(data.purchaseOrderId), // Convert to integer (camelCase según tu spec)
        productId: parseInt(data.productId), // Convert to integer (camelCase según tu spec)
        quantity: parseInt(data.quantity), // Convert to integer
        unitPrice: parseFloat(data.unitPrice), // Convert to float (camelCase según tu spec)
        discount: parseFloat(data.discount || 0), // Convert to float
        subtotal: parseFloat(data.subtotal || calculatedTotal), // Convert to float
        total: parseFloat(data.total || calculatedTotal) // Convert to float
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  console.log('📦 [Transformer] Purchase Order Item payload:', JSON.stringify(payload, null, 2))
  return payload
}