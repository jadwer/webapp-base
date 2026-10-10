/**
 * P2 granel: linea del carrito local sin precio de lista (producto con
 * "Precio sujeto a cotizacion"). Vive aparte del hook para que las pieles y
 * los tests que mockean useLocalCart la sigan usando.
 */
export function isPendingPriceItem(item: { pricingType?: string | null }): boolean {
  return item.pricingType === 'quote_only'
}
