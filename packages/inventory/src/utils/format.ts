/**
 * FORMATO DE INVENTARIO
 * Los decimales llegan como string por el cast decimal:4 del backend;
 * todo numero que se muestra o se suma pasa por toNumber.
 */

import { formatCurrency, formatQuantity, formatDateOnly, formatDateTime, parseDateOnly } from '@lwm/ui'

/** Convierte string/number/null a number. NaN o vacio -> 0 */
export const toNumber = (value: unknown): number => {
  if (value == null || value === '') return 0
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

export interface FormatDateOptions {
  withTime?: boolean
}

/**
 * Fecha en es-MX (07/10/2026, o 07/10/2026, 14:30 con withTime).
 * Sin withTime es fecha sin hora: Y-m-d o ISO medianoche muestran el dia
 * guardado (formatDateOnly de @lwm/ui). Con withTime es timestamp local.
 * Vacio o invalido -> '-'.
 */
export const formatDate = (
  value: string | Date | null | undefined,
  options: FormatDateOptions = {},
): string => {
  if (value == null || value === '') return '-'
  if (options.withTime) return formatDateTime(value)
  return parseDateOnly(value) ? formatDateOnly(value) : '-'
}

/** Cantidad sin decimales sobrantes (acepta el string decimal del backend) */
export const formatQty = (value: unknown): string => formatQuantity(toNumber(value))

/** Importe en la moneda configurada (o la indicada) */
export const formatMoney = (value: unknown, currency?: string): string =>
  formatCurrency(toNumber(value), currency)
