import { JsonApiResource, SalesOrder, SalesOrderItem, Contact, SalesOrderFormData, OrderStatus, InvoicingStatus } from '../types'

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

export function transformJsonApiSalesOrder(resource: JsonApiResource): SalesOrder {
  const attributes = resource.attributes
  return {
    id: resource.id,
    contactId: (attributes.contact_id || attributes.contactId) as number,
    orderNumber: (attributes.order_number || attributes.orderNumber || '') as string,
    orderDate: (attributes.order_date || attributes.orderDate || '') as string,
    status: (attributes.status || 'draft') as OrderStatus,
    approvedAt: (attributes.approved_at ?? attributes.approvedAt ?? null) as string | null,
    deliveredAt: (attributes.delivered_at ?? attributes.deliveredAt ?? null) as string | null,
    // Finance integration fields
    arInvoiceId: (attributes.ar_invoice_id ?? attributes.arInvoiceId ?? null) as number | null,
    invoicingStatus: (attributes.invoicing_status || attributes.invoicingStatus || 'pending') as InvoicingStatus,
    invoicingNotes: (attributes.invoicing_notes ?? attributes.invoicingNotes ?? null) as string | null,
    // Amounts
    discountTotal: (attributes.discount_total || attributes.discountTotal || 0) as number,
    totalAmount: (attributes.total_amount || attributes.totalAmount || 0) as number,
    // Metadata
    notes: (attributes.notes ?? null) as string | null,
    createdAt: (attributes.created_at || attributes.createdAt || '') as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt || '') as string,
    contact: resource.relationships?.contact ? transformContact((resource.relationships.contact as Record<string, unknown>).data as JsonApiResource) : undefined
  }
}

export function transformJsonApiSalesOrderItem(resource: JsonApiResource): SalesOrderItem {
  const attributes = resource.attributes

  // Get basic values
  const quantity = (attributes.quantity || 0) as number
  const unitPrice = (attributes.unit_price || attributes.unitPrice || 0) as number
  const discount = Math.abs((attributes.discount || 0) as number)

  // Try to get total from API, if not available calculate it
  let total = (attributes.total || attributes.total_price || attributes.totalPrice || 0) as number
  if (total === 0 && quantity > 0 && unitPrice > 0) {
    total = (quantity * unitPrice) - discount
  }

  return {
    id: resource.id,
    salesOrderId: (attributes.sales_order_id || attributes.salesOrderId) as number,
    productId: (attributes.product_id || attributes.productId) as number,
    quantity,
    unitPrice,
    discount,
    total,
    totalPrice: total, // Legacy alias
    // Finance integration fields
    arInvoiceLineId: (attributes.ar_invoice_line_id ?? attributes.arInvoiceLineId ?? null) as number | null,
    invoicedQuantity: (attributes.invoiced_quantity ?? attributes.invoicedQuantity ?? null) as number | null,
    invoicedAmount: (attributes.invoiced_amount ?? attributes.invoicedAmount ?? null) as number | null,
    // Metadata
    createdAt: (attributes.created_at || attributes.createdAt || '') as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt || '') as string,
    product: resource.relationships?.product ? (resource.relationships.product as Record<string, unknown>).data as Record<string, unknown> | undefined : undefined
  }
}

