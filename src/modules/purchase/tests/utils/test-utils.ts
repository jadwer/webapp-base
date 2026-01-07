/**
 * Test Utilities for Purchase Module
 * Mock factories and test helpers following Sales module pattern
 */

import {
  PurchaseOrder,
  PurchaseOrderItem,
  Contact,
  PurchaseOrderFormData,
} from '../../types'

/**
 * Creates a mock Contact object with optional overrides
 */
export const mockContact = (overrides?: Partial<Contact>): Contact => ({
  id: '1',
  name: 'Test Supplier',
  email: 'supplier@test.com',
  phone: '555-0100',
  type: 'company',
  ...overrides,
})

/**
 * Creates a list of mock contacts
 */
export const mockContacts = (count: number = 3): Contact[] => {
  return Array.from({ length: count }, (_, index) =>
    mockContact({
      id: (index + 1).toString(),
      name: `Test Supplier ${index + 1}`,
      email: `supplier${index + 1}@test.com`,
    })
  )
}

/**
 * Creates a mock PurchaseOrder object with optional overrides
 */
export const mockPurchaseOrder = (overrides?: Partial<PurchaseOrder>): PurchaseOrder => ({
  id: '1',
  contactId: 1,
  contact: mockContact(),
  orderNumber: 'PO-2025-001',
  orderDate: '2025-01-01',
  status: 'draft',
  totalAmount: 1000.00,
  notes: 'Test purchase order notes',
  // Finance integration fields
  apInvoiceId: null,
  invoicingStatus: 'pending',
  invoicingNotes: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates a list of mock purchase orders
 */
export const mockPurchaseOrders = (count: number = 3): PurchaseOrder[] => {
  const statuses: ('draft' | 'pending' | 'approved' | 'received' | 'cancelled')[] = ['draft', 'pending', 'approved']
  return Array.from({ length: count }, (_, index) =>
    mockPurchaseOrder({
      id: (index + 1).toString(),
      contactId: index + 1,
      orderNumber: `PO-2025-${String(index + 1).padStart(3, '0')}`,
      status: statuses[index % statuses.length],
      totalAmount: (index + 1) * 1000,
    })
  )
}

/**
 * Creates a mock PurchaseOrderItem object with optional overrides
 */
export const mockPurchaseOrderItem = (overrides?: Partial<PurchaseOrderItem>): PurchaseOrderItem => {
  const productId = overrides?.productId || 1
  return {
    id: '1',
    purchaseOrderId: 1,
    productId,
    quantity: 10,
    unitPrice: 100.00,
    discount: 0,
    subtotal: 1000.00,
    total: 1000.00,
    totalPrice: 1000.00,
    // Finance integration fields
    apInvoiceLineId: null,
    invoicedQuantity: null,
    invoicedAmount: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    // Relationships
    product: {
      id: productId,
      name: 'Test Product',
      sku: 'TEST-001',
    },
    ...overrides,
  }
}

/**
 * Creates a list of mock purchase order items
 */
export const mockPurchaseOrderItems = (count: number = 3): PurchaseOrderItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const quantity = (index + 1) * 10
    const unitPrice = 100 + (index * 50)
    const subtotal = quantity * unitPrice
    return mockPurchaseOrderItem({
      id: (index + 1).toString(),
      productId: index + 1,
      quantity,
      unitPrice,
      subtotal,
      total: subtotal,
      totalPrice: subtotal,
    })
  })
}

/**
 * Creates mock form data for creating/updating purchase orders
 */
