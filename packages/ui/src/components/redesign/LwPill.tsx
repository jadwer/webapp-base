import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export type LwTone = 'neutral' | 'success' | 'info' | 'danger' | 'warning' | 'navy'

export interface LwStatusPillProps {
  tone: LwTone
  children: ReactNode
  title?: string
  className?: string
}

/** Pastilla de estado solida (Borrador, Enviada, Aceptada...). */
export function LwStatusPill({ tone, children, title, className }: LwStatusPillProps) {
  return (
    <span className={clsx(styles.pill, styles[`tone-${tone}`], className)} title={title}>
      {children}
    </span>
  )
}

/** Pastilla contorneada para conteos ("6 Productos"). */
export function LwCountPill({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return <span className={clsx(styles.countPill, className)} title={title}>{children}</span>
}

/** Envoltura de tabla del rediseno: bordes, encabezado gris y celdas compactas. */
export function LwTableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx(styles.tableWrap, className)}>{children}</div>
}

export interface LwIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Clase de Bootstrap Icons */
  icon: string
  /** Texto accesible y tooltip */
  label: string
}

/** Boton de icono para acciones de fila (ver, editar). */
export function LwIconButton({ icon, label, className, ...rest }: LwIconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} className={clsx(styles.iconBtn, className)} {...rest}>
      <i className={clsx('bi', icon)} aria-hidden="true" />
    </button>
  )
}
