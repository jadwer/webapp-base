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
  status: 'pending',
  approvedAt: null,
  deliveredAt: null,
  invoicingNotes: null,
  totalAmount: 1000.00,
  notes: 'Test sales order notes',
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
    salesOrderId: '1',
    productId,
    product: {
      id: productId,
      name: 'Test Product',
      sku: 'TEST-001',
    },
    quantity: 10,
    unitPrice: 100.00,
    totalPrice: 1000.00,
    discount: 0,
    ...overrides,
  }
}

/**
 * Creates a list of mock sales order items
 */
export const mockSalesOrderItems = (count: number = 3): SalesOrderItem[] => {
  return Array.from({ length: count }, (_, index) =>
    mockSalesOrderItem({
      id: (index + 1).toString(),
      productId: index + 1,
      quantity: (index + 1) * 10,
      unitPrice: 100 + (index * 50),
      totalPrice: (index + 1) * 10 * (100 + (index * 50)),
    })
  )
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
        total_price: item.totalPrice,
        discount: item.discount,
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
