/**
 * Budget Status Badge Component
 *
 * Displays budget status level with appropriate styling.
 */

'use client'

import React from 'react'
import clsx from 'clsx'
import type { ParsedBudget, BudgetStatusLevel } from '../types'
import { BUDGET_STATUS_LEVEL_CONFIG } from '../types'

interface BudgetStatusBadgeProps {
  budget: ParsedBudget
  showUtilization?: boolean
  className?: string
}

/**
 * Compute status level based on utilization percentage
 */
function computeStatusLevel(budget: ParsedBudget): BudgetStatusLevel {
  if (budget.statusLevel) return budget.statusLevel

  const utilization = budget.utilizationPercent || 0
  const warning = budget.warningThreshold || 80
  const critical = budget.criticalThreshold || 95

  if (utilization >= 100) return 'exceeded'
  if (utilization >= critical) return 'critical'
  if (utilization >= warning) return 'warning'
  return 'normal'
}

export const BudgetStatusBadge: React.FC<BudgetStatusBadgeProps> = ({
  budget,
  showUtilization = true,
  className,
}) => {
  const statusLevel = computeStatusLevel(budget)
  const config = BUDGET_STATUS_LEVEL_CONFIG[statusLevel]

  return (
    <div className={clsx('d-inline-flex align-items-center gap-1', className)}>
      <span className={clsx('badge', config.badgeClass)}>
        <i className={clsx('bi', config.icon, 'me-1')} />
        {config.label}
      </span>
      {showUtilization && budget.utilizationPercent !== undefined && (
        <small className="text-muted">
          ({budget.utilizationDisplay || `${budget.utilizationPercent.toFixed(1)}%`})
        </small>
      )}
    </div>
  )
}

export default BudgetStatusBadge
