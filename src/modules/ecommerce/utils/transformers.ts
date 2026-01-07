/**
 * Ecommerce Module Transformers
 *
 * JSON:API transformers for converting between backend and frontend formats.
 * IMPORTANT: Backend now requires camelCase for request attributes.
 * Response parsing still handles both snake_case and camelCase for backwards compatibility.
 */

import type {
  EcommerceOrder,
  EcommerceOrderItem,
  ShoppingCart,
  ShoppingCartItem,
  EcommercePaymentTransaction,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  CartStatus,
  PaymentTransactionStatus,
  PaymentGateway,
  CardBrand,
} from '../types';

// ============================================
// Ecommerce Order Transformers
// ============================================

/**
 * Transform EcommerceOrder from frontend to backend (camelCase attributes)
 */
export function ecommerceOrderToAPI(order: Partial<EcommerceOrder>): Record<string, unknown> {
  return {
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    shippingStatus: order.shippingStatus,
    subtotalAmount: order.subtotalAmount,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    billingAddressLine1: order.billingAddressLine1,
    billingAddressLine2: order.billingAddressLine2,
    billingCity: order.billingCity,
    billingState: order.billingState,
    billingPostalCode: order.billingPostalCode,
    billingCountry: order.billingCountry,
    paymentMethodId: order.paymentMethodId,
    paymentReference: order.paymentReference,
    notes: order.notes,
    orderDate: order.orderDate,
    completedDate: order.completedDate,
  };
}

/**
 * Transform EcommerceOrder from backend (snake_case) to frontend (camelCase)
 */
export function ecommerceOrderFromAPI(data: Record<string, unknown>): EcommerceOrder {
  const attributes = (data.attributes || data) as Record<string, unknown>;

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    orderNumber: (attributes.order_number as string) || '',
    customerId: attributes.customer_id as number | undefined,
    customerEmail: (attributes.customer_email as string) || '',
    customerName: (attributes.customer_name as string) || '',
    customerPhone: attributes.customer_phone as string | undefined,
    status: ((attributes.status as string) || 'pending') as OrderStatus,
    paymentStatus: ((attributes.payment_status as string) || 'pending') as PaymentStatus,
    shippingStatus: ((attributes.shipping_status as string) || 'pending') as ShippingStatus,
    subtotalAmount: parseFloat(String(attributes.subtotal_amount || 0)),
    taxAmount: parseFloat(String(attributes.tax_amount || 0)),
    shippingAmount: parseFloat(String(attributes.shipping_amount || 0)),
    discountAmount: parseFloat(String(attributes.discount_amount || 0)),
    totalAmount: parseFloat(String(attributes.total_amount || 0)),
    shippingAddressLine1: (attributes.shipping_address_line1 as string) || '',
    shippingAddressLine2: attributes.shipping_address_line2 as string | undefined,
    shippingCity: (attributes.shipping_city as string) || '',
    shippingState: (attributes.shipping_state as string) || '',
    shippingPostalCode: (attributes.shipping_postal_code as string) || '',
    shippingCountry: (attributes.shipping_country as string) || '',
    billingAddressLine1: attributes.billing_address_line1 as string | undefined,
    billingAddressLine2: attributes.billing_address_line2 as string | undefined,
    billingCity: attributes.billing_city as string | undefined,
    billingState: attributes.billing_state as string | undefined,
    billingPostalCode: attributes.billing_postal_code as string | undefined,
    billingCountry: attributes.billing_country as string | undefined,
    paymentMethodId: attributes.payment_method_id as number | undefined,
    paymentReference: attributes.payment_reference as string | undefined,
    notes: attributes.notes as string | undefined,
    orderDate: (attributes.order_date as string) || new Date().toISOString().split('T')[0],
    completedDate: attributes.completed_date as string | undefined,
    createdAt: attributes.created_at as string | undefined,
    updatedAt: attributes.updated_at as string | undefined,
  };
}

// ============================================
// Ecommerce Order Item Transformers
// ============================================

