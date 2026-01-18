'use client'

import { Badge } from '@/components/ui/badge'
import type { QuoteStatus } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  className?: string
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUS_CONFIG[status] || QUOTE_STATUS_CONFIG.draft

  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    default: 'default',
    secondary: 'secondary',
    destructive: 'destructive',
    outline: 'outline',
    success: 'default',
    warning: 'secondary'
  }

  const variant = variantMap[config.color] || 'default'

  // Custom colors for success and warning
  const customClasses =
    config.color === 'success'
      ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100'
      : config.color === 'warning'
        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100'
        : ''

  return (
    <Badge variant={variant} className={`${customClasses} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}
