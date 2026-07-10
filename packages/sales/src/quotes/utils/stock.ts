/**
 * Quote item stock helpers - Fase A (Venta directa vs Pedido)
 *
 * Extraidos de QuoteItemsTable para reusarse en el semaforo de stock de
 * GenerateSaleModal / GenerateOrderModal. La semantica es la misma que la
 * columna Stock de la tabla: se suma availableQuantity de TODOS los
 * almacenes del producto (item.product.stock, include product.stock).
 */

import type { QuoteItem } from '../types'

/** Total available stock for a quote item across all warehouses. */
export function getTotalAvailableStock(item: QuoteItem): number {
  if (!item.product?.stock || item.product.stock.length === 0) return 0
  return item.product.stock.reduce((sum, s) => sum + (s.availableQuantity || 0), 0)
}

export interface QuoteItemStockStatus {
  available: number
  /** available >= requested quantity */
  sufficient: boolean
  /** hay algo de stock pero no alcanza para la cantidad pedida */
  lowStock: boolean
}

/** Stock status for display (semaforo verde/amarillo/rojo). */
export function getQuoteItemStockStatus(item: QuoteItem): QuoteItemStockStatus {
  const available = getTotalAvailableStock(item)
  return {
    available,
    sufficient: available >= item.quantity,
    lowStock: available > 0 && available < item.quantity
  }
}