/**
 * Transform EcommerceOrderItem from frontend to backend (camelCase attributes)
 */
export function ecommerceOrderItemToAPI(item: Partial<EcommerceOrderItem>): Record<string, unknown> {
  return {
    ecommerceOrderId: item.ecommerceOrderId,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productImage: item.productImage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    taxAmount: item.taxAmount,
    totalPrice: item.totalPrice,
  };
}

/**
 * Transform EcommerceOrderItem from backend (snake_case) to frontend (camelCase)
 */
export function ecommerceOrderItemFromAPI(data: Record<string, unknown>): EcommerceOrderItem {
  const attributes = (data.attributes || data) as Record<string, unknown>;

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    ecommerceOrderId: attributes.ecommerce_order_id as number,
    productId: attributes.product_id as number,
    productName: (attributes.product_name as string) || '',
    productSku: attributes.product_sku as string | undefined,
    productImage: attributes.product_image as string | undefined,
    quantity: parseInt(String(attributes.quantity || 1)),
    unitPrice: parseFloat(String(attributes.unit_price || 0)),
    discount: parseFloat(String(attributes.discount || 0)),
    taxAmount: parseFloat(String(attributes.tax_amount || 0)),
    totalPrice: parseFloat(String(attributes.total_price || 0)),
    createdAt: attributes.created_at as string | undefined,
    updatedAt: attributes.updated_at as string | undefined,
  };
}

// ============================================
// Shopping Cart Transformers
// ============================================

/**
 * Transform ShoppingCart from frontend to backend (camelCase attributes)
 */
export function shoppingCartToAPI(cart: Partial<ShoppingCart>): Record<string, unknown> {
  return {
    sessionId: cart.sessionId,
    customerId: cart.customerId,
    userId: cart.userId,
    status: cart.status,
    currency: cart.currency,
    couponCode: cart.couponCode,
    subtotalAmount: cart.subtotalAmount,
    taxAmount: cart.taxAmount,
    discountAmount: cart.discountAmount,
    shippingAmount: cart.shippingAmount,
    totalAmount: cart.totalAmount,
    notes: cart.notes,
    metadata: cart.metadata,
    expiresAt: cart.expiresAt,
  };
}

/**
 * Transform ShoppingCart from backend (snake_case) to frontend (camelCase)
 */
export function shoppingCartFromAPI(data: Record<string, unknown>): ShoppingCart {
  const attributes = (data.attributes || data) as Record<string, unknown>;

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    sessionId: (attributes.session_id as string | null) ?? null,
    customerId: attributes.customer_id as number | undefined,
    userId: (attributes.user_id as string | null) ?? null,
    status: ((attributes.status as string) || 'active') as CartStatus,
    currency: (attributes.currency as string) || 'MXN',
    couponCode: (attributes.coupon_code as string | null) ?? null,
    subtotalAmount: parseFloat(String(attributes.subtotal_amount || 0)),
    taxAmount: parseFloat(String(attributes.tax_amount || 0)),
    discountAmount: parseFloat(String(attributes.discount_amount || 0)),
    shippingAmount: parseFloat(String(attributes.shipping_amount || 0)),
    totalAmount: parseFloat(String(attributes.total_amount || 0)),
    itemsCount: parseInt(String(attributes.items_count || 0)),
    finalTotal: parseFloat(String(attributes.final_total || attributes.total_amount || 0)),
    isExpired: (attributes.is_expired as boolean) ?? false,
    canApplyCoupon: (attributes.can_apply_coupon as boolean) ?? true,
    notes: (attributes.notes as string | null) ?? null,
    metadata: (attributes.metadata as Record<string, unknown> | null) ?? null,
    createdAt: (attributes.created_at as string) || '',
    updatedAt: (attributes.updated_at as string) || '',
    expiresAt: (attributes.expires_at as string) || '',
  };
}

// ============================================
// Shopping Cart Item Transformers
// ============================================

/**
 * Transform ShoppingCartItem from frontend to backend (camelCase attributes)
 */
