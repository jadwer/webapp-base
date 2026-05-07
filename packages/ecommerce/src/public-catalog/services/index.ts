/**
 * PUBLIC CATALOG SERVICES EXPORTS
 * Centralized export for all public catalog services
 */

// Export the main service
export { publicProductsService, default as PublicProductsService } from './publicProductsService'

// Export types needed for services
export type {
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  EnhancedPublicProduct
} from '../types/publicProduct'