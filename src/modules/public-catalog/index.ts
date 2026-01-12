/**
 * PUBLIC CATALOG MODULE
 * Complete module for public product catalog with enterprise-level architecture
 * 
 * Features:
 * - JSON:API 5.x compliant types and services
 * - SWR-powered hooks with intelligent caching
 * - Advanced filtering, sorting, and pagination
 * - Performance-optimized with React.memo patterns
 * - Enterprise error handling and validation
 */

// Export all types
export type {
  // Core entities
  PublicProduct,
  PublicUnit,
  PublicCategory,
  PublicBrand,
  
  // Enhanced types
  EnhancedPublicProduct,
  
  // Filter and query types
  PublicProductFilters,
  PublicProductSortField,
  SortDirection,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  PublicProductsQueryParams,
  
  // API response types
  PublicProductsResponse,
  SinglePublicProductResponse,
  PublicProductError,
  PublicProductErrorResponse,
  
  // UI state types
  ProductViewMode,
  ProductDisplayProps,
  
  // Hook return types
  UsePublicProductsResult,
  UsePublicProductResult,
  
  // Utility types
  FilterOption,
  FilterOptions,
  CatalogConfig,
  CatalogTheme
} from './types'

// Export services
export {
  publicProductsService,
  PublicProductsService
} from './services'

// Export hooks
export {
  usePublicProducts,
  usePublicProduct,
  usePublicProductSearch,
  usePublicProductsByCategory,
  usePublicProductsByBrand,
  useFeaturedProducts,
  useProductsOnOffer,
  useProductSuggestions,
  useProductsByPriceRange,
  // LocalStorage cart hooks
  useLocalCart,
  useLocalCartCount
} from './hooks'

// Export cart types
export type {
  LocalCartItem,
  LocalCart,
  CartTotals
} from './hooks'

// Export components
export {
  PublicProductCard,
  PublicProductsGrid,
  PublicCatalogPagination,
  PublicCatalogTemplate,
  LocalCartPage,
  ProductDetailPage
} from './components'

// Export utility functions if any are created later
// export { } from './utils'