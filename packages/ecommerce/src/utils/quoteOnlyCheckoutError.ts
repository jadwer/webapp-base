/**
 * P2 granel: el backend rechaza el pago (checkout directo, inicio de checkout
 * Stripe o alta de checkout-sessions) cuando el carrito trae productos con
 * precio sujeto a cotizacion. Responde 422 con:
 *   { error, message, quote_only_items: [{product_id, product_name, product_sku}], quote_cta: true }
 * Regla 7: ese error se muestra con detalle (lista de productos), nunca como
 * toast generico.
 */

export interface QuoteOnlyCheckoutItem {
  product_id: number
  product_name?: string | null
  product_sku?: string | null
}

interface ErrorWithResponse {
  response?: { status?: number; data?: Record<string, unknown> }
}

/** Lista de productos sujetos a cotizacion del 422, o null si el error es otro. */
export function getQuoteOnlyCheckoutItems(error: unknown): QuoteOnlyCheckoutItem[] | null {
  if (typeof error !== 'object' || error === null || !('response' in error)) return null
  const data = (error as ErrorWithResponse).response?.data
  const items = data?.quote_only_items
  return Array.isArray(items) && items.length > 0 ? (items as QuoteOnlyCheckoutItem[]) : null
}

/** Mensaje legible con los nombres de los productos. */
export function quoteOnlyCheckoutMessage(items: QuoteOnlyCheckoutItem[]): string {
  const names = items.map((item) => item.product_name || `Producto ${item.product_id}`).join(', ')
  return `Estos productos tienen precio sujeto a cotización y no se pueden pagar en línea: ${names}. Solicita una cotización o quítalos del carrito.`
}
