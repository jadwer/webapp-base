import { JsonApiResource, PurchaseOrder, PurchaseOrderItem, Contact, PurchaseOrderFormData, PurchaseOrderStatus, InvoicingStatus } from '../types'

export function transformContact(resource: JsonApiResource | Record<string, unknown>): Contact {
  if (!resource) return { id: '', name: '', type: 'individual' }

  const attributes = (resource as JsonApiResource).attributes || resource
  return {
    id: (resource as JsonApiResource).id || '',
    name: ((attributes as Record<string, unknown>).name || '') as string,
    email: (attributes as Record<string, unknown>).email as string,
    phone: (attributes as Record<string, unknown>).phone as string,
    type: ((attributes as Record<string, unknown>).type || 'individual') as 'individual' | 'company'
  }
}

export function transformJsonApiPurchaseOrder(resource: JsonApiResource): PurchaseOrder {
  const attributes = resource.attributes
  return {
    id: resource.id,
    contactId: (attributes.contact_id || attributes.contactId) as number,
    orderNumber: (attributes.order_number || attributes.orderNumber || `PO-${resource.id}`) as string, // Use API value first, fallback to generated
    orderDate: (attributes.order_date || attributes.orderDate || '') as string,
    status: (attributes.status || 'draft') as PurchaseOrderStatus,
    totalAmount: (attributes.total_amount || attributes.totalAmount || 0) as number,
    notes: (attributes.notes ?? null) as string | null,
    // Finance integration fields
    apInvoiceId: (attributes.ap_invoice_id ?? attributes.apInvoiceId ?? null) as number | null,
    invoicingStatus: (attributes.invoicing_status || attributes.invoicingStatus || null) as InvoicingStatus | string | null,
    invoicingNotes: (attributes.invoicing_notes ?? attributes.invoicingNotes ?? null) as string | null,
    // Metadata
    createdAt: (attributes.created_at || attributes.createdAt || '') as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt || '') as string,
    contact: resource.relationships?.contact ? transformContact((resource.relationships.contact as Record<string, unknown>).data as JsonApiResource) : undefined
  }
}

export function transformJsonApiPurchaseOrderItem(resource: JsonApiResource): PurchaseOrderItem {
  const attributes = resource.attributes

  // Get basic values
  const quantity = (attributes.quantity || 0) as number
  const unitPrice = (attributes.unit_price || attributes.unitPrice || 0) as number
  const discount = Math.abs((attributes.discount as number) || 0) // Make discount positive for calculation

  // Use the 'subtotal' field first, then calculate
  let subtotal = (attributes.subtotal || 0) as number
  if (subtotal === 0 && quantity > 0 && unitPrice > 0) {
    subtotal = quantity * unitPrice
  }

  // Use the 'total' field first, then fallback to subtotal minus discount
  let total = (attributes.total || 0) as number
  if (total === 0 && subtotal > 0) {
    total = subtotal - discount
  }

  return {
    id: resource.id,
    purchaseOrderId: (attributes.purchase_order_id || attributes.purchaseOrderId) as number,
    productId: (attributes.product_id || attributes.productId) as number,
    quantity,
    unitPrice,
    discount,
    subtotal,
    total,
    totalPrice: total, // Legacy frontend alias
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    // Finance integration fields
    apInvoiceLineId: (attributes.ap_invoice_line_id ?? attributes.apInvoiceLineId ?? null) as number | null,
    invoicedQuantity: (attributes.invoiced_quantity ?? attributes.invoicedQuantity ?? null) as number | null,
    invoicedAmount: (attributes.invoiced_amount ?? attributes.invoicedAmount ?? null) as number | null,
    // Metadata
    createdAt: (attributes.created_at || attributes.createdAt || '') as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt || '') as string,
    product: resource.relationships?.product ? (resource.relationships.product as Record<string, unknown>).data as Record<string, unknown> | undefined : undefined
  }
}

