/**
 * Ecommerce Module Transformers
 *
 * JSON:API transformers for converting between backend (snake_case) and frontend (camelCase) formats.
 * Handles proper data transformation and relationship resolution.
 */

import type {
  EcommerceOrder,
  EcommerceOrderItem,
  ShoppingCart,
  ShoppingCartItem,
} from '../types';

// ============================================
// Ecommerce Order Transformers
// ============================================

/**
 * Transform EcommerceOrder from frontend (camelCase) to backend (snake_case)
 */
export function ecommerceOrderToAPI(order: Partial<EcommerceOrder>): Record<string, any> {
  return {
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
  };
}

/**
 * Transform EcommerceOrder from backend (snake_case) to frontend (camelCase)
 */
export function ecommerceOrderFromAPI(data: any): EcommerceOrder {
  const attributes = data.attributes || data;

  return {
    id: data.id?.toString() || attributes.id?.toString(),
    orderNumber: attributes.order_number || '',
    customerId: attributes.customer_id,
    customerEmail: attributes.customer_email || '',
    customerName: attributes.customer_name || '',
    customerPhone: attributes.customer_phone,
    status: attributes.status || 'pending',
    paymentStatus: attributes.payment_status || 'pending',
    shippingStatus: attributes.shipping_status || 'pending',
    subtotalAmount: parseFloat(attributes.subtotal_amount || 0),
    taxAmount: parseFloat(attributes.tax_amount || 0),
    shippingAmount: parseFloat(attributes.shipping_amount || 0),
    discountAmount: parseFloat(attributes.discount_amount || 0),
    totalAmount: parseFloat(attributes.total_amount || 0),
    shippingAddressLine1: attributes.shipping_address_line1 || '',
    shippingAddressLine2: attributes.shipping_address_line2,
    shippingCity: attributes.shipping_city || '',
    shippingState: attributes.shipping_state || '',
    shippingPostalCode: attributes.shipping_postal_code || '',
    shippingCountry: attributes.shipping_country || '',
    billingAddressLine1: attributes.billing_address_line1,
    billingAddressLine2: attributes.billing_address_line2,
    billingCity: attributes.billing_city,
    billingState: attributes.billing_state,
    billingPostalCode: attributes.billing_postal_code,
    billingCountry: attributes.billing_country,
    paymentMethodId: attributes.payment_method_id,
    paymentReference: attributes.payment_reference,
    notes: attributes.notes,
    orderDate: attributes.order_date || new Date().toISOString().split('T')[0],
    completedDate: attributes.completed_date,
    createdAt: attributes.created_at,
    updatedAt: attributes.updated_at,
  };
}

// ============================================
// Ecommerce Order Item Transformers
// ============================================

/**
 * Transform EcommerceOrderItem from frontend (camelCase) to backend (snake_case)
 */
export function ecommerceOrderItemToAPI(item: Partial<EcommerceOrderItem>): Record<string, any> {
  return {
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
  };
}

/**
 * Transform EcommerceOrderItem from backend (snake_case) to frontend (camelCase)
 */
export function ecommerceOrderItemFromAPI(data: any): EcommerceOrderItem {
  const attributes = data.attributes || data;

  return {
    id: data.id?.toString() || attributes.id?.toString(),
    ecommerceOrderId: attributes.ecommerce_order_id,
    productId: attributes.product_id,
    productName: attributes.product_name || '',
    productSku: attributes.product_sku,
    productImage: attributes.product_image,
    quantity: parseInt(attributes.quantity || 1),
    unitPrice: parseFloat(attributes.unit_price || 0),
    discount: parseFloat(attributes.discount || 0),
    taxAmount: parseFloat(attributes.tax_amount || 0),
    totalPrice: parseFloat(attributes.total_price || 0),
    createdAt: attributes.created_at,
    updatedAt: attributes.updated_at,
  };
}

// ============================================
// Shopping Cart Transformers
// ============================================

/**
 * Transform ShoppingCart from frontend (camelCase) to backend (snake_case)
 */
export function shoppingCartToAPI(cart: Partial<ShoppingCart>): Record<string, any> {
  return {
    session_id: cart.sessionId,
    customer_id: cart.customerId,
    subtotal_amount: cart.subtotalAmount,
    tax_amount: cart.taxAmount,
    total_amount: cart.totalAmount,
    expires_at: cart.expiresAt,
  };
}

/**
 * Transform ShoppingCart from backend (snake_case) to frontend (camelCase)
 */
export function shoppingCartFromAPI(data: any): ShoppingCart {
  const attributes = data.attributes || data;

  return {
    id: data.id?.toString() || attributes.id?.toString(),
    sessionId: attributes.session_id,
    customerId: attributes.customer_id,
    subtotalAmount: parseFloat(attributes.subtotal_amount || 0),
    taxAmount: parseFloat(attributes.tax_amount || 0),
    totalAmount: parseFloat(attributes.total_amount || 0),
    createdAt: attributes.created_at,
    updatedAt: attributes.updated_at,
    expiresAt: attributes.expires_at,
  };
}

// ============================================
// Shopping Cart Item Transformers
// ============================================

/**
 * Transform ShoppingCartItem from frontend (camelCase) to backend (snake_case)
 */
export function shoppingCartItemToAPI(item: Partial<ShoppingCartItem>): Record<string, any> {
  return {
    shopping_cart_id: item.shoppingCartId,
    product_id: item.productId,
    product_name: item.productName,
    product_sku: item.productSku,
    product_image: item.productImage,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  };
}

/**
 * Transform ShoppingCartItem from backend (snake_case) to frontend (camelCase)
 */
export function shoppingCartItemFromAPI(data: any): ShoppingCartItem {
  const attributes = data.attributes || data;

  return {
    id: data.id?.toString() || attributes.id?.toString(),
    shoppingCartId: attributes.shopping_cart_id,
    productId: attributes.product_id,
    productName: attributes.product_name,
    productSku: attributes.product_sku,
    productImage: attributes.product_image,
    quantity: parseInt(attributes.quantity || 1),
    unitPrice: parseFloat(attributes.unit_price || 0),
    totalPrice: parseFloat(attributes.total_price || 0),
    createdAt: attributes.created_at,
    updatedAt: attributes.updated_at,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate order totals based on items
 */
export function calculateOrderTotals(items: EcommerceOrderItem[], shippingAmount: number = 0): {
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
} {
  const subtotalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalAmount = subtotalAmount + taxAmount + shippingAmount;

  return {
    subtotalAmount: parseFloat(subtotalAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
}

/**
 * Calculate cart totals based on items
 */
export function calculateCartTotals(items: ShoppingCartItem[], taxRate: number = 0.16): {
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
} {
  const subtotalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotalAmount * taxRate;
  const totalAmount = subtotalAmount + taxAmount;

  return {
    subtotalAmount: parseFloat(subtotalAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
}
