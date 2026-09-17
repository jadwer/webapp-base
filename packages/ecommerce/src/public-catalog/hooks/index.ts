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
  useSaleProducts,
  useProductSuggestions,
  useProductsByPriceRange
} from './usePublicProducts'

// Export debounced typeahead search hook
export { useProductSearch } from './useProductSearch'
export { usePublicCategories } from './usePublicCategories'
export type { PublicCategory, PublicCategorySummary } from './usePublicCategories'
export type {
  ProductSearchResult,
  UseProductSearchResult
} from './useProductSearch'

// Export localStorage cart hooks + legacy migration helpers
export {
  useLocalCart,
  useLocalCartCount,
  LEGACY_CART_KEYS,
  migrateLegacyCartStorage
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

export { usePublicCatalogController } from './usePublicCatalogController'
export type { PublicCatalogController, PublicCatalogControllerOptions } from './usePublicCatalogController'
export { catalogInitialQuery, CATALOG_PRODUCTS_INCLUDE } from '../services/catalogQuery'
export type { CatalogInitialQueryOptions, CatalogQuery } from '../services/catalogQuery'
export { createProductsKey, createProductKey } from './usePublicProducts'
export { useLocalCartPageController } from './useLocalCartPageController'
export type { LocalCartPageController, LocalCartPageControllerOptions } from './useLocalCartPageController'
