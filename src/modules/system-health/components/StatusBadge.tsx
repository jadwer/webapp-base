'use client'

import type { HealthStatus, PingStatus } from '../types'
import { STATUS_LABELS, STATUS_ICONS, getStatusBadgeClass } from '../types'

interface StatusBadgeProps {
  status: HealthStatus | PingStatus
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status)
  const label = STATUS_LABELS[status] || status
  const icon = STATUS_ICONS[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={`badge ${badgeClass} ${sizeClasses[size]} d-inline-flex align-items-center gap-1`}
    >
      {showIcon && <i className={`bi ${icon}`} aria-hidden="true" />}
      {label.toUpperCase()}
    </span>
  )
}

export default StatusBadge
