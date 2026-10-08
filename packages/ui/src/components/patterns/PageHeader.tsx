import React, { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

export interface PageHeaderProps {
  /** Titulo principal (h1.h3) */
  title: ReactNode
  /** Texto secundario bajo el titulo */
  subtitle?: ReactNode
  /** Clase de Bootstrap Icons, p. ej. 'bi-box-seam' */
  icon?: string
  /** Badges junto al titulo (StatusBadge, etc.) */
  badges?: ReactNode
  /** Acciones a la derecha: una primaria, el resto btn-outline-* */
  actions?: ReactNode
  /** Si se define, muestra un enlace de regreso antes de las acciones */
  backHref?: string
  backLabel?: string
  className?: string
}

/**
 * Bloque de encabezado de pagina del dashboard. No incluye contenedor:
 * el componente de pagina pone el container-fluid py-4.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  badges,
  actions,
  backHref,
  backLabel = 'Volver',
  className = 'mb-4',
}) => {
  const hasRight = Boolean(backHref || actions)

  return (
    <div className={clsx('d-flex justify-content-between align-items-center flex-wrap gap-2', className)}>
      <div>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <h1 className="h3 mb-1">
            {icon && <i className={clsx('bi', icon, 'me-2')} aria-hidden="true" />}
            {title}
          </h1>
          {badges}
        </div>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {hasRight && (
        <div className="d-flex align-items-center flex-wrap gap-2">
          {backHref && (
            <Link href={backHref} className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              {backLabel}
            </Link>
          )}
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
