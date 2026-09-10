/**
 * Commissions Module - Status Badge
 */

'use client'

import React from 'react'
import { COMMISSION_STATUS_CONFIG } from '../types'
import type { CommissionStatus } from '../types'

interface CommissionStatusBadgeProps {
  status: CommissionStatus
}

export const CommissionStatusBadge: React.FC<CommissionStatusBadgeProps> = ({ status }) => {
  const config = COMMISSION_STATUS_CONFIG[status]

  if (!config) {
    return <span className="badge bg-secondary">{status}</span>
  }

  return (
    <span className={`badge ${config.badgeClass}`}>
      <i className={`bi ${config.icon} me-1`} />
      {config.label}
    </span>
  )
}

export default CommissionStatusBadge
