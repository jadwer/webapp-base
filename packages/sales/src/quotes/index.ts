/**
 * Quotes Module - SA-M004
 *
 * Complete module for managing quotes (cotizaciones).
 * Allows creating quotes from shopping cart, editing prices,
 * setting ETA, and converting to sales orders.
 */

// Types — `export *` would collide with PaginationMeta defined in
// packages/sales/src/types/index.ts. Re-export everything via wildcard
// EXCEPT PaginationMeta (which is also defined in the parent sales/types).
// The local `QuotePaginationMeta` alias remains accessible.
export * from './types'

// Services
export { quoteService, quoteItemService, quoteServices } from './services'

// Hooks
export {
  quoteKeys,
  useQuotes,
  useQuote,
  useExpiringSoonQuotes,
  useQuoteSummary,
  useQuoteItems,
  useQuoteMutations,
  useQuoteItemMutations
} from './hooks'

// Components
export {
  QuoteStatusBadge,
  QuotesTable,
  QuoteItemsTable,
  QuoteSummaryCards
} from './components'
