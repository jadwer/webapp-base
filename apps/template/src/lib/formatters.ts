/**
 * FORMATTERS UTILITIES
 * Utilities for formatting numbers, currency, and quantities
 * with support for environment-based configuration
 */

/**
 * Locale mapping for common currencies.
 * Intl.NumberFormat supports any ISO 4217 code; this map picks the best locale
 * for displaying the currency symbol in a familiar way.
 */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  'MXN': 'es-MX',
  'USD': 'en-US',
  'CAD': 'en-CA',
  'EUR': 'es-ES',
  'GBP': 'en-GB',
  'JPY': 'ja-JP',
  'BRL': 'pt-BR',
  'COP': 'es-CO',
  'ARS': 'es-AR',
  'CLP': 'es-CL',
  'PEN': 'es-PE',
  'CNY': 'zh-CN',
  'KRW': 'ko-KR',
  'CHF': 'de-CH',
}

/**
 * Get the best locale for a given currency code.
 */
const getLocaleForCurrency = (currencyCode: string): string => {
  return CURRENCY_LOCALE_MAP[currencyCode] || 'en-US'
}

/**
 * Format currency values with locale-aware formatting.
 * Supports any valid ISO 4217 currency code via Intl.NumberFormat.
 */
export const formatCurrency = (value?: number, currency?: string): string => {
  if (value == null) return '-'
  const currencyCode = currency || process.env.NEXT_PUBLIC_CURRENCY || 'MXN'
  const locale = getLocaleForCurrency(currencyCode)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(value)
}

/**
 * Format quantity values (remove unnecessary decimals)
 */
export const formatQuantity = (value?: string | number): string => {
  if (value == null) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value

  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'MXN'
  const locale = getLocaleForCurrency(currency)

  // Si es numero entero, mostrar sin decimales
  if (num % 1 === 0) return num.toLocaleString(locale)
  // Si tiene decimales, mostrar maximo 2
  return num.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

/**
 * Get current currency from environment
 */
export const getCurrentCurrency = (): string => {
  return process.env.NEXT_PUBLIC_CURRENCY || 'MXN'
}

/**
 * Get locale based on current currency
 */
export const getCurrentLocale = (): string => {
  return getLocaleForCurrency(getCurrentCurrency())
}
