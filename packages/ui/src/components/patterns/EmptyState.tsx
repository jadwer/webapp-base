import React, { ReactNode } from 'react'
import clsx from 'clsx'

export interface EmptyStateProps {
  /** Clase de Bootstrap Icons. Default 'bi-inbox' */
  icon?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bi-inbox',
  title,
  description,
  action,
  className = 'text-center py-5',
}) => (
  <div className={className}>
    <i className={clsx('bi', icon, 'display-4 text-muted d-block mb-3')} aria-hidden="true" />
    <h6 className="text-muted">{title}</h6>
    {description && <p className="text-muted small mb-0">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
)

export default EmptyState
