import React from 'react'
import clsx from 'clsx'

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'light'
  | 'dark'

export interface StatusBadgeEntry {
  label: string
  variant: BadgeVariant
  /** Clase de Bootstrap Icons opcional */
  icon?: string
}

export type StatusBadgeMap = Record<string, StatusBadgeEntry>

export interface StatusBadgeProps {
  status: string | null | undefined
  map: StatusBadgeMap
  /** Se usa cuando el estado no esta en el mapa. Default: el valor crudo en gris */
  fallback?: StatusBadgeEntry
  className?: string
}

const DARK_TEXT: BadgeVariant[] = ['warning', 'info', 'light']

/** Badge Bootstrap a partir de un mapa estado -> { label, variant, icon } */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, map, fallback, className }) => {
  const key = status ?? ''
  const entry: StatusBadgeEntry =
    map[key] ?? fallback ?? { label: key || 'Sin estado', variant: 'secondary' }

  return (
    <span
      className={clsx(
        'badge',
        `bg-${entry.variant}`,
        DARK_TEXT.includes(entry.variant) && 'text-dark',
        className,
      )}
    >
      {entry.icon && <i className={clsx('bi', entry.icon, 'me-1')} aria-hidden="true" />}
      {entry.label}
    </span>
  )
}

export default StatusBadge
