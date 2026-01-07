/**
 * Ecommerce Module Types
 *
 * Type definitions for the Ecommerce module entities.
 * All types follow JSON:API specification and camelCase naming convention.
 */

// ============================================
// Ecommerce Order Types
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'; // Added from backend

export type ShippingStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'returned';

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  customerId?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;

  // Order status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;

  // Amounts
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;

  // Shipping information
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;

  // Billing information
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;

  // Payment information
  paymentMethodId?: number;
  paymentReference?: string;

  // Metadata
  notes?: string;
  orderDate: string;
  completedDate?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  items?: EcommerceOrderItem[];
  customer?: unknown; // Contact type from contacts module
  paymentMethod?: unknown; // PaymentMethod type from finance module
}

export interface EcommerceOrderFormData {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes?: string;
}

// ============================================
// Ecommerce Order Item Types
// ============================================

export interface EcommerceOrderItem {
  id: string;
  ecommerceOrderId: number;
  productId: number;

  // Product information (snapshot at time of order)
  productName: string;
  productSku?: string;
  productImage?: string;

  // Pricing
  quantity: number;
  unitPrice: number;
  discount: number;
  taxAmount: number;
  totalPrice: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  product?: unknown; // Product type from products module
  ecommerceOrder?: EcommerceOrder;
}

export interface EcommerceOrderItemFormData {
  ecommerceOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxAmount?: number;
}

// ============================================
// Shopping Cart Types
// ============================================

export type CartStatus = 'active' | 'abandoned' | 'converted' | 'expired';

export interface ShoppingCart {
  id: string;
  sessionId: string | null;
  userId: string | null; // Backend uses userId, not customerId
  customerId?: number; // Legacy frontend field

  // Cart status and metadata
  status: CartStatus;
  currency: string;
  couponCode: string | null;

  // Cart amounts
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;

  // Calculated fields (read-only from backend)
  itemsCount: number;
  finalTotal: number;
  isExpired: boolean;
  canApplyCoupon: boolean;

  // Additional metadata
  notes: string | null;
  metadata: Record<string, unknown> | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt: string;

  // Relationships
  items?: CartItem[];
  cartItems?: CartItem[]; // Backend relationship name
  customer?: unknown; // Contact type from contacts module
  user?: unknown;
}

export interface ShoppingCartItem {
  id: string;
  shoppingCartId: number;
  productId: number;

  // Product information
  productName?: string;
  productSku?: string;
  productImage?: string;

  // Pricing
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  product?: unknown; // Product type from products module
  shoppingCart?: ShoppingCart;
}

export interface ShoppingCartItemFormData {
  productId: number;
  quantity: number;
}

// ============================================
// Cart Item (Backend entity name)
// ============================================

export interface CartItem {
  id: string;
  shoppingCartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  // Relationships
  shoppingCart?: ShoppingCart;
  product?: unknown;
}

export interface CartItemFormData {
  shoppingCartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  currency?: string;
}

// ============================================
// Checkout Session Types
// ============================================

export type CheckoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutSession {
  id: string;
  shoppingCartId: number;
  userId: number;
  shippingMethodId: number | null;
  status: CheckoutStatus;
  step: CheckoutStep;

  // Contact information
  contactEmail: string;
  contactPhone: string | null;

  // Addresses (JSON objects)
  billingAddress: Address;
  shippingAddress: Address;

  // Payment
  paymentMethod: string | null;
  paymentIntentId: string | null;

  // Amounts
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;

  notes: string | null;
  metadata: Record<string, unknown> | null;

  expiresAt: string;
  completedAt: string | null;

  // Calculated fields (read-only)
  isExpired: boolean;
  canProceedToPayment: boolean;
  timeRemaining: number; // seconds

  createdAt: string;
  updatedAt: string;

  // Relationships
  shoppingCart?: ShoppingCart;
  user?: unknown;
  shippingMethod?: ShippingMethod;
  inventoryReservations?: InventoryReservation[];
  paymentTransactions?: EcommercePaymentTransaction[];
}

export interface CheckoutSessionFormData {
  shoppingCartId: number;
  userId?: number;
  contactEmail: string;
  contactPhone?: string;
  billingAddress: Address;
  shippingAddress: Address;
  shippingMethodId?: number;
  step?: CheckoutStep;
  status?: CheckoutStatus;
  currency?: string;
}

// ============================================
// Payment Transaction Types (Ecommerce-specific)
// EC-M003: Stripe PaymentIntent Integration
// ============================================

/**
 * Payment transaction status values
 * Matches backend PaymentTransaction::STATUS_* constants
 */
export type PaymentTransactionStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'cancelled'
  | 'failed'
  | 'refunded';

