'use client'

import React from 'react'
import clsx from 'clsx'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'out_of_stock'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          text: 'Activo',
          className: 'bg-success text-white',
          icon: 'bi-check-circle-fill'
        }
      case 'inactive':
        return {
          text: 'Inactivo',
          className: 'bg-secondary text-white',
          icon: 'bi-pause-circle-fill'
        }
      case 'out_of_stock':
        return {
          text: 'Sin Stock',
          className: 'bg-warning text-dark',
          icon: 'bi-exclamation-triangle-fill'
        }
      default:
        return {
          text: 'Desconocido',
          className: 'bg-secondary text-white',
          icon: 'bi-question-circle-fill'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <span className={clsx('badge', config.className, className)}>
      <i className={clsx('bi', config.icon, 'me-1')} />
      {config.text}
    </span>
  )
}

export default StatusBadge