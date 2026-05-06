/**
 * CycleCount Status Badge Component
 *
 * Displays status badge for cycle counts with appropriate colors and icons.
 */

'use client'

import React from 'react'
import type { CycleCountStatus, ABCClass } from '../types'
import { CYCLE_COUNT_STATUS_CONFIG, ABC_CLASS_CONFIG } from '../types/cycleCount'

interface CycleCountStatusBadgeProps {
  status: CycleCountStatus
  size?: 'small' | 'medium' | 'large'
}

export const CycleCountStatusBadge: React.FC<CycleCountStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const config = CYCLE_COUNT_STATUS_CONFIG[status]

  if (!config) {
    return <span className="badge bg-secondary">Desconocido</span>
  }

  const sizeClasses = {
    small: 'fs-8',
    medium: '',
    large: 'fs-6'
  }

  return (
    <span className={`badge bg-${config.variant} ${sizeClasses[size]}`}>
      <i className={`${config.icon} me-1`} />
      {config.label}
    </span>
  )
}

interface ABCClassBadgeProps {
  abcClass: ABCClass | null | undefined
  showDescription?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const ABCClassBadge: React.FC<ABCClassBadgeProps> = ({
  abcClass,
  showDescription = false,
  size = 'medium'
}) => {
  if (!abcClass) {
    return <span className="badge bg-light text-dark">Sin clasificar</span>
  }

  const config = ABC_CLASS_CONFIG[abcClass]

  if (!config) {
    return <span className="badge bg-secondary">{abcClass}</span>
  }

  const sizeClasses = {
    small: 'fs-8',
    medium: '',
    large: 'fs-6'
  }

  return (
    <span
      className={`badge bg-${config.variant} ${sizeClasses[size]}`}
      title={showDescription ? config.description : undefined}
    >
      {config.label}
    </span>
  )
}

interface VarianceBadgeProps {
  hasVariance: boolean
  varianceQuantity?: number | null
  variancePercentage?: number | null
}

export const VarianceBadge: React.FC<VarianceBadgeProps> = ({
  hasVariance,
  varianceQuantity,
  variancePercentage
}) => {
  if (!hasVariance) {
    return (
      <span className="badge bg-success">
        <i className="bi bi-check-circle me-1" />
        Sin variacion
      </span>
    )
  }

  const isNegative = (varianceQuantity ?? 0) < 0
  const variant = isNegative ? 'danger' : 'warning'
  const icon = isNegative ? 'bi-arrow-down' : 'bi-arrow-up'

  return (
    <span className={`badge bg-${variant}`}>
      <i className={`${icon} me-1`} />
      {varianceQuantity?.toFixed(2) ?? '0'} ({variancePercentage?.toFixed(1) ?? '0'}%)
    </span>
  )
}
