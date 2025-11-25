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
  | 'refunded';

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
  sessionId?: string;
  customerId?: number;
  userId?: number | null;

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
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;

  // Relationships
  items?: ShoppingCartItem[];
  customer?: unknown; // Contact type from contacts module
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
