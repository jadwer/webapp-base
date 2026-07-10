/**
 * CSV export helpers - Fase A (menu Operaciones)
 *
 * Exportacion client-side de partidas (items) de cotizaciones y ordenes de
 * venta. No pega al backend: arma el CSV desde los items ya cargados y
 * dispara la descarga en el navegador.
 */

import type { QuoteItem } from '../quotes/types'
import type { SalesOrderItem } from '../types'

export type CsvCell = string | number | null | undefined

/** Escapa una celda CSV (comillas dobladas, envuelve si hay separadores). */
function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Construye el contenido CSV (sin BOM) a partir de headers y filas. */
export function buildCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(','))
  }
  return lines.join('\r\n')
}

/** Dispara la descarga de un CSV en el navegador (con BOM para Excel). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/** CSV de partidas de una cotizacion. */
export function quoteItemsCsv(items: QuoteItem[]): string {
  const headers = [
    'SKU',
    'Producto',
    'Cantidad',
    'Precio original',
    'Precio cotizado',
    'Descuento %',
    'Descuento $',
    'IVA %',
    'IVA $',
    'Total',
    'Notas'
  ]
  const rows = items.map((item) => [
    item.productSku,
    item.productName || `Producto #${item.productId}`,
    item.quantity,
    item.unitPrice,
    item.quotedPrice,
    item.discountPercentage,
    item.discountAmount,
    item.taxRate,
    item.taxAmount,
    item.total,
    item.notes
  ])
  return buildCsv(headers, rows)
}

/** Descarga las partidas de una cotizacion como CSV. */
export function exportQuoteItemsCsv(quoteNumber: string, items: QuoteItem[]): void {
  downloadCsv(`cotizacion-${quoteNumber}-partidas.csv`, quoteItemsCsv(items))
}

/** CSV de partidas de una orden de venta. */
export function salesOrderItemsCsv(items: SalesOrderItem[]): string {
  const headers = ['SKU', 'Producto', 'Cantidad', 'Precio unitario', 'Descuento', 'Total']
  const rows = items.map((item) => {
    const product = item.product as { name?: string; sku?: string } | undefined
    return [
      product?.sku,
      product?.name || `Producto #${item.productId}`,
      item.quantity,
      item.unitPrice,
      item.discount,
      item.total
    ]
  })
  return buildCsv(headers, rows)
}

/** Descarga las partidas de una orden de venta como CSV. */
export function exportSalesOrderItemsCsv(orderNumber: string, items: SalesOrderItem[]): void {
  downloadCsv(`orden-${orderNumber}-partidas.csv`, salesOrderItemsCsv(items))
}