export function transformPurchaseOrdersResponse(response: Record<string, unknown>) {
  console.log('🔄 [Transformer] Raw purchase orders response:', response)

  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }

  // Create a map of included resources for quick lookup
  const includedMap = new Map<string, JsonApiResource>()
  if (response.included && Array.isArray(response.included)) {
    (response.included as JsonApiResource[]).forEach((item: JsonApiResource) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  // Transform orders and attach related data
  const data = Array.isArray(response.data)
    ? (response.data as JsonApiResource[]).map((order: JsonApiResource) => {
        const transformed = transformJsonApiPurchaseOrder(order)

        // If contact relationship exists, get full contact data from included
        const contactRel = order.relationships?.contact as { data?: { type: string; id: string } } | undefined
        if (contactRel?.data) {
          const contactKey = `${contactRel.data.type}:${contactRel.data.id}`
          const contactData = includedMap.get(contactKey)
          if (contactData) {
            transformed.contact = transformContact(contactData)
          }
        }

        return transformed
      })
    : (() => {
        // Single resource - also process included
        const transformed = transformJsonApiPurchaseOrder(response.data as JsonApiResource)
        const contactRel = (response.data as JsonApiResource).relationships?.contact as { data?: { type: string; id: string } } | undefined
        if (contactRel?.data) {
          const contactKey = `${contactRel.data.type}:${contactRel.data.id}`
          const contactData = includedMap.get(contactKey)
          if (contactData) {
            transformed.contact = transformContact(contactData)
          }
        }
        return [transformed]
      })()

  console.log('✅ [Transformer] Transformed purchase orders with contacts:', data)
  return { data, meta: response.meta || {} }
}

export function transformPurchaseOrderItemsResponse(response: Record<string, unknown>) {
  console.log('🔄 [Transformer] Raw purchase order items response:', response)

  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }

  // Create a map of included resources for quick lookup
  const includedMap = new Map<string, JsonApiResource>()
  if (response.included && Array.isArray(response.included)) {
    (response.included as JsonApiResource[]).forEach((item: JsonApiResource) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  // Transform items and attach related data
  const data = Array.isArray(response.data)
    ? (response.data as JsonApiResource[]).map((item: JsonApiResource) => {
        const transformed = transformJsonApiPurchaseOrderItem(item)

        // If product relationship exists, get full product data from included
        const productRel = item.relationships?.product as { data?: { type: string; id: string } } | undefined
        if (productRel?.data) {
          const productKey = `${productRel.data.type}:${productRel.data.id}`
          const productData = includedMap.get(productKey)
          if (productData) {
            // Transform product to simple object
            transformed.product = {
              id: parseInt(productData.id),
              name: (productData.attributes?.name as string) || '',
              sku: (productData.attributes?.sku as string) || '',
            }
          }
        }

        // If purchase order relationship exists, get full order data from included
        const orderRel = item.relationships?.purchaseOrder as { data?: { type: string; id: string } } | undefined
        if (orderRel?.data) {
          const orderKey = `${orderRel.data.type}:${orderRel.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.purchaseOrder = orderData as unknown as Record<string, unknown>
          }
        }

        return transformed
      })
    : (() => {
        // Single resource - also process included
        const transformed = transformJsonApiPurchaseOrderItem(response.data as JsonApiResource)
        const productRel = (response.data as JsonApiResource).relationships?.product as { data?: { type: string; id: string } } | undefined
        if (productRel?.data) {
          const productKey = `${productRel.data.type}:${productRel.data.id}`
          const productData = includedMap.get(productKey)
          if (productData) {
            // Transform product to simple object
            transformed.product = {
              id: parseInt(productData.id),
              name: (productData.attributes?.name as string) || '',
              sku: (productData.attributes?.sku as string) || '',
            }
          }
        }
        const orderRel = (response.data as JsonApiResource).relationships?.purchaseOrder as { data?: { type: string; id: string } } | undefined
        if (orderRel?.data) {
          const orderKey = `${orderRel.data.type}:${orderRel.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.purchaseOrder = orderData as unknown as Record<string, unknown>
          }
        }
        return [transformed]
      })()

  console.log('✅ [Transformer] Transformed purchase order items with relationships:', data)
  return { data, meta: response.meta || {} }
}

// Utility function to transform form data to JSON:API format
export function transformPurchaseOrderFormToJsonApi(data: PurchaseOrderFormData, type: string = 'purchase-orders', id?: string) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        contact_id: data.contactId, // Already a number
        order_number: data.orderNumber, // Include order number
        order_date: data.orderDate, // Use snake_case for API
        status: data.status,
        notes: data.notes || '',
        total_amount: 0 // Calculate from items if needed
      },
      relationships: {
        contact: {
          data: {
            type: "contacts",
            id: data.contactId.toString()
          }
        }
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  console.log('📦 [Transformer] Purchase Order payload:', JSON.stringify(payload, null, 2))
  return payload
}

export function transformPurchaseOrderItemFormToJsonApi(data: Record<string, unknown>, type: string = 'purchase-order-items', id?: string) {
  const calculatedTotal = (parseFloat(String(data.quantity)) * parseFloat(String(data.unitPrice))) - parseFloat(String(data.discount || 0))

  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        purchaseOrderId: parseInt(String(data.purchaseOrderId)), // Convert to integer (camelCase según tu spec)
        productId: parseInt(String(data.productId)), // Convert to integer (camelCase según tu spec)
        quantity: parseInt(String(data.quantity)), // Convert to integer
        unitPrice: parseFloat(String(data.unitPrice)), // Convert to float (camelCase según tu spec)
        discount: parseFloat(String(data.discount || 0)), // Convert to float
        subtotal: parseFloat(String(data.subtotal || calculatedTotal)), // Convert to float
        total: parseFloat(String(data.total || calculatedTotal)) // Convert to float
      }
    }
  }
  
  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }
  
  console.log('📦 [Transformer] Purchase Order Item payload:', JSON.stringify(payload, null, 2))
  return payload
}