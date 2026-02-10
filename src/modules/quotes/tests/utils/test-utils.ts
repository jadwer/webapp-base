/**
 * Quote Test Utilities
 *
 * Factory functions and mocks for testing the quotes module.
 */

import type {
  Quote,
  QuoteItem,
  QuoteStatus,
  QuoteSummary,
  Contact,
  ProductRef,
  Address,
} from '../../types';

// ============================================
// Mock Data Factories
// ============================================

export function createMockQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: '1',
    contactId: 1,
    shoppingCartId: 1,
    salesOrderId: null,
    purchaseOrderId: null,
    quoteNumber: 'COT-26000001',
    status: 'draft' as QuoteStatus,
    quoteDate: '2026-01-21',
    validUntil: '2026-02-21',
    estimatedEta: '2026-01-28',
    subtotalAmount: 1000.00,
    discountAmount: 0,
    taxAmount: 160.00,
    totalAmount: 1160.00,
    currency: 'MXN',
    notes: 'Test quote notes',
    internalNotes: null,
    termsAndConditions: 'Standard terms',
    shippingAddress: null,
    billingAddress: null,
    metadata: null,
    sentAt: null,
    acceptedAt: null,
    rejectedAt: null,
    convertedAt: null,
    createdAt: '2026-01-21T10:00:00.000Z',
    updatedAt: '2026-01-21T10:00:00.000Z',
    itemsCount: 2,
    totalQuantity: 5,
    isExpired: false,
    canBeSent: true,
    canBeConverted: false,
    ...overrides,
  };
}

export function createMockQuoteItem(overrides: Partial<QuoteItem> = {}): QuoteItem {
  return {
    id: '1',
    quoteId: 1,
    productId: 1,
    quantity: 2,
    unitPrice: 500.00,
    quotedPrice: 500.00,
    discountPercentage: 0,
    discountAmount: 0,
    taxRate: 16,
    taxAmount: 160.00,
    total: 1160.00,
    productName: 'Test Product',
    productSku: 'PROD-001',
    notes: null,
    metadata: null,
    createdAt: '2026-01-21T10:00:00.000Z',
    updatedAt: '2026-01-21T10:00:00.000Z',
    subtotalBeforeDiscount: 1000.00,
    subtotalAfterDiscount: 1000.00,
    priceVariance: 0,
    effectiveDiscountPercentage: 0,
    ...overrides,
  };
}

export function createMockContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: '1',
    name: 'Test Contact',
    email: 'contact@test.com',
    phone: '+52 555 123 4567',
    type: 'company',
    ...overrides,
  };
}

export function createMockProductRef(overrides: Partial<ProductRef> = {}): ProductRef {
  return {
    id: '1',
    name: 'Test Product',
    sku: 'PROD-001',
    price: 500.00,
    stock: [{
      id: '1',
      warehouseId: 1,
      warehouseName: 'Main Warehouse',
      quantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
      status: 'available',
    }],
    ...overrides,
  };
}

export function createMockAddress(overrides: Partial<Address> = {}): Address {
  return {
    street: '123 Test Street',
    city: 'Mexico City',
    state: 'CDMX',
    postalCode: '01234',
    country: 'MX',
    ...overrides,
  };
}

export function createMockQuoteSummary(overrides: Partial<QuoteSummary> = {}): QuoteSummary {
  return {
    total: 100,
    draft: 20,
    sent: 30,
    accepted: 25,
    converted: 10,
    rejected: 10,
    expired: 3,
    cancelled: 2,
    totalValue: 500000.00,
    averageValue: 5000.00,
    conversionRate: 35.0,
    ...overrides,
  };
}

// ============================================
// JSON:API Response Factories
// ============================================

