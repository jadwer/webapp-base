/**
 * Ecommerce Module
 *
 * Complete ecommerce solution with order management and shopping cart functionality.
 * This module provides comprehensive e-commerce capabilities including:
 * - Order management with status tracking
 * - Shopping cart with session support
 * - Payment and shipping status management
 * - Customer order tracking
 * - EC-M003: Stripe PaymentIntent integration
 *
 * @module ecommerce
 */

// ============================================
// Types
// ============================================

export type {
  // Order types
  EcommerceOrder,
  EcommerceOrderFormData,
  EcommerceOrderItem,
  EcommerceOrderItemFormData,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,

  // Cart types
  ShoppingCart,
  ShoppingCartItem,
  ShoppingCartItemFormData,

  // EC-M003: Payment Transaction types
  EcommercePaymentTransaction,
  EcommercePaymentTransactionFormData,
  PaymentTransactionStatus,
  PaymentGateway,
  CardBrand,

  // EC-M003: Stripe PaymentIntent types
  StripePaymentIntentStatus,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ConfirmPaymentIntentRequest,
  ConfirmPaymentIntentResponse,
  CapturePaymentIntentRequest,
  CancelPaymentIntentRequest,
  RefundPaymentRequest,
  RefundPaymentResponse,
  StripeWebhookEventType,
  PaymentProcessingResult,
  StripeElementsConfig,

  // Response types
  EcommerceOrdersResponse,
  EcommerceOrderResponse,
  EcommerceOrderItemsResponse,
  ShoppingCartResponse,
  ShoppingCartItemsResponse,

  // Filter types
  EcommerceOrderFilters,
  ShoppingCartFilters,

  // Analytics types
  EcommerceDashboardStats,
  TopProduct,
  TopCustomer,
} from './types';

// ============================================
// Services
// ============================================

export { ecommerceService } from './services/ecommerceService';
export { shoppingCartService } from './services/cartService';
export { paymentService } from './services/paymentService';
export { productViewService } from './services/productViewService';
export type { RecentProduct } from './services/productViewService';

// ============================================
// Hooks
// ============================================

export {
  // Order hooks
  useEcommerceOrders,
  useEcommerceOrder,
  useEcommerceOrderItems,
  useEcommerceOrderMutations,
  useEcommerceOrderItemMutations,

  // Cart hooks
  useCurrentCart,
  useShoppingCart,
  useShoppingCartItems,
  useShoppingCartMutations,
  useShoppingCartItemMutations,
  useCart, // Comprehensive cart hook

  // Product view hooks
  useRecentlyViewed,
  useTrackProductView,
} from './hooks';

// ============================================
// Utils
// ============================================

export {
  // Order transformers
  ecommerceOrderFromAPI,
  ecommerceOrderToAPI,
  ecommerceOrderItemFromAPI,
  ecommerceOrderItemToAPI,

  // Cart transformers
  shoppingCartFromAPI,
  shoppingCartToAPI,
  shoppingCartItemFromAPI,
  shoppingCartItemToAPI,

  // EC-M003: Payment transformers
  paymentTransactionFromAPI,
  paymentTransactionToAPI,

  // Helper functions
  calculateOrderTotals,
  calculateCartTotals,

  // EC-M003: Payment helpers
  formatPaymentAmount,
  amountToStripeUnits,
  stripeUnitsToAmount,
  getPaymentStatusLabel,
  getPaymentStatusBadgeClass,
  getCardBrandInfo,
  formatCardDisplay,
} from './utils/transformers';

// ============================================
// Components
// ============================================

export {
  // Admin components
  OrdersAdminPage,
  OrdersTable,
  OrderFilters,
  OrderStatusBadge,
  PaginationSimple,
  OrderViewTabs,
  // Public components
  CartPage,
  CheckoutPage,
  // Customer portal components
  CustomerDashboard,
  CustomerSidebar,
} from './components';
