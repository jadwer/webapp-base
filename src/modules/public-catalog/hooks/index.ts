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