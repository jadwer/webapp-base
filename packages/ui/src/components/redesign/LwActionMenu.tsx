'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export interface LwActionMenuItem {
  key: string
  label: string
  icon?: string
  onSelect?: () => void
  danger?: boolean
  /** Visible pero deshabilitada; `hint` explica por que */
  disabled?: boolean
  hint?: string
  /** Linea divisoria antes de este elemento */
  divider?: boolean
  /** Contenido propio en lugar del boton (p. ej. un componente que abre su modal) */
  node?: ReactNode
}

export interface LwActionMenuProps {
  items: LwActionMenuItem[]
  /** Sin `trigger` se muestra el icono de tres puntos */
  trigger?: ReactNode
  label?: string
  triggerClassName?: string
  align?: 'end' | 'start'
}

/** Menu de acciones del rediseno (tres puntos en filas, "Operaciones" en el detalle). */
export function LwActionMenu({ items, trigger, label = 'Más acciones', triggerClassName, align = 'end' }: LwActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  if (items.length === 0) return null

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button
        type="button"
        className={triggerClassName ?? styles.iconBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={trigger ? undefined : label}
        title={trigger ? undefined : label}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger ?? <i className="bi bi-three-dots-vertical" aria-hidden="true" />}
      </button>
      {open ? (
        <ul className={styles.menu} role="menu" style={align === 'start' ? { left: 0, right: 'auto' } : undefined}>
          {items.map((item) => (
            <li key={item.key} role="none">
              {item.divider ? <div className={styles.menuDivider} /> : null}
              {item.node ? (
                <div onClick={() => setOpen(false)}>{item.node}</div>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className={clsx(styles.menuItem, item.danger && styles.menuItemDanger)}
                    onClick={() => {
                      setOpen(false)
                      item.onSelect?.()
                    }}
                  >
                    {item.icon ? <i className={clsx('bi', item.icon)} aria-hidden="true" /> : null}
                    {item.label}
                  </button>
                  {item.disabled && item.hint ? <div className={styles.menuHint}>{item.hint}</div> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
