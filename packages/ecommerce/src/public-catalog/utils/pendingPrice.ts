import { requiresQuote } from '@lwm/products/pricing'

/**
 * P2 granel / P2b (D8): linea del carrito local sin precio de venta (producto
 * con "Precio sujeto a cotizacion", sin precio o con precio <= 0). Vive aparte
 * del hook para que las pieles y los tests que mockean useLocalCart la sigan
 * usando. Un carrito viejo pudo guardar un producto sin precio como fixed con
 * price 0: tambien cuenta como pendiente.
 */
export function isPendingPriceItem(item: { pricingType?: string | null; price?: number | null }): boolean {
  return requiresQuote(item)
}
