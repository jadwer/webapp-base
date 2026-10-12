/**
 * P2 granel: lineas de cotizacion con precio por confirmar (producto con
 * "Precio sujeto a cotizacion" y quotedPrice 0).
 *
 * El backend rechaza convertir a pedido o venta (y que el cliente la acepte
 * desde el portal, D9) con 422:
 *   { message, errors: [{ code: 'price_pending', detail, meta: { product_name, product_sku, quote_item_id } }] }
 * Regla 7: se muestra con la lista de productos, nunca como toast generico.
 */
import type { QuoteItem } from '../types'

export interface PricePendingError {
  quoteItemId?: number
  productName: string
  productSku?: string | null
  detail: string
}

interface PendingErrorShape {
  code?: string
  detail?: string
  meta?: { quote_item_id?: number; product_name?: string | null; product_sku?: string | null; product_id?: number }
}

/**
 * P2b (D8): la linea tiene precio por confirmar cuando su precio efectivo
 * (quotedPrice, o unitPrice si no hay cotizado) es <= 0, sin importar el tipo
 * del producto. Manda `pricePending` del backend (QuoteItem::price_pending);
 * si no llego, se deriva igual que el backend.
 */
export function isQuoteItemPricePending(
  item: Pick<QuoteItem, 'pricePending' | 'quotedPrice' | 'unitPrice'>,
): boolean {
  if (typeof item.pricePending === 'boolean') return item.pricePending
  const effective = item.quotedPrice ?? item.unitPrice ?? 0
  const amount = Number(effective)
  return !Number.isFinite(amount) || amount <= 0
}

export function pendingPriceItems(items: QuoteItem[]): QuoteItem[] {
  return items.filter(isQuoteItemPricePending)
}

/** Mensaje del portal cuando una cotizacion no se puede aceptar todavia (D9). */
export const ACCEPT_PRICE_PENDING_MESSAGE =
  'Esta cotización tiene productos con precio por confirmar. Podrás aceptarla cuando el vendedor capture el precio.'

/** Lista del 422 de convert o accept por precio pendiente, o null si el error es otro. */
export function getPricePendingErrors(error: unknown): PricePendingError[] | null {
  const data = (error as { response?: { status?: number; data?: { errors?: unknown } } })?.response?.data
  const errors = data?.errors
  if (!Array.isArray(errors)) return null
  const pending = (errors as PendingErrorShape[]).filter((e) => e?.code === 'price_pending')
  if (pending.length === 0) return null
  return pending.map((e) => ({
    quoteItemId: e.meta?.quote_item_id,
    productName: e.meta?.product_name || (e.meta?.product_id ? `Producto #${e.meta.product_id}` : 'Producto'),
    productSku: e.meta?.product_sku ?? null,
    detail: e.detail || '',
  }))
}
