import React, { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import type { BadgeVariant } from './StatusBadge'

export interface KpiCardProps {
  label: ReactNode
  value: ReactNode
  /** Clase de Bootstrap Icons */
  icon?: string
  variant?: BadgeVariant
  /** Texto pequeno bajo el valor */
  hint?: ReactNode
  /** Mientras carga muestra '--' en lugar del valor */
  isLoading?: boolean
  /** Si se define, la tarjeta completa es un enlace */
  href?: string
  className?: string
}

/** Tarjeta de indicador para filas de KPIs. Solo numeros que aporta el backend */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  variant = 'primary',
  hint,
  isLoading = false,
  href,
  className,
}) => {
  const body = (
    <div className="card-body d-flex align-items-center">
      {icon && (
        <div className={clsx('flex-shrink-0 me-3 fs-2', `text-${variant}`)}>
          <i className={clsx('bi', icon)} aria-hidden="true" />
        </div>
      )}
      <div className="flex-grow-1">
        <div className="text-muted small">{label}</div>
        <div className="h4 mb-0">{isLoading ? '--' : value}</div>
        {hint && <div className="text-muted small">{hint}</div>}
      </div>
    </div>
  )

  const cardClass = clsx('card h-100', `border-start border-4 border-${variant}`, className)

  if (href) {
    return (
      <Link href={href} className={clsx(cardClass, 'text-decoration-none text-reset')}>
        {body}
      </Link>
    )
  }

  return <div className={cardClass}>{body}</div>
}

export default KpiCard
