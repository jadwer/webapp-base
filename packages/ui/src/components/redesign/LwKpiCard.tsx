import React, { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export interface LwKpiCardProps {
  label: ReactNode
  value: ReactNode
  /** Clase de Bootstrap Icons (bi-...) */
  icon?: string
  /** La primera tarjeta del diseno va en degradado azul */
  highlight?: boolean
  hint?: ReactNode
  isLoading?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

/** Tarjeta de indicador del rediseno: etiqueta e icono arriba, valor grande abajo. */
export function LwKpiCard({ label, value, icon, highlight, hint, isLoading, href, onClick, className }: LwKpiCardProps) {
  const body = (
    <>
      <div className={styles.kpiTop}>
        <span>{label}</span>
        {icon ? (
          <span className={styles.kpiIcon} aria-hidden="true">
            <i className={clsx('bi', icon)} />
          </span>
        ) : null}
      </div>
      <div>
        <div className={styles.kpiValue}>{isLoading ? '--' : value}</div>
        {hint ? <div className={styles.kpiHint}>{hint}</div> : null}
      </div>
    </>
  )
  const cls = clsx(styles.kpi, highlight && styles.kpiHighlight, className)
  if (href) return <Link href={href} className={cls}>{body}</Link>
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={clsx(cls, 'border-0 text-start w-100')}>
        {body}
      </button>
    )
  }
  return <div className={cls}>{body}</div>
}
