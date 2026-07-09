import { JsonApiResource, PurchaseOrder, PurchaseOrderItem, Contact, PurchaseOrderFormData, PurchaseOrderStatus, InvoicingStatus, Budget, ParsedBudget, BudgetType, BudgetPeriodType, BudgetStatusLevel, CreateBudgetRequest, UpdateBudgetRequest, BUDGET_TYPE_CONFIG, BUDGET_PERIOD_TYPE_CONFIG, BUDGET_STATUS_LEVEL_CONFIG } from '../types'

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
  if (!response?.data) {
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

  return { data, meta: response.meta || {} }
}

export function transformPurchaseOrderItemsResponse(response: Record<string, unknown>) {
  if (!response?.data) {
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
  
  return payload
}

// ===== BUDGET TRANSFORMERS (v1.1) =====

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00'
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

export function transformBudgetFromAPI(
  resource: JsonApiResource,
  includedData?: JsonApiResource[]
): Budget {
  const attributes = resource.attributes

  // Build included map for relationship resolution
  const includedMap = new Map<string, JsonApiResource>()
  if (includedData) {
    includedData.forEach((item) => {
      includedMap.set(`${item.type}:${item.id}`, item)
    })
  }

  // Resolve category name
  let categoryName: string | undefined
  const categoryRel = resource.relationships?.category as { data?: { type: string; id: string } } | undefined
  if (categoryRel?.data) {
    const categoryData = includedMap.get(`${categoryRel.data.type}:${categoryRel.data.id}`)
    if (categoryData) {
      categoryName = (categoryData.attributes?.name as string) || undefined
    }
  }

  // Resolve contact name
  let contactName: string | undefined
  const contactRel = resource.relationships?.contact as { data?: { type: string; id: string } } | undefined
  if (contactRel?.data) {
    const contactData = includedMap.get(`${contactRel.data.type}:${contactRel.data.id}`)
    if (contactData) {
      contactName = (contactData.attributes?.name as string) || undefined
    }
  }

  // Calculate available amount
  const budgetedAmount = (attributes.budgetedAmount ?? attributes.budgeted_amount ?? 0) as number
  const committedAmount = (attributes.committedAmount ?? attributes.committed_amount ?? 0) as number
  const spentAmount = (attributes.spentAmount ?? attributes.spent_amount ?? 0) as number
  const availableAmount = budgetedAmount - committedAmount - spentAmount

  return {
    id: resource.id,
    name: (attributes.name ?? '') as string,
    code: (attributes.code ?? '') as string,
    description: (attributes.description ?? null) as string | null,
    budgetType: (attributes.budgetType ?? attributes.budget_type ?? 'general') as BudgetType,
    departmentCode: (attributes.departmentCode ?? attributes.department_code ?? null) as string | null,
    categoryId: (attributes.categoryId ?? attributes.category_id ?? null) as number | null,
    projectCode: (attributes.projectCode ?? attributes.project_code ?? null) as string | null,
    contactId: (attributes.contactId ?? attributes.contact_id ?? null) as number | null,
    periodType: (attributes.periodType ?? attributes.period_type ?? 'monthly') as BudgetPeriodType,
    startDate: (attributes.startDate ?? attributes.start_date ?? '') as string,
    endDate: (attributes.endDate ?? attributes.end_date ?? '') as string,
    fiscalYear: (attributes.fiscalYear ?? attributes.fiscal_year ?? null) as number | null,
    budgetedAmount,
    committedAmount,
    spentAmount,
    availableAmount,
    warningThreshold: (attributes.warningThreshold ?? attributes.warning_threshold ?? 80) as number,
    criticalThreshold: (attributes.criticalThreshold ?? attributes.critical_threshold ?? 95) as number,
    hardLimit: (attributes.hardLimit ?? attributes.hard_limit ?? false) as boolean,
    allowOvercommit: (attributes.allowOvercommit ?? attributes.allow_overcommit ?? false) as boolean,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt ?? attributes.created_at ?? '') as string,
    updatedAt: (attributes.updatedAt ?? attributes.updated_at ?? '') as string,
    // Computed
    utilizationPercent: (attributes.utilizationPercent ?? attributes.utilization_percent ?? 0) as number,
    statusLevel: (attributes.statusLevel ?? attributes.status_level ?? 'normal') as BudgetStatusLevel,
    // Relationships
    categoryName,
    contactName,
  }
}

