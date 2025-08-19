/**
 * PUBLIC CATALOG COMPONENTS EXPORTS
 * Centralized export for all public catalog components
 */

// Export filter components
export { default as PublicCatalogFilters } from './PublicCatalogFilters'

// Export product display components
export { default as PublicProductCard } from './PublicProductCard'
export { default as PublicProductsGrid } from './PublicProductsGrid'

// Export pagination components
export { default as PublicCatalogPagination } from './PublicCatalogPagination'

// Export complete template
export { default as PublicCatalogTemplate } from './PublicCatalogTemplate'

// Re-export types needed for components
export type {
  PublicProductFilters,
  ProductViewMode,
  ProductDisplayProps,
  EnhancedPublicProduct,
  FilterOption,
  PublicProductsResponse
} from '../types/publicProduct'