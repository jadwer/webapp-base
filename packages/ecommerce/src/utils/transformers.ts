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
import { todayDateInput } from '@lwm/ui'

// ============================================
// Ecommerce Order Transformers
// ============================================

/**
 * Atributos escribibles de sales-orders que el backend valida.
 * Fuente: api-base Modules/Sales/app/JsonApi/V1/SalesOrders/SalesOrderSchema.php (fields)
 * y SalesOrderRequest.php (rules). No se mandan paymentStatus (readOnly), shippingStatus
 * (no existe), datos del cliente (viven en el contacto) ni direcciones planas: las
 * direcciones van en los hashes shippingAddress/billingAddress con las llaves que guarda
 * el checkout (line1, line2, city, state, postal_code, country).
 * status solo en creacion: en update es readOnlyOnUpdate y las transiciones van por
 * POST /api/v1/orders/{id}/status.
 */
export function ecommerceOrderToAPI(
  order: Partial<EcommerceOrder>,
  mode: 'create' | 'update' = 'update'
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {
    contactId: order.customerId,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    discountTotal: order.discountAmount,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    notes: order.notes,
  };

  if (mode === 'create') {
    attributes.status = order.status;
  }

  const shipping = addressHash(
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry
  );
  if (shipping) attributes.shippingAddress = { ...(order.shippingAddressData ?? {}), ...shipping };

  const billing = addressHash(
    order.billingAddressLine1,
    order.billingAddressLine2,
    order.billingCity,
    order.billingState,
    order.billingPostalCode,
    order.billingCountry
  );
  if (billing) attributes.billingAddress = billing;

  return Object.fromEntries(Object.entries(attributes).filter(([, value]) => value !== undefined));
}

function addressHash(
  line1?: string,
  line2?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string
): Record<string, string | null> | null {
  const values = [line1, line2, city, state, postalCode, country];
  if (values.every(value => value === undefined)) return null;
  return {
    line1: line1 ?? null,
    line2: line2 ?? null,
    city: city ?? null,
    state: state ?? null,
    postal_code: postalCode ?? null,
    country: country ?? null,
  };
}

