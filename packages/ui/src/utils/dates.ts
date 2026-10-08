/**
 * FECHAS SIN HORA
 *
 * Las columnas `date` del backend no traen hora. La API las serializa como
 * "2026-10-25" o como medianoche UTC ("2026-10-25T00:00:00.000000Z"). Con
 * new Date() y formato local, en Mexico (UTC-6) eso se muestra un dia antes.
 *
 * Estos helpers fijan la fecha de calendario en UTC para que se vea el dia que
 * guardo el backend sin importar la zona del navegador. No sirven para
 * timestamps reales (created_at, updated_at): para esos, formatDateTime.
 */

const DATE_ONLY_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/

type DateInput = string | Date | null | undefined

const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * Toma la parte YYYY-MM-DD de un string (Y-m-d o ISO) como medianoche UTC.
 * Un Date se reduce a su fecha local. Devuelve null si no es una fecha.
 */
export function parseDateOnly(value: DateInput): Date | null {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
  }

  const match = DATE_ONLY_PREFIX.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formatea una fecha sin hora sin correrla de dia.
 * Por defecto dd/mm/aaaa en es-MX. Vacio -> '-'; texto no reconocible se
 * devuelve tal cual.
 */
export function formatDateOnly(
  value: DateInput,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
): string {
  if (value == null || value === '') return '-'

  const date = parseDateOnly(value)
  if (!date) return typeof value === 'string' ? value : '-'

  return date.toLocaleDateString(locale, { ...options, timeZone: 'UTC' })
}

/** Valor para prellenar un <input type="date">: YYYY-MM-DD o '' */
export function toDateInput(value: DateInput): string {
  if (value == null || value === '') return ''
  const date = parseDateOnly(value)
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}

/** Hoy en la zona local del navegador como YYYY-MM-DD (no usa toISOString) */
export function todayDateInput(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Fecha local de un Date como YYYY-MM-DD (para sumar dias a hoy, etc.) */
export function dateToInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Compara dos fechas sin hora. Negativo si a < b, 0 si son el mismo dia,
 * positivo si a > b. Un valor invalido o vacio se ordena al final.
 */
export function compareDateOnly(a: DateInput, b: DateInput): number {
  const da = parseDateOnly(a)
  const db = parseDateOnly(b)
  if (!da && !db) return 0
  if (!da) return 1
  if (!db) return -1
  return da.getTime() - db.getTime()
}

/** true si la fecha ya paso (estrictamente antes de hoy local) */
export function isPastDateOnly(value: DateInput): boolean {
  if (!parseDateOnly(value)) return false
  return compareDateOnly(value, todayDateInput()) < 0
}

/** Dias de calendario de a hasta b (b - a) */
export function diffDaysDateOnly(a: DateInput, b: DateInput): number | null {
  const da = parseDateOnly(a)
  const db = parseDateOnly(b)
  if (!da || !db) return null
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

/** Suma dias a una fecha sin hora y devuelve YYYY-MM-DD ('' si invalida) */
export function addDaysDateOnly(value: DateInput, days: number): string {
  const date = parseDateOnly(value)
  if (!date) return ''
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Fecha y hora reales (timestamps) en la zona del navegador.
 * Vacio o invalido -> '-'.
 */
export function formatDateTime(
  value: DateInput,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
): string {
  if (value == null || value === '') return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString(locale, options)
}