export function transformSalesOrdersResponse(response: Record<string, unknown>) {
  console.log('🔄 [Transformer] Raw sales orders response:', response)

  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }

  // Create a map of included resources for quick lookup
  const includedMap = new Map()
  if (response.included) {
    (response.included as JsonApiResource[]).forEach((item: JsonApiResource) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  // Transform orders and attach related data
  const data = Array.isArray(response.data)
    ? (response.data as JsonApiResource[]).map((order: JsonApiResource) => {
        const transformed = transformJsonApiSalesOrder(order)

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
        const transformed = transformJsonApiSalesOrder(response.data as JsonApiResource)
        const singleData = response.data as JsonApiResource
        const contactRel = singleData.relationships?.contact as { data?: { type: string; id: string } } | undefined
        if (contactRel?.data) {
          const contactKey = `${contactRel.data.type}:${contactRel.data.id}`
          const contactResource = includedMap.get(contactKey)
          if (contactResource) {
            transformed.contact = transformContact(contactResource as JsonApiResource)
          }
        }
        return [transformed]
      })()

  console.log('✅ [Transformer] Transformed sales orders with contacts:', data)
  return { data, meta: (response.meta as Record<string, unknown>) || {} }
}

export function transformSalesOrderItemsResponse(response: Record<string, unknown>) {
  console.log('🔄 [Transformer] Raw sales order items response:', response)

  if (!response?.data) {
    console.log('⚠️ [Transformer] No data in response, returning empty array')
    return { data: [], meta: {} }
  }

  // Create a map of included resources for quick lookup
  const includedMap = new Map()
  if (response.included) {
    (response.included as JsonApiResource[]).forEach((item: JsonApiResource) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  // Transform items and attach related data
  const data = Array.isArray(response.data)
    ? (response.data as JsonApiResource[]).map((item: JsonApiResource) => {
        const transformed = transformJsonApiSalesOrderItem(item)

        // If product relationship exists, get full product data from included
        const productRel = item.relationships?.product as { data?: { type: string; id: string } } | undefined
        if (productRel?.data) {
          const productKey = `${productRel.data.type}:${productRel.data.id}`
          const productData = includedMap.get(productKey) as JsonApiResource | undefined
          if (productData) {
            // Transform product to simple object
            transformed.product = {
              id: parseInt(productData.id),
              name: (productData.attributes?.name as string) || '',
              sku: (productData.attributes?.sku as string) || '',
            }
          }
        }

        // If sales order relationship exists, get full order data from included
        const orderRel = item.relationships?.salesOrder as { data?: { type: string; id: string } } | undefined
        if (orderRel?.data) {
          const orderKey = `${orderRel.data.type}:${orderRel.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.salesOrder = orderData as Record<string, unknown>
          }
        }

        return transformed
      })
    : (() => {
        // Single resource - also process included
        const singleData = response.data as JsonApiResource
        const transformed = transformJsonApiSalesOrderItem(singleData)
        const productRel = singleData.relationships?.product as { data?: { type: string; id: string } } | undefined
        if (productRel?.data) {
          const productKey = `${productRel.data.type}:${productRel.data.id}`
          const productData = includedMap.get(productKey) as JsonApiResource | undefined
          if (productData) {
            // Transform product to simple object
            transformed.product = {
              id: parseInt(productData.id),
              name: (productData.attributes?.name as string) || '',
              sku: (productData.attributes?.sku as string) || '',
            }
          }
        }
        const orderRel = singleData.relationships?.salesOrder as { data?: { type: string; id: string } } | undefined
        if (orderRel?.data) {
          const orderKey = `${orderRel.data.type}:${orderRel.data.id}`
          const orderData = includedMap.get(orderKey)
          if (orderData) {
            transformed.salesOrder = orderData as Record<string, unknown>
          }
        }
        return [transformed]
      })()

  console.log('✅ [Transformer] Transformed sales order items with relationships:', data)
  return { data, meta: (response.meta as Record<string, unknown>) || {} }
}

// Utility function to transform form data to JSON:API format
export function transformSalesOrderFormToJsonApi(data: SalesOrderFormData, type: string = 'sales-orders', id?: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        contact_id: data.contactId,
        order_number: data.orderNumber,
        status: data.status,
        order_date: data.orderDate,
        approved_at: data.approvedAt || null,
        delivered_at: data.deliveredAt || null,
        invoicing_notes: data.invoicingNotes || null,
        notes: data.notes || ''
      },
      relationships: {
        contact: {
          data: {
            type: 'contacts',
            id: data.contactId.toString()
          }
        }
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformSalesOrderItemFormToJsonApi(data: Record<string, unknown>, type: string = 'sales-order-items', id?: string): Record<string, unknown> {
  const quantity = data.quantity as number
  const unitPrice = data.unitPrice as number
  const discount = (data.discount || 0) as number

  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        salesOrderId: parseInt(data.salesOrderId as string), // Convert to integer
        productId: parseInt(data.productId as string), // Convert to integer
        quantity: parseInt(quantity.toString()), // Convert to integer
        unitPrice: parseFloat(unitPrice.toString()), // Convert to float
        discount: parseFloat(discount.toString()), // Convert to float
        total: parseFloat((data.total || ((quantity * unitPrice) - discount)).toString()) // Convert to float
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}