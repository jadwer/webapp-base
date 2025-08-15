/**
 * FORMATTERS UTILITIES
 * Utilities for formatting numbers, currency, and quantities
 * with support for environment-based configuration
 */

/**
 * Format currency values with locale-aware formatting
 */
export const formatCurrency = (value?: number, currency?: string): string => {
  if (value == null) return '-'
  const defaultCurrency = currency || process.env.NEXT_PUBLIC_CURRENCY || 'MXN'
  
  // Locale mapping based on currency
  const localeMap: Record<string, string> = {
    'MXN': 'es-MX',
    'USD': 'en-US', 
    'CAD': 'en-CA',
    'EUR': 'es-ES'
  }
  
  const locale = localeMap[defaultCurrency] || 'es-MX'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: defaultCurrency,
    minimumFractionDigits: 2
  }).format(value)
}

/**
 * Format quantity values (remove unnecessary decimals)
 */
export const formatQuantity = (value?: string | number): string => {
  if (value == null) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  // Get locale from currency setting
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'MXN'
  const localeMap: Record<string, string> = {
    'MXN': 'es-MX',
    'USD': 'en-US', 
    'CAD': 'en-CA',
    'EUR': 'es-ES'
  }
  const locale = localeMap[currency] || 'es-MX'
  
  // Si es número entero, mostrar sin decimales
  if (num % 1 === 0) return num.toLocaleString(locale)
  // Si tiene decimales, mostrar máximo 2
  return num.toLocaleString(locale, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })
}

/**
 * Get current currency from environment
 */
export const getCurrentCurrency = (): 'MXN' | 'USD' | 'CAD' | 'EUR' => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY as 'MXN' | 'USD' | 'CAD' | 'EUR'
  return currency || 'MXN'
}

/**
 * Get locale based on current currency
 */
export const getCurrentLocale = (): string => {
  const currency = getCurrentCurrency()
  const localeMap: Record<string, string> = {
    'MXN': 'es-MX',
    'USD': 'en-US', 
    'CAD': 'en-CA',
    'EUR': 'es-ES'
  }
  return localeMap[currency] || 'es-MX'
}