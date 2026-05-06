'use client'

import type { QuoteStatus } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  className?: string
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUS_CONFIG[status] || QUOTE_STATUS_CONFIG.draft

  // Map config colors to Bootstrap badge classes
  const colorMap: Record<string, string> = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-danger',
    outline: 'bg-light text-dark border',
    success: 'bg-success',
    warning: 'bg-warning text-dark'
  }

  const badgeClass = colorMap[config.color] || 'bg-secondary'

  return (
    <span className={`badge ${badgeClass} ${className || ''}`}>
      {config.label}
    </span>
  )
}