export function shoppingCartItemToAPI(item: Partial<ShoppingCartItem>): Record<string, unknown> {
  return {
    shoppingCartId: item.shoppingCartId,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productImage: item.productImage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  };
}

/**
 * Transform ShoppingCartItem from backend (snake_case) to frontend (camelCase)
 */
export function shoppingCartItemFromAPI(data: Record<string, unknown>): ShoppingCartItem {
  const attributes = (data.attributes || data) as Record<string, unknown>;

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    shoppingCartId: attributes.shopping_cart_id as number,
    productId: attributes.product_id as number,
    productName: attributes.product_name as string | undefined,
    productSku: attributes.product_sku as string | undefined,
    productImage: attributes.product_image as string | undefined,
    quantity: parseInt(String(attributes.quantity || 1)),
    unitPrice: parseFloat(String(attributes.unit_price || 0)),
    totalPrice: parseFloat(String(attributes.total_price || 0)),
    createdAt: attributes.created_at as string | undefined,
    updatedAt: attributes.updated_at as string | undefined,
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

// ============================================
// Payment Transaction Transformers
// EC-M003: Stripe PaymentIntent Integration
// ============================================

/**
 * Transform PaymentTransaction from backend (snake_case) to frontend (camelCase)
 */
export function paymentTransactionFromAPI(data: Record<string, unknown>): EcommercePaymentTransaction {
  const attributes = (data.attributes || data) as Record<string, unknown>;

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    checkoutSessionId: (attributes.checkout_session_id ?? attributes.checkoutSessionId) as number,
    salesOrderId: (attributes.sales_order_id ?? attributes.salesOrderId ?? null) as number | null,
    arInvoiceId: (attributes.ar_invoice_id ?? attributes.arInvoiceId ?? null) as number | null,

    // EC-M003: Stripe PaymentIntent fields
    gateway: ((attributes.gateway as string) || 'stripe') as PaymentGateway,
    paymentIntentId: (attributes.payment_intent_id ?? attributes.paymentIntentId ?? null) as string | null,
    transactionId: (attributes.transaction_id ?? attributes.transactionId ?? '') as string,
    clientSecret: (attributes.client_secret ?? attributes.clientSecret ?? null) as string | null,

    // Payment details
    amount: parseFloat(String(attributes.amount || 0)),
    currency: (attributes.currency as string) || 'MXN',
    status: ((attributes.status as string) || 'pending') as PaymentTransactionStatus,
    paymentMethod: (attributes.payment_method ?? attributes.paymentMethod ?? 'card') as string,

    // EC-M003: Card information
    cardBrand: (attributes.card_brand ?? attributes.cardBrand ?? null) as CardBrand | null,
    cardLast4: (attributes.card_last4 ?? attributes.cardLast4 ?? null) as string | null,

    // Gateway response and error handling
    gatewayResponse: (attributes.gateway_response ?? attributes.gatewayResponse ?? null) as Record<string, unknown> | null,
    errorMessage: (attributes.error_message ?? attributes.errorMessage ?? null) as string | null,
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,

    // Timestamps
    processedAt: (attributes.processed_at ?? attributes.processedAt ?? null) as string | null,
    createdAt: (attributes.created_at ?? attributes.createdAt ?? '') as string,
    updatedAt: (attributes.updated_at ?? attributes.updatedAt ?? '') as string,

    // Calculated fields
    isSuccessful: (attributes.is_successful ?? attributes.isSuccessful ?? false) as boolean,
    isFailed: (attributes.is_failed ?? attributes.isFailed ?? false) as boolean,
    isRefunded: (attributes.is_refunded ?? attributes.isRefunded ?? false) as boolean,
    canBeRefunded: (attributes.can_be_refunded ?? attributes.canBeRefunded ?? false) as boolean,
    canBeCaptured: (attributes.can_be_captured ?? attributes.canBeCaptured ?? false) as boolean,
    canBeCancelled: (attributes.can_be_cancelled ?? attributes.canBeCancelled ?? false) as boolean,

    // Legacy alias
    paymentGateway: ((attributes.gateway as string) || 'stripe') as PaymentGateway,
  };
}

