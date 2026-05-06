/**
 * PUBLIC CATALOG TYPES EXPORTS
 * Centralized export for all public catalog types
 */

// Re-export all public product types
export type {
  // Core entities
  PublicProduct,
  PublicUnit,
  PublicCategory,
  PublicBrand,
  
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
  PublicCatalogFilters,
  ProductViewMode,
  ProductDisplayProps,
  
  // Enhanced types for components
  EnhancedPublicProduct,
  
  // Hook return types
  UsePublicProductsResult,
  UsePublicProductResult,
  
  // Filter options
  FilterOption,
  FilterOptions
} from './publicProduct'

// Export additional utility types if needed  
export interface CatalogConfig {
  defaultPageSize: number
  defaultSortField: string
  defaultSortDirection: 'asc' | 'desc'
  enabledFilters: string[]
  enabledViewModes: string[]
  defaultViewMode: string
}

export interface CatalogTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  cardBorderRadius: string
  cardShadow: string
}

// Additional exports handled above