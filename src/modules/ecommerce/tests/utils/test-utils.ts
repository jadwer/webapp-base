/**
 * Ecommerce Module Test Utilities
 *
 * Mock factories and test helpers for the Ecommerce module.
 */

import type {
  EcommerceOrder,
  EcommerceOrderItem,
  ShoppingCart,
  ShoppingCartItem,
} from '../../types';

// ============================================
// Mock Factories
// ============================================

export function createMockEcommerceOrder(overrides?: Partial<EcommerceOrder>): EcommerceOrder {
  return {
    id: '1',
    orderNumber: 'ECO-2025-001',
    customerId: 1,
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    status: 'pending',
    paymentStatus: 'pending',
    shippingStatus: 'pending',
    subtotalAmount: 1000.00,
    taxAmount: 160.00,
    shippingAmount: 50.00,
    discountAmount: 0.00,
    totalAmount: 1210.00,
    shippingAddressLine1: '123 Main St',
    shippingAddressLine2: 'Apt 4B',
    shippingCity: 'New York',
    shippingState: 'NY',
    shippingPostalCode: '10001',
    shippingCountry: 'USA',
    billingAddressLine1: '123 Main St',
    billingCity: 'New York',
    billingState: 'NY',
    billingPostalCode: '10001',
    billingCountry: 'USA',
    paymentMethodId: 1,
    paymentReference: 'PAY-123456',
    notes: 'Test order',
    orderDate: '2025-01-15',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

export function createMockEcommerceOrderItem(
  overrides?: Partial<EcommerceOrderItem>
): EcommerceOrderItem {
  return {
    id: '1',
    ecommerceOrderId: 1,
    productId: 1,
    productName: 'Test Product',
    productSku: 'TEST-001',
    productImage: 'https://example.com/product.jpg',
    quantity: 2,
    unitPrice: 500.00,
    discount: 0.00,
    taxAmount: 160.00,
    totalPrice: 1000.00,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

export function createMockShoppingCart(overrides?: Partial<ShoppingCart>): ShoppingCart {
  return {
    id: '1',
    sessionId: 'sess_123456789',
    customerId: 1,
    subtotalAmount: 1000.00,
    taxAmount: 160.00,
    totalAmount: 1160.00,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    expiresAt: '2025-01-16T10:00:00Z',
    ...overrides,
  };
}

export function createMockShoppingCartItem(
  overrides?: Partial<ShoppingCartItem>
): ShoppingCartItem {
  return {
    id: '1',
    shoppingCartId: 1,
    productId: 1,
    productName: 'Test Product',
    productSku: 'TEST-001',
    productImage: 'https://example.com/product.jpg',
    quantity: 2,
    unitPrice: 500.00,
    totalPrice: 1000.00,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

// ============================================
// API Response Mocks
// ============================================

export function createMockEcommerceOrderAPIResponse(order: EcommerceOrder) {
  return {
    data: {
      id: order.id,
      type: 'ecommerce-orders',
      attributes: {
        order_number: order.orderNumber,
        customer_id: order.customerId,
        customer_email: order.customerEmail,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        status: order.status,
        payment_status: order.paymentStatus,
        shipping_status: order.shippingStatus,
        subtotal_amount: order.subtotalAmount,
        tax_amount: order.taxAmount,
        shipping_amount: order.shippingAmount,
        discount_amount: order.discountAmount,
        total_amount: order.totalAmount,
        shipping_address_line1: order.shippingAddressLine1,
        shipping_address_line2: order.shippingAddressLine2,
        shipping_city: order.shippingCity,
        shipping_state: order.shippingState,
        shipping_postal_code: order.shippingPostalCode,
        shipping_country: order.shippingCountry,
        billing_address_line1: order.billingAddressLine1,
        billing_address_line2: order.billingAddressLine2,
        billing_city: order.billingCity,
        billing_state: order.billingState,
        billing_postal_code: order.billingPostalCode,
        billing_country: order.billingCountry,
        payment_method_id: order.paymentMethodId,
        payment_reference: order.paymentReference,
        notes: order.notes,
        order_date: order.orderDate,
        completed_date: order.completedDate,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      },
    },
  };
}

export function createMockEcommerceOrderItemAPIResponse(item: EcommerceOrderItem) {
  return {
    data: {
      id: item.id,
      type: 'ecommerce-order-items',
      attributes: {
        ecommerce_order_id: item.ecommerceOrderId,
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        product_image: item.productImage,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        tax_amount: item.taxAmount,
        total_price: item.totalPrice,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      },
    },
  };
}

export function createMockShoppingCartAPIResponse(cart: ShoppingCart) {
  return {
    data: {
      id: cart.id,
      type: 'shopping-carts',
      attributes: {
        session_id: cart.sessionId,
        customer_id: cart.customerId,
        subtotal_amount: cart.subtotalAmount,
        tax_amount: cart.taxAmount,
        total_amount: cart.totalAmount,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        expires_at: cart.expiresAt,
      },
    },
  };
}

export function createMockShoppingCartItemAPIResponse(item: ShoppingCartItem) {
  return {
    data: {
      id: item.id,
      type: 'shopping-cart-items',
      attributes: {
        shopping_cart_id: item.shoppingCartId,
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        product_image: item.productImage,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      },
    },
  };
}

// ============================================
// Test Helpers
// ============================================

export function createMockAxiosClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

export function setupSuccessfulResponse(mockAxios: any, data: any) {
  mockAxios.get.mockResolvedValue({ data });
  mockAxios.post.mockResolvedValue({ data });
  mockAxios.patch.mockResolvedValue({ data });
  mockAxios.delete.mockResolvedValue({});
}

export function setupErrorResponse(mockAxios: any, statusCode: number, message: string) {
  const error = new Error(message);
  (error as any).response = {
    status: statusCode,
    data: {
      errors: [
        {
          status: statusCode.toString(),
          title: message,
        },
      ],
    },
  };

  mockAxios.get.mockRejectedValue(error);
  mockAxios.post.mockRejectedValue(error);
  mockAxios.patch.mockRejectedValue(error);
  mockAxios.delete.mockRejectedValue(error);
}
