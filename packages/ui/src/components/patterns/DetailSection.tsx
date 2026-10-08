import React, { ReactNode } from 'react'
import clsx from 'clsx'

export interface DetailSectionProps {
  title: ReactNode
  /** Clase de Bootstrap Icons para el encabezado */
  icon?: string
  /** Botones a la derecha del encabezado */
  headerActions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Seccion en card para paginas de detalle y formularios */
export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  headerActions,
  children,
  className = 'card mb-4',
  bodyClassName,
}) => (
  <div className={className}>
    <div className="card-header d-flex justify-content-between align-items-center">
      <h5 className="card-title mb-0">
        {icon && <i className={clsx('bi', icon, 'me-2')} aria-hidden="true" />}
        {title}
      </h5>
      {headerActions && <div className="d-flex gap-2">{headerActions}</div>}
    </div>
    <div className={clsx('card-body', bodyClassName)}>{children}</div>
  </div>
)

export default DetailSection
