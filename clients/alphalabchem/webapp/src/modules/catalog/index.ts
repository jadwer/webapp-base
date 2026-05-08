/**
 * CATALOG MODULE
 * Offers and promotions management based on existing products
 * An offer is a product where price > cost
 */

// Types
export type {
  Offer,
  OfferFormData,
  OffersMetrics,
  OffersFilters,
  ProductForOffer
} from './types'
export { productToOffer, productToProductForOffer } from './types'

// Services
export { offersService } from './services'

// Hooks
export {
  useOffers,
  useOffer,
  useProductsForOffer,
  useProductForOffer,
  useOffersMutations,
  useUpdateProductOffer
} from './hooks/useOffers'

// Backward compatibility type exports
export type { OfferProduct } from './hooks/useOffers'

// Components
export * from './components'
