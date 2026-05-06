import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatPrice(
  price: number | null | undefined,
  currency: string = 'MXN'
): string {
  if (price === null || price === undefined || isNaN(price)) {
    return 'N/A'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

export function formatNumber(
  value: number | null | undefined, 
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }
  
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatDate(
  dateString: string | null | undefined,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return format(date, formatString, { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

export function formatDateRelative(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
    
    return `Hace ${Math.floor(days / 365)} años`
  } catch {
    return 'Fecha inválida'
  }
}

export function truncateText(
  text: string | null | undefined, 
  maxLength: number = 50,
  suffix: string = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatSKU(sku: string): string {
  return sku.toUpperCase().trim()
}

export function formatPercentage(
  value: number | null | undefined, 
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }
  
  return `${value.toFixed(decimals)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function capitalizeFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function formatProductName(name: string): string {
  return name
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export function getPriceRange(prices: number[]): string {
  if (prices.length === 0) return 'Sin precios'
  
  const validPrices = prices.filter(p => !isNaN(p) && p > 0)
  if (validPrices.length === 0) return 'Sin precios'
  
  const min = Math.min(...validPrices)
  const max = Math.max(...validPrices)
  
  if (min === max) {
    return formatPrice(min)
  }
  
  return `${formatPrice(min)} - ${formatPrice(max)}`
}