export function createMockQuoteAPIResponse(quote: Quote) {
  return {
    data: {
      id: quote.id,
      type: 'quotes',
      attributes: {
        contact_id: quote.contactId,
        shopping_cart_id: quote.shoppingCartId,
        sales_order_id: quote.salesOrderId,
        quote_number: quote.quoteNumber,
        status: quote.status,
        quote_date: quote.quoteDate,
        valid_until: quote.validUntil,
        estimated_eta: quote.estimatedEta,
        subtotal_amount: quote.subtotalAmount,
        discount_amount: quote.discountAmount,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        currency: quote.currency,
        notes: quote.notes,
        internal_notes: quote.internalNotes,
        terms_and_conditions: quote.termsAndConditions,
        shipping_address: quote.shippingAddress,
        billing_address: quote.billingAddress,
        metadata: quote.metadata,
        sent_at: quote.sentAt,
        accepted_at: quote.acceptedAt,
        rejected_at: quote.rejectedAt,
        converted_at: quote.convertedAt,
        created_at: quote.createdAt,
        updated_at: quote.updatedAt,
        items_count: quote.itemsCount,
        total_quantity: quote.totalQuantity,
        is_expired: quote.isExpired,
        can_be_sent: quote.canBeSent,
        can_be_converted: quote.canBeConverted,
      },
    },
  };
}

export function createMockQuotesListAPIResponse(quotes: Quote[], meta?: { currentPage?: number; perPage?: number; total?: number }) {
  return {
    data: quotes.map((quote) => ({
      id: quote.id,
      type: 'quotes',
      attributes: {
        contact_id: quote.contactId,
        shopping_cart_id: quote.shoppingCartId,
        sales_order_id: quote.salesOrderId,
        quote_number: quote.quoteNumber,
        status: quote.status,
        quote_date: quote.quoteDate,
        valid_until: quote.validUntil,
        estimated_eta: quote.estimatedEta,
        subtotal_amount: quote.subtotalAmount,
        discount_amount: quote.discountAmount,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        currency: quote.currency,
        notes: quote.notes,
        internal_notes: quote.internalNotes,
        terms_and_conditions: quote.termsAndConditions,
        shipping_address: quote.shippingAddress,
        billing_address: quote.billingAddress,
        metadata: quote.metadata,
        sent_at: quote.sentAt,
        accepted_at: quote.acceptedAt,
        rejected_at: quote.rejectedAt,
        converted_at: quote.convertedAt,
        created_at: quote.createdAt,
        updated_at: quote.updatedAt,
        items_count: quote.itemsCount,
        total_quantity: quote.totalQuantity,
        is_expired: quote.isExpired,
        can_be_sent: quote.canBeSent,
        can_be_converted: quote.canBeConverted,
      },
    })),
    meta: meta || {
      currentPage: 1,
      perPage: 20,
      total: quotes.length,
    },
  };
}

export function createMockQuoteItemAPIResponse(item: QuoteItem) {
  return {
    data: {
      id: item.id,
      type: 'quote-items',
      attributes: {
        quote_id: item.quoteId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        quoted_price: item.quotedPrice,
        discount_percentage: item.discountPercentage,
        discount_amount: item.discountAmount,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        total: item.total,
        product_name: item.productName,
        product_sku: item.productSku,
        notes: item.notes,
        metadata: item.metadata,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        subtotal_before_discount: item.subtotalBeforeDiscount,
        subtotal_after_discount: item.subtotalAfterDiscount,
        price_variance: item.priceVariance,
        effective_discount_percentage: item.effectiveDiscountPercentage,
      },
    },
  };
}

export function createMockQuoteItemsListAPIResponse(items: QuoteItem[]) {
  return {
    data: items.map((item) => ({
      id: item.id,
      type: 'quote-items',
      attributes: {
        quote_id: item.quoteId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        quoted_price: item.quotedPrice,
        discount_percentage: item.discountPercentage,
        discount_amount: item.discountAmount,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        total: item.total,
        product_name: item.productName,
        product_sku: item.productSku,
        notes: item.notes,
        metadata: item.metadata,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        subtotal_before_discount: item.subtotalBeforeDiscount,
        subtotal_after_discount: item.subtotalAfterDiscount,
        price_variance: item.priceVariance,
        effective_discount_percentage: item.effectiveDiscountPercentage,
      },
    })),
  };
}

// ============================================
// Action Response Factories
// ============================================

