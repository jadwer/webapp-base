/**
 * PRODUCT BATCH STATUS BADGE
 * Badge component for product batch status visualization
 * Siguiendo patrón exitoso de products/StatusBadge con tipos específicos
 */

'use client'

import React from 'react'
import clsx from 'clsx'
import type { ProductBatchStatus } from '../types'

interface ProductBatchStatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'> {
  status: ProductBatchStatus
  className?: string
  showIcon?: boolean
}

export const ProductBatchStatusBadge: React.FC<ProductBatchStatusBadgeProps> = ({ 
  status, 
  className,
  showIcon = true,
  ...props
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          text: 'Activo',
          className: 'bg-success text-white',
          icon: 'bi-check-circle-fill'
        }
      case 'quarantine':
        return {
          text: 'Cuarentena',
          className: 'bg-warning text-dark',
          icon: 'bi-shield-exclamation'
        }
      case 'expired':
        return {
          text: 'Vencido',
          className: 'bg-danger text-white',
          icon: 'bi-x-circle-fill'
        }
      case 'recalled':
        return {
          text: 'Retirado',
          className: 'bg-danger text-white',
          icon: 'bi-exclamation-triangle-fill'
        }
      case 'consumed':
        return {
          text: 'Consumido',
          className: 'bg-secondary text-white',
          icon: 'bi-check2-circle'
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
    <span 
      role="status"
      aria-label={`Estado: ${config.text}`}
      className={clsx('badge', config.className, className)}
      {...props}
    >
      {showIcon && <i className={clsx('bi', config.icon, 'me-1')} />}
      {config.text}
    </span>
  )
}

export default ProductBatchStatusBadge