/**
 * Transform PaymentTransaction from frontend to backend (camelCase attributes)
 */
export function paymentTransactionToAPI(transaction: Partial<EcommercePaymentTransaction>): Record<string, unknown> {
  return {
    checkoutSessionId: transaction.checkoutSessionId,
    salesOrderId: transaction.salesOrderId,
    arInvoiceId: transaction.arInvoiceId,
    gateway: transaction.gateway,
    paymentIntentId: transaction.paymentIntentId,
    transactionId: transaction.transactionId,
    clientSecret: transaction.clientSecret,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    paymentMethod: transaction.paymentMethod,
    cardBrand: transaction.cardBrand,
    cardLast4: transaction.cardLast4,
    gatewayResponse: transaction.gatewayResponse,
    errorMessage: transaction.errorMessage,
    metadata: transaction.metadata,
  };
}

// ============================================
// Stripe PaymentIntent Helpers
// EC-M003: Payment processing utilities
// ============================================

/**
 * Format currency amount for display (in MXN)
 */
export function formatPaymentAmount(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert amount to Stripe's smallest currency unit (centavos for MXN)
 * Stripe requires amounts in the smallest unit (e.g., cents for USD, centavos for MXN)
 */
export function amountToStripeUnits(amount: number, currency: string = 'MXN'): number {
  // Most currencies use 2 decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND'];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

/**
 * Convert Stripe's smallest currency unit back to decimal amount
 */
export function stripeUnitsToAmount(stripeAmount: number, currency: string = 'MXN'): number {
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND'];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return stripeAmount;
  }

  return stripeAmount / 100;
}

/**
 * Get human-readable label for payment transaction status
 */
export function getPaymentStatusLabel(status: PaymentTransactionStatus): string {
  const labels: Record<PaymentTransactionStatus, string> = {
    pending: 'Pendiente',
    authorized: 'Autorizado',
    captured: 'Capturado',
    cancelled: 'Cancelado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };

  return labels[status] || status;
}

/**
 * Get CSS class for payment status badge
 */
export function getPaymentStatusBadgeClass(status: PaymentTransactionStatus): string {
  const classes: Record<PaymentTransactionStatus, string> = {
    pending: 'bg-warning text-dark',
    authorized: 'bg-info text-white',
    captured: 'bg-success text-white',
    cancelled: 'bg-secondary text-white',
    failed: 'bg-danger text-white',
    refunded: 'bg-purple text-white',
  };

  return classes[status] || 'bg-secondary';
}

/**
 * Get card brand display name and icon
 */
export function getCardBrandInfo(brand: CardBrand | null): { name: string; icon: string } {
  const brandInfo: Record<CardBrand, { name: string; icon: string }> = {
    visa: { name: 'Visa', icon: 'bi-credit-card-2-front' },
    mastercard: { name: 'Mastercard', icon: 'bi-credit-card-2-front' },
    amex: { name: 'American Express', icon: 'bi-credit-card-2-front' },
    discover: { name: 'Discover', icon: 'bi-credit-card-2-front' },
    diners: { name: 'Diners Club', icon: 'bi-credit-card-2-front' },
    jcb: { name: 'JCB', icon: 'bi-credit-card-2-front' },
    unionpay: { name: 'UnionPay', icon: 'bi-credit-card-2-front' },
    unknown: { name: 'Tarjeta', icon: 'bi-credit-card' },
  };

  return brandInfo[brand || 'unknown'] || brandInfo.unknown;
}

/**
 * Format card display (e.g., "Visa ****1234")
 */
export function formatCardDisplay(brand: CardBrand | null, last4: string | null): string {
  const brandInfo = getCardBrandInfo(brand);
  const maskedNumber = last4 ? `****${last4}` : '****';

  return `${brandInfo.name} ${maskedNumber}`;
}
