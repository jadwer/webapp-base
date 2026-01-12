/**
 * PUBLIC CATALOG HOOKS EXPORTS
 * Centralized export for all public catalog hooks
 */

// Export all hooks from usePublicProducts
export {
  usePublicProducts,
  usePublicProduct,
  usePublicProductSearch,
  usePublicProductsByCategory,
  usePublicProductsByBrand,
  useFeaturedProducts,
  useProductsOnOffer,
  useProductSuggestions,
  useProductsByPriceRange
} from './usePublicProducts'

// Export localStorage cart hooks
export {
  useLocalCart,
  useLocalCartCount
} from './useLocalCart'

// Export cart types
export type {
  LocalCartItem,
  LocalCart,
  CartTotals
} from './useLocalCart'

// Re-export types needed for hooks
export type {
  UsePublicProductsResult,
  UsePublicProductResult,
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  EnhancedPublicProduct
} from '../types/publicProduct'