export function createMockActionResponse(quote: Quote, message: string) {
  return {
    data: {
      id: quote.id,
      type: 'quotes',
      attributes: {
        contact_id: quote.contactId,
        shopping_cart_id: quote.shoppingCartId,
        sales_order_id: quote.salesOrderId,
        quote_number: quote.quoteNumber,
        status: quote.status,
        quote_date: quote.quoteDate,
        valid_until: quote.validUntil,
        estimated_eta: quote.estimatedEta,
        subtotal_amount: quote.subtotalAmount,
        discount_amount: quote.discountAmount,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        currency: quote.currency,
        notes: quote.notes,
        internal_notes: quote.internalNotes,
        terms_and_conditions: quote.termsAndConditions,
        shipping_address: quote.shippingAddress,
        billing_address: quote.billingAddress,
        metadata: quote.metadata,
        sent_at: quote.sentAt,
        accepted_at: quote.acceptedAt,
        rejected_at: quote.rejectedAt,
        converted_at: quote.convertedAt,
        created_at: quote.createdAt,
        updated_at: quote.updatedAt,
        items_count: quote.itemsCount,
        total_quantity: quote.totalQuantity,
        is_expired: quote.isExpired,
        can_be_sent: quote.canBeSent,
        can_be_converted: quote.canBeConverted,
      },
    },
    message,
  };
}

export function createMockConvertResponse(quote: Quote, salesOrder: { id: string; orderNumber: string }) {
  return {
    data: {
      quote: {
        id: quote.id,
        type: 'quotes',
        attributes: {
          contact_id: quote.contactId,
          shopping_cart_id: quote.shoppingCartId,
          sales_order_id: parseInt(salesOrder.id, 10),
          quote_number: quote.quoteNumber,
          status: 'converted',
          quote_date: quote.quoteDate,
          valid_until: quote.validUntil,
          estimated_eta: quote.estimatedEta,
          subtotal_amount: quote.subtotalAmount,
          discount_amount: quote.discountAmount,
          tax_amount: quote.taxAmount,
          total_amount: quote.totalAmount,
          currency: quote.currency,
          notes: quote.notes,
          internal_notes: quote.internalNotes,
          terms_and_conditions: quote.termsAndConditions,
          shipping_address: quote.shippingAddress,
          billing_address: quote.billingAddress,
          metadata: quote.metadata,
          sent_at: quote.sentAt,
          accepted_at: quote.acceptedAt,
          rejected_at: quote.rejectedAt,
          converted_at: new Date().toISOString(),
          created_at: quote.createdAt,
          updated_at: quote.updatedAt,
          items_count: quote.itemsCount,
          total_quantity: quote.totalQuantity,
          is_expired: quote.isExpired,
          can_be_sent: false,
          can_be_converted: false,
        },
      },
      salesOrder: {
        type: 'sales-orders',
        id: salesOrder.id,
        attributes: {
          order_number: salesOrder.orderNumber,
          status: 'pending',
          total_amount: quote.totalAmount,
        },
      },
    },
    message: 'Quote converted to sales order successfully',
  };
}

export function createMockSummaryResponse(summary: QuoteSummary) {
  return {
    data: summary,
  };
}

export function createMockExpiringSoonResponse(quotes: Quote[], days: number) {
  return {
    data: quotes.map((quote) => ({
      id: quote.id,
      type: 'quotes',
      attributes: {
        contact_id: quote.contactId,
        shopping_cart_id: quote.shoppingCartId,
        sales_order_id: quote.salesOrderId,
        quote_number: quote.quoteNumber,
        status: quote.status,
        quote_date: quote.quoteDate,
        valid_until: quote.validUntil,
        estimated_eta: quote.estimatedEta,
        subtotal_amount: quote.subtotalAmount,
        discount_amount: quote.discountAmount,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        currency: quote.currency,
        notes: quote.notes,
        internal_notes: quote.internalNotes,
        terms_and_conditions: quote.termsAndConditions,
        shipping_address: quote.shippingAddress,
        billing_address: quote.billingAddress,
        metadata: quote.metadata,
        sent_at: quote.sentAt,
        accepted_at: quote.acceptedAt,
        rejected_at: quote.rejectedAt,
        converted_at: quote.convertedAt,
        created_at: quote.createdAt,
        updated_at: quote.updatedAt,
        items_count: quote.itemsCount,
        total_quantity: quote.totalQuantity,
        is_expired: quote.isExpired,
        can_be_sent: quote.canBeSent,
        can_be_converted: quote.canBeConverted,
      },
    })),
    meta: {
      count: quotes.length,
      days,
    },
  };
}
