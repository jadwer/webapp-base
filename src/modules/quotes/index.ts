/**
 * Quotes Module - SA-M004
 *
 * Complete module for managing quotes (cotizaciones).
 * Allows creating quotes from shopping cart, editing prices,
 * setting ETA, and converting to sales orders.
 */

// Types
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