// Legacy alias for backward compatibility
export type EcommercePaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Supported payment gateways
 * EC-M003: Added 'mock' for testing
 */
export type PaymentGateway = 'stripe' | 'mock' | 'paypal' | 'mercadopago' | 'openpay' | 'conekta';

/**
 * Card brands supported by Stripe
 */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';

/**
 * Payment Transaction entity
 * EC-M003: Enhanced with Stripe PaymentIntent fields
 */
export interface EcommercePaymentTransaction {
  id: string;
  checkoutSessionId: number;
  salesOrderId: number | null;
  arInvoiceId: number | null;

  // EC-M003: Stripe PaymentIntent fields
  gateway: PaymentGateway;
  paymentIntentId: string | null;
  transactionId: string;
  clientSecret: string | null;

  // Payment details
  amount: number;
  currency: string;
  status: PaymentTransactionStatus;
  paymentMethod: string;

  // EC-M003: Card information (from Stripe)
  cardBrand: CardBrand | null;
  cardLast4: string | null;

  // Gateway response and error handling
  gatewayResponse: Record<string, unknown> | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;

  // Timestamps
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Calculated fields (read-only)
  isSuccessful: boolean;
  isFailed: boolean;
  isRefunded: boolean;
  canBeRefunded: boolean;
  canBeCaptured: boolean;
  canBeCancelled: boolean;

  // Relationships
  checkoutSession?: CheckoutSession;
  salesOrder?: unknown;
  arInvoice?: unknown;

  // Legacy field mapping
  paymentGateway?: PaymentGateway; // Alias for gateway
}

/**
 * Form data for creating payment transactions
 */
export interface EcommercePaymentTransactionFormData {
  checkoutSessionId: number;
  gateway: PaymentGateway;
  paymentMethod: string;
  amount: number;
  currency: string;
  status?: PaymentTransactionStatus;
  metadata?: Record<string, unknown>;
}

// ============================================
// Stripe PaymentIntent Types
// EC-M003: New types for Stripe integration
// ============================================

/**
 * Stripe PaymentIntent status values
 */
export type StripePaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/**
 * Request to create a PaymentIntent
 */
export interface CreatePaymentIntentRequest {
  checkoutSessionId: number;
  amount: number;
  currency: string;
  paymentMethod?: string;
  captureMethod?: 'automatic' | 'manual';
  metadata?: Record<string, unknown>;
}

/**
 * Response from creating a PaymentIntent
 */
export interface CreatePaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  status: StripePaymentIntentStatus;
  amount: number;
  currency: string;
}

/**
 * Request to confirm a PaymentIntent
 */
export interface ConfirmPaymentIntentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

/**
 * Response from confirming a PaymentIntent
 */
export interface ConfirmPaymentIntentResponse {
  paymentIntentId: string;
  status: StripePaymentIntentStatus;
  requiresAction: boolean;
  nextActionUrl?: string;
}

/**
 * Request to capture a PaymentIntent (for manual capture)
 */
export interface CapturePaymentIntentRequest {
  paymentIntentId: string;
  amountToCapture?: number;
}

/**
 * Request to cancel a PaymentIntent
 */
export interface CancelPaymentIntentRequest {
  paymentIntentId: string;
  cancellationReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
}

/**
 * Request to refund a payment
 */
export interface RefundPaymentRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

/**
 * Response from refund operation
 */
export interface RefundPaymentResponse {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
  amount: number;
  currency: string;
}

/**
 * Stripe webhook event types we handle
 */
export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.refunded';

/**
 * Payment processing result
 */
export interface PaymentProcessingResult {
  success: boolean;
  transaction?: EcommercePaymentTransaction;
  error?: string;
  requiresAction?: boolean;
  clientSecret?: string;
  nextActionUrl?: string;
}

/**
 * Configuration for Stripe Elements
 */
export interface StripeElementsConfig {
  clientSecret: string;
  appearance?: {
    theme: 'stripe' | 'night' | 'flat';
    variables?: Record<string, string>;
  };
  locale?: string;
}

// ============================================
// Wishlist Types
// ============================================

export interface Wishlist {
  id: string;
  userId: number;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relationships
  user?: unknown;
  items?: WishlistItem[];
  products?: unknown[];
}

export interface WishlistFormData {
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
}

export type WishlistItemPriority = 'low' | 'medium' | 'high';

export interface WishlistItem {
  id: string;
  wishlistId: number;
  productId: number;
  quantity: number;
  priority: WishlistItemPriority;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // Relationships
  wishlist?: Wishlist;
  product?: unknown;
}

export interface WishlistItemFormData {
  wishlistId: number;
  productId: number;
  quantity?: number;
  priority?: WishlistItemPriority;
  notes?: string;
}

