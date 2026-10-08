import React, { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'

export interface RowActionsLabels {
  view?: string
  edit?: string
  delete?: string
}

export interface RowActionsProps {
  /** Ruta de detalle; si falta no se muestra el boton Ver */
  viewHref?: string
  /** Ruta de edicion; si falta no se muestra el boton Editar */
  editHref?: string
  /** Accion de borrado; si falta no se muestra el boton Eliminar */
  onDelete?: () => void
  /** Botones adicionales al final del grupo */
  extra?: ReactNode
  size?: 'sm'
  labels?: RowActionsLabels
  className?: string
}

const DEFAULT_LABELS: Required<RowActionsLabels> = {
  view: 'Ver',
  edit: 'Editar',
  delete: 'Eliminar',
}

// Grupo estandar Ver/Editar/Eliminar de una fila, con title y aria-label en cada accion
export const RowActions: React.FC<RowActionsProps> = ({
  viewHref,
  editHref,
  onDelete,
  extra,
  size = 'sm',
  labels,
  className,
}) => {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <div className={clsx('btn-group', size === 'sm' && 'btn-group-sm', className)} role="group">
      {viewHref && (
        <Link href={viewHref} className="btn btn-outline-primary" title={l.view} aria-label={l.view}>
          <i className="bi bi-eye" aria-hidden="true" />
        </Link>
      )}
      {editHref && (
        <Link href={editHref} className="btn btn-outline-secondary" title={l.edit} aria-label={l.edit}>
          <i className="bi bi-pencil" aria-hidden="true" />
        </Link>
      )}
      {onDelete && (
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={onDelete}
          title={l.delete}
          aria-label={l.delete}
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      )}
      {extra}
    </div>
  )
}

export default RowActions