export const mockPurchaseOrderFormData = (
  overrides?: Partial<PurchaseOrderFormData>
): PurchaseOrderFormData => ({
  contactId: 1,
  orderNumber: 'PO-2025-001',
  orderDate: '2025-01-01',
  status: 'pending',
  notes: 'Test purchase order',
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single purchase order
 */
export const mockJsonApiPurchaseOrderResponse = (purchaseOrder: PurchaseOrder) => ({
  data: {
    id: purchaseOrder.id.toString(),
    type: 'purchase-orders',
    attributes: {
      contactId: purchaseOrder.contactId,
      orderDate: purchaseOrder.orderDate,
      status: purchaseOrder.status,
      totalAmount: purchaseOrder.totalAmount,
      notes: purchaseOrder.notes,
      apInvoiceId: purchaseOrder.apInvoiceId,
      invoicingStatus: purchaseOrder.invoicingStatus,
      invoicingNotes: purchaseOrder.invoicingNotes,
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt,
    },
    relationships: purchaseOrder.contact
      ? {
          contact: {
            data: {
              id: purchaseOrder.contact.id.toString(),
              type: 'contacts',
            },
          },
        }
      : undefined,
  },
  included: purchaseOrder.contact
    ? [
        {
          id: purchaseOrder.contact.id.toString(),
          type: 'contacts',
          attributes: {
            name: purchaseOrder.contact.name,
            email: purchaseOrder.contact.email,
            phone: purchaseOrder.contact.phone,
            type: purchaseOrder.contact.type,
          },
        },
      ]
    : undefined,
})

/**
 * Creates a mock JSON:API response for multiple purchase orders
 */
export const mockJsonApiPurchaseOrdersResponse = (purchaseOrders: PurchaseOrder[]) => {
  const allContacts: Contact[] = []

  purchaseOrders.forEach((order) => {
    if (order.contact && !allContacts.find((c) => c.id === order.contact!.id)) {
      allContacts.push(order.contact)
    }
  })

  return {
    data: purchaseOrders.map((order) => ({
      id: order.id.toString(),
      type: 'purchase-orders',
      attributes: {
        contactId: order.contactId,
        orderDate: order.orderDate,
        status: order.status,
        totalAmount: order.totalAmount,
        notes: order.notes,
        apInvoiceId: order.apInvoiceId,
        invoicingStatus: order.invoicingStatus,
        invoicingNotes: order.invoicingNotes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      relationships: order.contact
        ? {
            contact: {
              data: {
                id: order.contact.id.toString(),
                type: 'contacts',
              },
            },
          }
        : undefined,
    })),
    included: allContacts.map((contact) => ({
      id: contact.id.toString(),
      type: 'contacts',
      attributes: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        type: contact.type,
      },
    })),
  }
}

/**
 * Creates a mock JSON:API response for purchase order items
 */
export const mockJsonApiPurchaseOrderItemsResponse = (items: PurchaseOrderItem[]) => {
  // Collect unique products from all items
  const uniqueProducts = new Map()
  items.forEach((item) => {
    if (item.product && !uniqueProducts.has(item.productId.toString())) {
      uniqueProducts.set(item.productId.toString(), item.product)
    }
  })

  return {
    data: items.map((item) => ({
      id: item.id.toString(),
      type: 'purchase-order-items',
      attributes: {
        purchaseOrderId: item.purchaseOrderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        total: item.total,
        apInvoiceLineId: item.apInvoiceLineId,
        invoicedQuantity: item.invoicedQuantity,
        invoicedAmount: item.invoicedAmount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      relationships: item.product
        ? {
            product: {
              data: {
                id: item.productId.toString(),
                type: 'products',
              },
            },
          }
        : undefined,
    })),
    included: Array.from(uniqueProducts.entries()).map(([id, product]) => ({
      id,
      type: 'products',
      attributes: {
        name: (product as Record<string, unknown>).name,
        sku: (product as Record<string, unknown>).sku,
      },
    })),
  }
}

/**
 * Creates a mock 422 validation error response
 */
export const mock422Error = (field: string, message: string) => ({
  response: {
    status: 422,
    data: {
      errors: [
        {
          code: 'VALIDATION_ERROR',
          source: { pointer: `/data/attributes/${field}` },
          detail: message,
        },
      ],
    },
  },
})

/**
 * Creates a mock 404 not found error response
 */
export const mock404Error = () => ({
  response: {
    status: 404,
    data: {
      errors: [
        {
          code: 'RESOURCE_NOT_FOUND',
          detail: 'Purchase order not found',
        },
      ],
    },
  },
})

/**
 * Creates a mock 409 conflict error (e.g., duplicate order number)
 */
export const mock409Error = (message: string) => ({
  response: {
    status: 409,
    data: {
      errors: [
        {
          code: 'CONFLICT',
          detail: message,
        },
      ],
    },
  },
})

/**
 * Creates a mock 500 server error response
 */
export const mock500Error = () => ({
  response: {
    status: 500,
    data: {
      errors: [
        {
          code: 'SERVER_ERROR',
          detail: 'Internal server error',
        },
      ],
    },
  },
})

// ===== BUDGET MOCKS (v1.1) =====

import type {
  Budget,
  ParsedBudget,
  BudgetType,
  BudgetPeriodType,
  BudgetStatusLevel,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetSummary,
} from '../../types'

/**
 * Creates a mock Budget object with optional overrides
 */
export const mockBudget = (overrides?: Partial<Budget>): Budget => ({
  id: '1',
  name: 'Test Budget',
  code: 'TEST-BUD-001',
  description: 'Test budget description',
  budgetType: 'general' as BudgetType,
  departmentCode: null,
  categoryId: null,
  projectCode: null,
  contactId: null,
  periodType: 'annual' as BudgetPeriodType,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  fiscalYear: 2025,
  budgetedAmount: 100000,
  committedAmount: 25000,
  spentAmount: 15000,
  availableAmount: 60000,
  warningThreshold: 80,
  criticalThreshold: 95,
  hardLimit: false,
  allowOvercommit: false,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  utilizationPercent: 40,
  statusLevel: 'normal' as BudgetStatusLevel,
  ...overrides,
})

/**
 * Creates a list of mock budgets
 */
export const mockBudgets = (count: number = 3): Budget[] => {
  const types: BudgetType[] = ['general', 'department', 'project']
  const periods: BudgetPeriodType[] = ['annual', 'quarterly', 'monthly']

  return Array.from({ length: count }, (_, index) =>
    mockBudget({
      id: (index + 1).toString(),
      name: `Test Budget ${index + 1}`,
      code: `TEST-BUD-${String(index + 1).padStart(3, '0')}`,
      budgetType: types[index % types.length],
      periodType: periods[index % periods.length],
      budgetedAmount: (index + 1) * 50000,
      committedAmount: (index + 1) * 10000,
      spentAmount: (index + 1) * 5000,
      utilizationPercent: ((index + 1) * 20) % 100,
    })
  )
}

/**
 * Creates a mock ParsedBudget object with optional overrides
 */
export const mockParsedBudget = (overrides?: Partial<ParsedBudget>): ParsedBudget => {
  const base = mockBudget(overrides)
  return {
    ...base,
    budgetedAmountDisplay: `$${base.budgetedAmount.toLocaleString('es-MX')}`,
    committedAmountDisplay: `$${base.committedAmount.toLocaleString('es-MX')}`,
    spentAmountDisplay: `$${base.spentAmount.toLocaleString('es-MX')}`,
    availableAmountDisplay: `$${(base.availableAmount || 0).toLocaleString('es-MX')}`,
    utilizationDisplay: `${(base.utilizationPercent || 0).toFixed(1)}%`,
    budgetTypeLabel: 'General',
    periodTypeLabel: 'Anual',
    statusLevelLabel: 'Normal',
    ...overrides,
  }
}

/**
 * Creates mock form data for creating budgets
 */
export const mockCreateBudgetRequest = (
  overrides?: Partial<CreateBudgetRequest>
): CreateBudgetRequest => ({
  name: 'New Budget',
  code: 'NEW-BUD-001',
  description: 'New budget description',
  budgetType: 'general',
  periodType: 'annual',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  budgetedAmount: 50000,
  warningThreshold: 80,
  criticalThreshold: 95,
  hardLimit: false,
  allowOvercommit: false,
  isActive: true,
  ...overrides,
})

/**
 * Creates mock form data for updating budgets
 */
export const mockUpdateBudgetRequest = (
  overrides?: Partial<UpdateBudgetRequest>
): UpdateBudgetRequest => ({
  name: 'Updated Budget',
  budgetedAmount: 75000,
  ...overrides,
})

/**
 * Creates a mock BudgetSummary object
 */
export const mockBudgetSummary = (overrides?: Partial<BudgetSummary>): BudgetSummary => ({
  totalBudgets: 10,
  activeBudgets: 8,
  totalBudgeted: 500000,
  totalCommitted: 150000,
  totalSpent: 75000,
  totalAvailable: 275000,
  budgetsOverWarning: 2,
  budgetsOverCritical: 1,
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single budget
 */
export const mockJsonApiBudgetResponse = (budget: Budget) => ({
  data: {
    id: budget.id.toString(),
    type: 'budgets',
    attributes: {
      name: budget.name,
      code: budget.code,
      description: budget.description,
      budget_type: budget.budgetType,
      department_code: budget.departmentCode,
      category_id: budget.categoryId,
      project_code: budget.projectCode,
      contact_id: budget.contactId,
      period_type: budget.periodType,
      start_date: budget.startDate,
      end_date: budget.endDate,
      fiscal_year: budget.fiscalYear,
      budgeted_amount: budget.budgetedAmount,
      committed_amount: budget.committedAmount,
      spent_amount: budget.spentAmount,
      available_amount: budget.availableAmount,
      warning_threshold: budget.warningThreshold,
      critical_threshold: budget.criticalThreshold,
      hard_limit: budget.hardLimit,
      allow_overcommit: budget.allowOvercommit,
      is_active: budget.isActive,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
      utilization_percent: budget.utilizationPercent,
      status_level: budget.statusLevel,
    },
  },
})

/**
 * Creates a mock JSON:API response for multiple budgets
 */
export const mockJsonApiBudgetsResponse = (budgets: Budget[]) => ({
  data: budgets.map((budget) => ({
    id: budget.id.toString(),
    type: 'budgets',
    attributes: {
      name: budget.name,
      code: budget.code,
      description: budget.description,
      budget_type: budget.budgetType,
      department_code: budget.departmentCode,
      category_id: budget.categoryId,
      project_code: budget.projectCode,
      contact_id: budget.contactId,
      period_type: budget.periodType,
      start_date: budget.startDate,
      end_date: budget.endDate,
      fiscal_year: budget.fiscalYear,
      budgeted_amount: budget.budgetedAmount,
      committed_amount: budget.committedAmount,
      spent_amount: budget.spentAmount,
      available_amount: budget.availableAmount,
      warning_threshold: budget.warningThreshold,
      critical_threshold: budget.criticalThreshold,
      hard_limit: budget.hardLimit,
      allow_overcommit: budget.allowOvercommit,
      is_active: budget.isActive,
      created_at: budget.createdAt,
      updated_at: budget.updatedAt,
      utilization_percent: budget.utilizationPercent,
      status_level: budget.statusLevel,
    },
  })),
  meta: {
    current_page: 1,
    per_page: 20,
    total: budgets.length,
    last_page: 1,
  },
})
