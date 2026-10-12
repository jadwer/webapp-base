import type { QuoteItem } from '../types'

/**
 * Cantidad de una partida con la unidad real del producto ("12 Litro").
 * Mismo criterio que el PDF de la cotizacion: nombre de la unidad del
 * producto. Sin unidad conocida se muestra solo el numero; nunca se asume
 * "pz" (un granel en litros no son piezas).
 */
export function formatQuoteItemQuantity(item: Pick<QuoteItem, 'quantity' | 'product'>): string {
  const unit = item.product?.unitName?.trim()
  return unit ? `${item.quantity} ${unit}` : String(item.quantity)
}