function readAddress(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/**
 * Transform EcommerceOrder from backend (snake_case) to frontend (camelCase)
 */
export function ecommerceOrderFromAPI(data: Record<string, unknown>): EcommerceOrder {
  const attributes = (data.attributes || data) as Record<string, unknown>;
  const shipping = readAddress(attributes.shippingAddress ?? attributes.shipping_address);
  const billing = readAddress(attributes.billingAddress ?? attributes.billing_address);

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    orderNumber: (attributes.orderNumber ?? attributes.order_number ?? '') as string,
    customerId: (attributes.contactId ?? attributes.contact_id ?? attributes.customerId ?? attributes.customer_id) as number | undefined,
    customerEmail: (attributes.customerEmail ?? attributes.customer_email ?? '') as string,
    customerName: (attributes.customerName ?? attributes.customer_name ?? '') as string,
    customerPhone: (attributes.customerPhone ?? attributes.customer_phone) as string | undefined,
    status: ((attributes.status as string) || 'pending') as OrderStatus,
    paymentStatus: ((attributes.paymentStatus ?? attributes.payment_status ?? 'pending') as string) as PaymentStatus,
    shippingStatus: ((attributes.shippingStatus ?? attributes.shipping_status ?? 'pending') as string) as ShippingStatus,
    subtotalAmount: parseFloat(String(attributes.subtotalAmount ?? attributes.subtotal_amount ?? 0)),
    taxAmount: parseFloat(String(attributes.taxAmount ?? attributes.tax_amount ?? 0)),
    shippingAmount: parseFloat(String(attributes.shippingAmount ?? attributes.shipping_amount ?? 0)),
    discountAmount: parseFloat(String(attributes.discountTotal ?? attributes.discountAmount ?? attributes.discount_amount ?? 0)),
    totalAmount: parseFloat(String(attributes.totalAmount ?? attributes.total_amount ?? 0)),
    shippingAddressLine1: (shipping.line1 ?? attributes.shippingAddressLine1 ?? attributes.shipping_address_line1 ?? '') as string,
    shippingAddressLine2: (shipping.line2 ?? attributes.shippingAddressLine2 ?? attributes.shipping_address_line2 ?? undefined) as string | undefined,
    shippingCity: (shipping.city ?? attributes.shippingCity ?? attributes.shipping_city ?? '') as string,
    shippingState: (shipping.state ?? attributes.shippingState ?? attributes.shipping_state ?? '') as string,
    shippingPostalCode: (shipping.postal_code ?? attributes.shippingPostalCode ?? attributes.shipping_postal_code ?? '') as string,
    shippingCountry: (shipping.country ?? attributes.shippingCountry ?? attributes.shipping_country ?? '') as string,
    shippingAddressData: Object.keys(shipping).length > 0 ? shipping : undefined,
    billingAddressLine1: (billing.line1 ?? attributes.billingAddressLine1 ?? attributes.billing_address_line1 ?? undefined) as string | undefined,
    billingAddressLine2: (billing.line2 ?? attributes.billingAddressLine2 ?? attributes.billing_address_line2 ?? undefined) as string | undefined,
    billingCity: (billing.city ?? attributes.billingCity ?? attributes.billing_city ?? undefined) as string | undefined,
    billingState: (billing.state ?? attributes.billingState ?? attributes.billing_state ?? undefined) as string | undefined,
    billingPostalCode: (billing.postal_code ?? attributes.billingPostalCode ?? attributes.billing_postal_code ?? undefined) as string | undefined,
    billingCountry: (billing.country ?? attributes.billingCountry ?? attributes.billing_country ?? undefined) as string | undefined,
    paymentMethodId: (attributes.paymentMethodId ?? attributes.payment_method_id) as number | undefined,
    paymentReference: (attributes.paymentReference ?? attributes.payment_reference) as string | undefined,
    notes: attributes.notes as string | undefined,
    orderDate: (attributes.orderDate ?? attributes.order_date ?? todayDateInput()) as string,
    completedDate: (attributes.completedDate ?? attributes.completed_date) as string | undefined,
    createdAt: (attributes.createdAt ?? attributes.created_at) as string | undefined,
    updatedAt: (attributes.updatedAt ?? attributes.updated_at) as string | undefined,
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

  const subtotalAmount = parseFloat(String(attributes.subtotalAmount ?? attributes.subtotal_amount ?? 0));
  const finalTotal = parseFloat(String(attributes.finalTotal ?? attributes.final_total ?? 0));
  const rawTaxAmount = parseFloat(String(attributes.computedTaxAmount ?? attributes.taxAmount ?? attributes.tax_amount ?? 0));
  // Backend stores taxAmount=0 in DB but computes finalTotal=subtotal+tax.
  // Derive tax from the difference when rawTaxAmount is 0.
  const taxAmount = rawTaxAmount || (finalTotal > subtotalAmount ? parseFloat((finalTotal - subtotalAmount).toFixed(2)) : 0);

  return {
    id: (data.id as string | number | undefined)?.toString() || (attributes.id as string | number | undefined)?.toString() || '',
    sessionId: (attributes.sessionId ?? attributes.session_id ?? null) as string | null,
    customerId: (attributes.contactId ?? attributes.contact_id ?? attributes.customerId ?? attributes.customer_id) as number | undefined,
    userId: (attributes.userId ?? attributes.user_id ?? null) as string | null,
    status: ((attributes.status as string) || 'active') as CartStatus,
    currency: (attributes.currency as string) || 'MXN',
    couponCode: (attributes.couponCode ?? attributes.coupon_code ?? null) as string | null,
    subtotalAmount,
    taxAmount,
    discountAmount: parseFloat(String(attributes.discountTotal ?? attributes.discountAmount ?? attributes.discount_amount ?? 0)),
    shippingAmount: parseFloat(String(attributes.shippingAmount ?? attributes.shipping_amount ?? 0)),
    totalAmount: parseFloat(String(attributes.totalAmount ?? attributes.total_amount ?? 0)) || finalTotal,
    itemsCount: parseInt(String(attributes.itemsCount ?? attributes.items_count ?? 0)),
    finalTotal: finalTotal || parseFloat(String(attributes.totalAmount ?? attributes.total_amount ?? 0)),
    isExpired: (attributes.isExpired ?? attributes.is_expired ?? false) as boolean,
    canApplyCoupon: (attributes.canApplyCoupon ?? attributes.can_apply_coupon ?? true) as boolean,
    notes: (attributes.notes as string | null) ?? null,
    metadata: (attributes.metadata as Record<string, unknown> | null) ?? null,
    createdAt: (attributes.createdAt ?? attributes.created_at ?? '') as string,
    updatedAt: (attributes.updatedAt ?? attributes.updated_at ?? '') as string,
    expiresAt: (attributes.expiresAt ?? attributes.expires_at ?? '') as string,
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
    shoppingCartId: (attributes.shoppingCartId ?? attributes.shopping_cart_id) as number,
    productId: (attributes.productId ?? attributes.product_id) as number,
    productName: (attributes.productName ?? attributes.product_name) as string | undefined,
    productSku: (attributes.productSku ?? attributes.product_sku) as string | undefined,
    productImage: (attributes.productImage ?? attributes.product_image) as string | undefined,
    quantity: parseInt(String(attributes.quantity || 1)),
    unitPrice: parseFloat(String(attributes.unitPrice ?? attributes.unit_price ?? 0)),
    totalPrice: parseFloat(String(attributes.total ?? attributes.totalPrice ?? attributes.total_price ?? 0)),
    originalCurrencyCode: (attributes.originalCurrencyCode ?? attributes.original_currency_code ?? null) as string | null,
    originalUnitPrice: attributes.originalUnitPrice != null || attributes.original_unit_price != null
      ? parseFloat(String(attributes.originalUnitPrice ?? attributes.original_unit_price))
      : null,
    exchangeRateUsed: attributes.exchangeRateUsed != null || attributes.exchange_rate_used != null
      ? parseFloat(String(attributes.exchangeRateUsed ?? attributes.exchange_rate_used))
      : null,
    createdAt: (attributes.createdAt ?? attributes.created_at) as string | undefined,
    updatedAt: (attributes.updatedAt ?? attributes.updated_at) as string | undefined,
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