export function transformBudgetToParsed(budget: Budget): ParsedBudget {
  return {
    ...budget,
    budgetedAmountDisplay: formatCurrency(budget.budgetedAmount),
    committedAmountDisplay: formatCurrency(budget.committedAmount),
    spentAmountDisplay: formatCurrency(budget.spentAmount),
    availableAmountDisplay: formatCurrency(budget.availableAmount),
    utilizationDisplay: `${(budget.utilizationPercent ?? 0).toFixed(1)}%`,
    budgetTypeLabel: BUDGET_TYPE_CONFIG[budget.budgetType]?.label || budget.budgetType,
    periodTypeLabel: BUDGET_PERIOD_TYPE_CONFIG[budget.periodType]?.label || budget.periodType,
    statusLevelLabel: BUDGET_STATUS_LEVEL_CONFIG[budget.statusLevel || 'normal']?.label || 'Normal',
  }
}

export function transformBudgetsFromAPI(
  response: Record<string, unknown>
): ParsedBudget[] {
  if (!response?.data) {
    return []
  }

  const includedData = (response.included || []) as JsonApiResource[]

  if (Array.isArray(response.data)) {
    return (response.data as JsonApiResource[]).map((resource) => {
      const budget = transformBudgetFromAPI(resource, includedData)
      return transformBudgetToParsed(budget)
    })
  }

  // Single resource
  const budget = transformBudgetFromAPI(response.data as JsonApiResource, includedData)
  return [transformBudgetToParsed(budget)]
}

export function transformBudgetToAPI(data: CreateBudgetRequest): Record<string, unknown> {
  return {
    data: {
      type: 'budgets',
      attributes: {
        name: data.name,
        code: data.code,
        description: data.description || null,
        budget_type: data.budgetType,
        department_code: data.departmentCode || null,
        category_id: data.categoryId || null,
        project_code: data.projectCode || null,
        contact_id: data.contactId || null,
        period_type: data.periodType,
        start_date: data.startDate,
        end_date: data.endDate,
        fiscal_year: data.fiscalYear || null,
        budgeted_amount: data.budgetedAmount,
        warning_threshold: data.warningThreshold ?? 80,
        critical_threshold: data.criticalThreshold ?? 95,
        hard_limit: data.hardLimit ?? false,
        allow_overcommit: data.allowOvercommit ?? false,
        is_active: data.isActive ?? true,
      },
    },
  }
}

export function transformBudgetUpdateToAPI(
  id: string,
  data: UpdateBudgetRequest
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {}

  if (data.name !== undefined) attributes.name = data.name
  if (data.code !== undefined) attributes.code = data.code
  if (data.description !== undefined) attributes.description = data.description
  if (data.budgetType !== undefined) attributes.budget_type = data.budgetType
  if (data.departmentCode !== undefined) attributes.department_code = data.departmentCode
  if (data.categoryId !== undefined) attributes.category_id = data.categoryId
  if (data.projectCode !== undefined) attributes.project_code = data.projectCode
  if (data.contactId !== undefined) attributes.contact_id = data.contactId
  if (data.periodType !== undefined) attributes.period_type = data.periodType
  if (data.startDate !== undefined) attributes.start_date = data.startDate
  if (data.endDate !== undefined) attributes.end_date = data.endDate
  if (data.fiscalYear !== undefined) attributes.fiscal_year = data.fiscalYear
  if (data.budgetedAmount !== undefined) attributes.budgeted_amount = data.budgetedAmount
  if (data.warningThreshold !== undefined) attributes.warning_threshold = data.warningThreshold
  if (data.criticalThreshold !== undefined) attributes.critical_threshold = data.criticalThreshold
  if (data.hardLimit !== undefined) attributes.hard_limit = data.hardLimit
  if (data.allowOvercommit !== undefined) attributes.allow_overcommit = data.allowOvercommit
  if (data.isActive !== undefined) attributes.is_active = data.isActive

  return {
    data: {
      type: 'budgets',
      id,
      attributes,
    },
  }
}