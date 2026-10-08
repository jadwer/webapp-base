/**
 * FORMATO DE INVENTARIO
 * Los decimales llegan como string por el cast decimal:4 del backend;
 * todo numero que se muestra o se suma pasa por toNumber.
 */

import { formatCurrency, formatQuantity } from '@lwm/ui'

/** Convierte string/number/null a number. NaN o vacio -> 0 */
export const toNumber = (value: unknown): number => {
  if (value == null || value === '') return 0
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

export interface FormatDateOptions {
  withTime?: boolean
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Fecha en es-MX (07/10/2026, o 07/10/2026, 14:30 con withTime).
 * Una fecha sin hora (YYYY-MM-DD) se interpreta local para no correrse un dia.
 * Vacio o invalido -> '-'.
 */
export const formatDate = (
  value: string | Date | null | undefined,
  options: FormatDateOptions = {},
): string => {
  if (value == null || value === '') return '-'

  let date: Date
  if (value instanceof Date) {
    date = value
  } else {
    const m = DATE_ONLY.exec(value)
    date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
  }
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(options.withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  })
}

/** Cantidad sin decimales sobrantes (acepta el string decimal del backend) */
export const formatQty = (value: unknown): string => formatQuantity(toNumber(value))

/** Importe en la moneda configurada (o la indicada) */
export const formatMoney = (value: unknown, currency?: string): string =>
  formatCurrency(toNumber(value), currency)
