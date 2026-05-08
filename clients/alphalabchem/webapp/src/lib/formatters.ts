// Compatibility shim. Formatters now live in @lwm/ui.
// Existing imports `from '@/lib/formatters'` keep working through this re-export.
export {
  formatCurrency,
  formatQuantity,
  getCurrentCurrency,
  getCurrentLocale,
} from '@lwm/ui'