// ============================================
// Product Review Types
// ============================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ProductReview {
  id: string;
  productId: number;
  userId: number;
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;

  // Relationships
  product?: unknown;
  user?: unknown;
}

export interface ProductReviewFormData {
  productId: number;
  rating: number;
  title: string;
  comment: string;
  status?: ReviewStatus;
}

// ============================================
// Coupon Types
// ============================================

export type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  couponType: CouponType;
  value: number;
  minAmount: number;
  maxAmount: number | null;
  maxUses: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  customerIds: number[];
  productIds: number[];
  categoryIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormData {
  code: string;
  name: string;
  description?: string;
  couponType: CouponType;
  value: number;
  minAmount?: number;
  maxAmount?: number;
  maxUses?: number;
  startsAt: string;
  expiresAt: string;
  isActive?: boolean;
  customerIds?: number[];
  productIds?: number[];
  categoryIds?: number[];
}

// ============================================
// Shipping Method Types
// ============================================

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description: string | null;
  carrier: string;
  baseCost: number;
  costPerKg: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  availableCountries: string[];
  metadata: Record<string, unknown> | null;

  // Calculated field (read-only)
  estimatedDelivery: string;

  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethodFormData {
  name: string;
  code: string;
  description?: string;
  carrier: string;
  baseCost: number;
  costPerKg?: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive?: boolean;
  availableCountries?: string[];
}

// ============================================
// Currency Types
// ============================================

export interface Currency {
  id: string;
  code: string; // ISO 4217 (USD, EUR, GBP, etc.)
  name: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isActive?: boolean;
  isDefault?: boolean;
}

// ============================================
// Inventory Reservation Types
// ============================================

export type ReservationStatus = 'active' | 'released' | 'fulfilled' | 'expired';

export interface InventoryReservation {
  id: string;
  checkoutSessionId: number;
  stockId: number;
  productId: number;
  warehouseId: number;
  quantityReserved: number;
  status: ReservationStatus;
  expiresAt: string;
  releasedAt: string | null;
  fulfilledAt: string | null;
  notes: string | null;

  // Calculated fields (read-only)
  isExpired: boolean;
  isActive: boolean;
  timeRemaining: number;

  createdAt: string;
  updatedAt: string;

  // Relationships
  checkoutSession?: CheckoutSession;
  stock?: unknown;
  product?: unknown;
  warehouse?: unknown;
}

// ============================================
// Product Question & Answer Types
// ============================================

export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface ProductQuestion {
  id: string;
  productId: number;
  userId: number;
  question: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;

  // Relationships
  product?: unknown;
  user?: unknown;
  answers?: ProductAnswer[];
}

export interface ProductQuestionFormData {
  productId: number;
  question: string;
  status?: QuestionStatus;
}

export interface ProductAnswer {
  id: string;
  questionId: number;
  userId: number;
  answer: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Relationships
  question?: ProductQuestion;
  user?: unknown;
}

export interface ProductAnswerFormData {
  questionId: number;
  answer: string;
  isVerified?: boolean;
}

// ============================================
// Product Comparison Types
// ============================================

export interface ProductComparison {
  id: string;
  userId: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relationships
  user?: unknown;
  items?: ProductComparisonItem[];
}

export interface ProductComparisonFormData {
  name: string;
  isPublic?: boolean;
}

export interface ProductComparisonItem {
  id: string;
  comparisonId: number;
  productId: number;
  position: number;
  createdAt: string;
  updatedAt: string;

  // Relationships
  comparison?: ProductComparison;
  product?: unknown;
}

export interface ProductComparisonItemFormData {
  comparisonId: number;
  productId: number;
  position?: number;
}

// ============================================
// API Response Types
// ============================================

export interface EcommerceOrdersResponse {
  data: EcommerceOrder[];
  meta?: {
    total?: number;
    perPage?: number;
    currentPage?: number;
    lastPage?: number;
  };
}

export interface EcommerceOrderResponse {
  data: EcommerceOrder;
}

export interface EcommerceOrderItemsResponse {
  data: EcommerceOrderItem[];
  meta?: {
    total?: number;
  };
}

export interface ShoppingCartResponse {
  data: ShoppingCart;
}

export interface ShoppingCartItemsResponse {
  data: ShoppingCartItem[];
  meta?: {
    total?: number;
  };
}

// ============================================
// Filter and Query Types
// ============================================

export interface EcommerceOrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ShoppingCartFilters {
  sessionId?: string;
  customerId?: number;
}

// ============================================
// Statistics and Analytics Types
// ============================================

export interface EcommerceDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalSpent: number;
}
