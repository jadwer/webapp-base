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
    orderNumber: (attributes.order_number || attributes.orderNumber || '') as string,
    orderDate: (attributes.order_date || attributes.orderDate || '') as string,
    status: (attributes.status || 'pending') as 'pending' | 'processing' | 'received' | 'cancelled',
    totalAmount: (attributes.total_amount || attributes.totalAmount || 0) as number,
    notes: (attributes.notes || '') as string,
    createdAt: attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updated_at || attributes.updatedAt,
    contact: resource.relationships?.contact?.data ? transformContact(resource.relationships.contact.data) : undefined
  }
}

export function transformJsonApiPurchaseOrderItem(resource: JsonApiResource): PurchaseOrderItem {
  const attributes = resource.attributes
  return {
    id: resource.id,
    purchaseOrderId: (attributes.purchase_order_id || attributes.purchaseOrderId) as string,
    productId: (attributes.product_id || attributes.productId) as number,
    quantity: (attributes.quantity || 0) as number,
    unitPrice: (attributes.unit_price || attributes.unitPrice || 0) as number,
    totalPrice: (attributes.total_price || attributes.totalPrice || 0) as number,
    discount: attributes.discount || 0,
    product: resource.relationships?.product?.data || undefined
  }
}

export function transformPurchaseOrdersResponse(response: any) {
  console.log('🔄 [Transformer] Raw purchase orders response:', response)
  
  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }
  
  const data = Array.isArray(response.data) 
    ? response.data.map(transformJsonApiPurchaseOrder)
    : [transformJsonApiPurchaseOrder(response.data)]
  
  console.log('✅ [Transformer] Transformed purchase orders:', data)
  return { data, meta: response.meta || {} }
}

export function transformPurchaseOrderItemsResponse(response: any) {
  console.log('🔄 [Transformer] Raw purchase order items response:', response)
  
  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }
  
  const data = Array.isArray(response.data)
    ? response.data.map(transformJsonApiPurchaseOrderItem)
    : [transformJsonApiPurchaseOrderItem(response.data)]
  
  console.log('✅ [Transformer] Transformed purchase order items:', data)
  return { data, meta: response.meta || {} }
}

// Utility function to transform form data to JSON:API format
export function transformPurchaseOrderFormToJsonApi(data: any, type: string = 'purchase-orders', id?: string) {
  const payload: any = {
    data: {
      type,
      attributes: {
        contact_id: data.contactId,
        order_number: data.orderNumber,
        order_date: data.orderDate,
        status: data.status,
        notes: data.notes || ''
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  return payload
}

export function transformPurchaseOrderItemFormToJsonApi(data: any, type: string = 'purchase-order-items', id?: string) {
  const payload: any = {
    data: {
      type,
      attributes: {
        purchase_order_id: data.purchaseOrderId,
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        discount: data.discount || 0
      }
    }
  }
  
  if (id) {
    payload.data.id = id
  }
  
  return payload
}