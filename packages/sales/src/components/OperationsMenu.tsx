'use client'

import type { ReactNode } from 'react'

/**
 * OperationsMenu - Fase A (Venta directa vs Pedido)
 *
 * Dropdown "Operaciones" reutilizable (patron Bootstrap dropdown del repo,
 * mismo mecanismo data-bs-toggle que usa QuotesTable). Agrupa las acciones
 * de documento (generar venta/pedido, prefactura, enviar, duplicar,
 * exportar CSV, PDF, etc.) en un solo menu.
 *
 * Tres tipos de item:
 * - action: boton con icono, onClick, disabled y title opcionales
 * - divider: separador visual
 * - custom: nodo React arbitrario (para integrar componentes existentes
 *   como QuoteSendButton en modo menu-item)
 */

export type OperationsMenuItem =
  | {
      type?: 'action'
      key: string
      label: string
      /** Bootstrap icon class, ej. 'bi-cash-coin' */
      icon?: string
      onClick: () => void
      disabled?: boolean
      /** Tooltip, util para explicar por que esta deshabilitado */
      title?: string
      variant?: 'default' | 'danger' | 'warning' | 'success'
    }
  | { type: 'divider'; key: string }
  | { type: 'custom'; key: string; node: ReactNode }

export interface OperationsMenuProps {
  items: OperationsMenuItem[]
  /** Texto del boton. Default: 'Operaciones' */
  label?: string
  /** Clase del boton toggle. Default: 'btn btn-primary dropdown-toggle' */
  buttonClassName?: string
  /** Alineacion del menu. Default: 'end' */
  align?: 'start' | 'end'
  disabled?: boolean
  /** Muestra spinner en el boton (accion en curso) */
  loading?: boolean
}

const VARIANT_CLASS: Record<string, string> = {
  default: '',
  danger: ' text-danger',
  warning: ' text-warning',
  success: ' text-success'
}

export function OperationsMenu({
  items,
  label = 'Operaciones',
  buttonClassName = 'btn btn-primary dropdown-toggle',
  align = 'end',
  disabled = false,
  loading = false
}: OperationsMenuProps) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className={buttonClassName}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        disabled={disabled || loading}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ) : (
          <i className="bi bi-lightning-charge me-2" aria-hidden="true"></i>
        )}
        {label}
      </button>
      <ul className={`dropdown-menu${align === 'end' ? ' dropdown-menu-end' : ''}`}>
        {items.map((item) => {
          if (item.type === 'divider') {
            return (
              <li key={item.key}>
                <hr className="dropdown-divider" />
              </li>
            )
          }

          if (item.type === 'custom') {
            return <li key={item.key}>{item.node}</li>
          }

          return (
            <li key={item.key}>
              <button
                type="button"
                className={`dropdown-item${VARIANT_CLASS[item.variant || 'default']}`}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.title}
              >
                {item.icon && <i className={`bi ${item.icon} me-2`} aria-hidden="true"></i>}
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
