/**
 * Ecommerce Module
 *
 * Complete ecommerce solution with order management and shopping cart functionality.
 * This module provides comprehensive e-commerce capabilities including:
 * - Order management with status tracking
 * - Shopping cart with session support
 * - Payment and shipping status management
 * - Customer order tracking
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

  // Helper functions
  calculateOrderTotals,
  calculateCartTotals,
} from './utils/transformers';
