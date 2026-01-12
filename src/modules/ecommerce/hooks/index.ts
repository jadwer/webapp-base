/**
 * Ecommerce Hooks Index
 *
 * Central export point for all ecommerce hooks.
 */

export {
  useEcommerceOrders,
  useEcommerceOrder,
  useEcommerceOrderItems,
  useEcommerceOrderMutations,
  useEcommerceOrderItemMutations,
} from './useEcommerceOrders';

export {
  useCurrentCart,
  useShoppingCart,
  useShoppingCartItems,
  useShoppingCartMutations,
  useShoppingCartItemMutations,
  useCart,
} from './useShoppingCart';

// Wishlist hooks
export {
  useWishlists,
  useWishlist,
  useWishlistItems,
  useWishlistMutations,
  useUserWishlist,
} from './useWishlist';

// Re-export wishlist types
export type {
  Wishlist,
  WishlistItem,
} from './useWishlist';

// Product reviews hooks
export {
  useProductReviews,
  useRatingSummary,
  useProductRecommendations,
  usePersonalizedRecommendations,
  useReviewMutations,
  useProductReviewsWithSummary,
} from './useProductReviews';

// Re-export types
export type {
  ProductReview,
  RatingSummary,
  CreateReviewRequest,
} from './useProductReviews';

// Coupon hooks
export {
  useCoupons,
  useCoupon,
  useCouponValidation,
  useCouponMutations,
  useCartCoupon,
} from './useCoupons';

// Checkout hooks
export {
  useCheckoutSession,
  useCheckoutMutations,
  useCheckoutFlow,
} from './useCheckout';
