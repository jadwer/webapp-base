/**
 * DATE-ONLY FORMATTING
 *
 * Backend date columns like order_date carry no time information. The API
 * serializes them as UTC midnight ("2026-07-16T00:00:00.000000Z") or as a
 * plain date string ("2026-07-16"). Parsing those with new Date() and then
 * formatting in a timezone west of UTC (e.g. America/Mexico_City, UTC-6)
 * shifts the value to the PREVIOUS day: the order placed on 16/07 renders
 * as 15/07.
 *
 * These helpers pin date-only values to UTC so the calendar date the backend
 * stored is the one rendered, regardless of the viewer's timezone.
 *
 * Do NOT use them for real timestamps (created_at, updated_at, delivered_at):
 * those must keep converting to the viewer's local time.
 */

const DATE_ONLY_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/

/**
 * Parses the calendar date portion of a date-only string as UTC midnight.
 * Returns null when the string does not start with YYYY-MM-DD.
 */
export function parseDateOnly(dateString: string): Date | null {
  const match = DATE_ONLY_PREFIX.exec(dateString)
  if (!match) return null

  const [, year, month, day] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

/**
 * Formats a date-only value without timezone shifting.
 *
 * @param dateString "2026-07-16" or "2026-07-16T00:00:00.000000Z"
 * @param locale     BCP 47 locale, defaults to es-MX
 * @param options    Intl date parts (timeZone is always forced to UTC)
 */
export function formatDateOnly(
  dateString: string | null | undefined,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  if (!dateString) return '-'

  const date = parseDateOnly(dateString)
  if (!date) return dateString

  return date.toLocaleDateString(locale, { ...options, timeZone: 'UTC' })
}
