/**
 * Test Utilities for Sales Module
 * Mock factories and helper functions for testing
 */

import { vi } from 'vitest'
import {
  SalesOrder,
  SalesOrderItem,
  Contact,
  SalesOrderFormData
} from '../../types'

/**
 * Creates a mock Contact object with optional overrides
 */
export const mockContact = (overrides?: Partial<Contact>): Contact => ({
  id: '1',
  name: 'Test Customer',
  email: 'customer@test.com',
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
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@test.com`,
      type: index % 2 === 0 ? 'company' : 'individual',
    })
  )
}

/**
 * Creates a mock SalesOrder object with optional overrides
 */
export const mockSalesOrder = (overrides?: Partial<SalesOrder>): SalesOrder => ({
  id: '1',
  contactId: 1,
  contact: mockContact(),
  orderNumber: 'SO-2025-001',
  orderDate: '2025-01-01',
  status: 'draft',
  approvedAt: null,
  deliveredAt: null,
  arInvoiceId: null,
  invoicingStatus: 'pending',
  invoicingNotes: null,
  discountTotal: 0,
  totalAmount: 1000.00,
  notes: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates a list of mock sales orders
 */
export const mockSalesOrders = (count: number = 3): SalesOrder[] => {
  return Array.from({ length: count }, (_, index) =>
    mockSalesOrder({
      id: (index + 1).toString(),
      contactId: index + 1,
      orderNumber: `SO-2025-${String(index + 1).padStart(3, '0')}`,
      status: ['draft', 'confirmed', 'processing'][index % 3] as any,
      totalAmount: (index + 1) * 1000,
    })
  )
}

/**
 * Creates a mock SalesOrderItem object with optional overrides
 */
export const mockSalesOrderItem = (overrides?: Partial<SalesOrderItem>): SalesOrderItem => {
  const productId = overrides?.productId || 1
  return {
    id: '1',
    salesOrderId: 1,
    productId,
    product: {
      id: productId,
      name: 'Test Product',
      sku: 'TEST-001',
    },
    quantity: 10,
    unitPrice: 100.00,
    discount: 0,
    total: 1000.00,
    totalPrice: 1000.00,
    arInvoiceLineId: null,
    invoicedQuantity: null,
    invoicedAmount: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/**
 * Creates a list of mock sales order items
 */
export const mockSalesOrderItems = (count: number = 3): SalesOrderItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const quantity = (index + 1) * 10
    const unitPrice = 100 + (index * 50)
    const total = quantity * unitPrice
    return mockSalesOrderItem({
      id: (index + 1).toString(),
      productId: index + 1,
      quantity,
      unitPrice,
      total,
      totalPrice: total,
    })
  })
}

/**
 * Creates mock form data for creating/updating sales orders
 */
export const mockSalesOrderFormData = (
  overrides?: Partial<SalesOrderFormData>
): SalesOrderFormData => ({
  contactId: 1,
  orderNumber: 'SO-2025-001',
  orderDate: '2025-01-01',
  status: 'pending',
  notes: 'Test notes',
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single sales order
 */
export const mockJsonApiSalesOrderResponse = (salesOrder: SalesOrder) => ({
  data: {
    id: salesOrder.id.toString(),
    type: 'sales-orders',
    attributes: {
      contact_id: salesOrder.contactId,
      order_number: salesOrder.orderNumber,
      order_date: salesOrder.orderDate,
      status: salesOrder.status,
      total_amount: salesOrder.totalAmount,
      notes: salesOrder.notes,
      created_at: salesOrder.createdAt,
      updated_at: salesOrder.updatedAt,
    },
    relationships: salesOrder.contact
      ? {
          contact: {
            data: {
              id: salesOrder.contact.id.toString(),
              type: 'contacts',
            },
          },
        }
      : undefined,
  },
  included: salesOrder.contact
    ? [
        {
          id: salesOrder.contact.id.toString(),
          type: 'contacts',
          attributes: {
            name: salesOrder.contact.name,
            email: salesOrder.contact.email,
            phone: salesOrder.contact.phone,
            type: salesOrder.contact.type,
          },
        },
      ]
    : undefined,
})

/**
 * Creates a mock JSON:API response for multiple sales orders
 */
export const mockJsonApiSalesOrdersResponse = (salesOrders: SalesOrder[]) => {
  const allContacts: Contact[] = []

  salesOrders.forEach((order) => {
    if (order.contact && !allContacts.find((c) => c.id === order.contact!.id)) {
      allContacts.push(order.contact)
    }
  })

  return {
    data: salesOrders.map((order) => ({
      id: order.id.toString(),
      type: 'sales-orders',
      attributes: {
        contact_id: order.contactId,
        order_number: order.orderNumber,
        order_date: order.orderDate,
        status: order.status,
        total_amount: order.totalAmount,
        notes: order.notes,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
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
 * Creates a mock JSON:API response for sales order items
 */
export const mockJsonApiSalesOrderItemsResponse = (items: SalesOrderItem[]) => {
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
      type: 'sales-order-items',
      attributes: {
        sales_order_id: item.salesOrderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
        total_price: item.totalPrice,
        discount: item.discount,
        ar_invoice_line_id: item.arInvoiceLineId,
        invoiced_quantity: item.invoicedQuantity,
        invoiced_amount: item.invoicedAmount,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
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
        name: product.name,
        sku: product.sku,
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
          detail: 'Sales order not found',
        },
      ],
    },
  },
})

/**
 * Creates a mock 409 conflict error (e.g., duplicate order number)
 */
export const mock409Error = (message: string = 'Order number already exists') => ({
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
          code: 'INTERNAL_SERVER_ERROR',
          detail: 'Internal server error',
        },
      ],
    },
  },
})

/**
 * Mock Router (Next.js)
 */
export const mockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
})

// ========================================
// DISCOUNT RULES MOCK FACTORIES (v1.1 SA-M003)
// ========================================

import type {
  DiscountRule,
  ParsedDiscountRule,
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleFormData
} from '../../types'

/**
 * Creates a mock DiscountRule with optional overrides
 */
export const mockDiscountRule = (overrides?: Partial<DiscountRule>): DiscountRule => ({
  id: '1',
  name: 'Summer Sale',
  code: 'SUMMER2025',
  description: 'Summer discount promotion',
  discountType: 'percentage',
  discountValue: 10,
  buyQuantity: null,
  getQuantity: null,
  appliesTo: 'order',
  minOrderAmount: 100,
  minQuantity: null,
  maxDiscountAmount: 50,
  productIds: null,
  categoryIds: null,
  customerIds: null,
  customerClassifications: null,
  startDate: '2025-06-01',
  endDate: '2025-08-31',
  usageLimit: 1000,
  usagePerCustomer: 5,
  currentUsage: 150,
  priority: 10,
  isCombinable: true,
  isActive: true,
  isValid: true,
  isExpired: false,
  usageRemaining: 850,
  createdAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2025-01-15T10:00:00.000Z',
  ...overrides,
})

/**
 * Creates a mock ParsedDiscountRule with UI-friendly fields
 */
export const mockParsedDiscountRule = (overrides?: Partial<ParsedDiscountRule>): ParsedDiscountRule => ({
  ...mockDiscountRule(overrides),
  discountDisplay: '10%',
  statusLabel: 'Activo',
  validityLabel: 'Valido hasta 31 ago 2025',
  ...overrides,
})

/**
 * Creates a list of mock discount rules
 */
export const mockDiscountRules = (count: number = 3): ParsedDiscountRule[] => {
  const types = ['percentage', 'fixed', 'buy_x_get_y'] as const
  const appliesTo = ['order', 'product', 'category'] as const

  return Array.from({ length: count }, (_, index) => {
    const type = types[index % 3]
    return mockParsedDiscountRule({
      id: (index + 1).toString(),
      name: `Discount ${index + 1}`,
      code: `DISC${index + 1}`,
      discountType: type,
      discountValue: type === 'buy_x_get_y' ? 0 : (index + 1) * 5,
      buyQuantity: type === 'buy_x_get_y' ? 2 : null,
      getQuantity: type === 'buy_x_get_y' ? 1 : null,
      appliesTo: appliesTo[index % 3],
      priority: index + 1,
      discountDisplay: type === 'percentage' ? `${(index + 1) * 5}%` :
        type === 'fixed' ? `$${(index + 1) * 5}.00` :
          `Compra 2 Lleva 1`,
    })
  })
}

/**
 * Creates mock form data for creating discount rules
 */
export const mockDiscountRuleFormData = (
  overrides?: Partial<DiscountRuleFormData>
): DiscountRuleFormData => ({
  name: 'Test Discount',
  code: 'TESTDISC',
  description: 'Test discount description',
  discountType: 'percentage',
  discountValue: 15,
  buyQuantity: undefined,
  getQuantity: undefined,
  appliesTo: 'order',
  minOrderAmount: 50,
  minQuantity: undefined,
  maxDiscountAmount: 100,
  productIds: [],
  categoryIds: [],
  customerIds: [],
  customerClassifications: [],
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  usageLimit: 500,
  usagePerCustomer: 3,
  priority: 5,
  isCombinable: true,
  isActive: true,
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single discount rule
 */
export const mockJsonApiDiscountRuleResponse = (rule: DiscountRule) => ({
  data: {
    id: rule.id,
    type: 'discount-rules',
    attributes: {
      name: rule.name,
      code: rule.code,
      description: rule.description,
      discount_type: rule.discountType,
      discount_value: rule.discountValue,
      buy_quantity: rule.buyQuantity,
      get_quantity: rule.getQuantity,
      applies_to: rule.appliesTo,
      min_order_amount: rule.minOrderAmount,
      min_quantity: rule.minQuantity,
      max_discount_amount: rule.maxDiscountAmount,
      product_ids: rule.productIds,
      category_ids: rule.categoryIds,
      customer_ids: rule.customerIds,
      customer_classifications: rule.customerClassifications,
      start_date: rule.startDate,
      end_date: rule.endDate,
      usage_limit: rule.usageLimit,
      usage_per_customer: rule.usagePerCustomer,
      current_usage: rule.currentUsage,
      priority: rule.priority,
      is_combinable: rule.isCombinable,
      is_active: rule.isActive,
      is_valid: rule.isValid,
      is_expired: rule.isExpired,
      usage_remaining: rule.usageRemaining,
      created_at: rule.createdAt,
      updated_at: rule.updatedAt,
    },
  },
})

/**
 * Creates a mock JSON:API response for multiple discount rules
 */
export const mockJsonApiDiscountRulesResponse = (rules: DiscountRule[], meta?: Record<string, unknown>) => ({
  data: rules.map(rule => ({
    id: rule.id,
    type: 'discount-rules',
    attributes: {
      name: rule.name,
      code: rule.code,
      description: rule.description,
      discount_type: rule.discountType,
      discount_value: rule.discountValue,
      buy_quantity: rule.buyQuantity,
      get_quantity: rule.getQuantity,
      applies_to: rule.appliesTo,
      min_order_amount: rule.minOrderAmount,
      min_quantity: rule.minQuantity,
      max_discount_amount: rule.maxDiscountAmount,
      product_ids: rule.productIds,
      category_ids: rule.categoryIds,
      customer_ids: rule.customerIds,
      customer_classifications: rule.customerClassifications,
      start_date: rule.startDate,
      end_date: rule.endDate,
      usage_limit: rule.usageLimit,
      usage_per_customer: rule.usagePerCustomer,
      current_usage: rule.currentUsage,
      priority: rule.priority,
      is_combinable: rule.isCombinable,
      is_active: rule.isActive,
      is_valid: rule.isValid,
      is_expired: rule.isExpired,
      usage_remaining: rule.usageRemaining,
      created_at: rule.createdAt,
      updated_at: rule.updatedAt,
    },
  })),
  meta: meta || {
    currentPage: 1,
    perPage: 20,
    total: rules.length,
    lastPage: 1,
  },
})
