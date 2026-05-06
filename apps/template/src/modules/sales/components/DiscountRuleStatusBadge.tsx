/**
 * DiscountRule Status Badge Component
 *
 * Displays the status of a discount rule with appropriate styling.
 */

'use client'

import React from 'react'
import clsx from 'clsx'
import type { ParsedDiscountRule } from '../types'

interface DiscountRuleStatusBadgeProps {
  rule: ParsedDiscountRule
  size?: 'sm' | 'md'
}

export const DiscountRuleStatusBadge: React.FC<DiscountRuleStatusBadgeProps> = ({
  rule,
  size = 'md'
}) => {
  const getStatusConfig = () => {
    if (!rule.isActive) {
      return { className: 'bg-secondary', label: 'Inactivo' }
    }
    if (rule.isExpired) {
      return { className: 'bg-danger', label: 'Expirado' }
    }
    if (!rule.isValid) {
      return { className: 'bg-warning text-dark', label: 'No Valido' }
    }
    return { className: 'bg-success', label: 'Activo' }
  }

  const config = getStatusConfig()

  return (
    <span
      className={clsx('badge', config.className, {
        'fs-7': size === 'sm'
      })}
    >
      {config.label}
    </span>
  )
}

export default DiscountRuleStatusBadge
