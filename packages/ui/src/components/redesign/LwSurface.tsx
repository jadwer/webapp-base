import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export interface LwSurfaceProps {
  children: ReactNode
  className?: string
}

/**
 * Contenedor de una pagina del rediseno 2026-11: panel blanco y piel de los
 * controles de Bootstrap que van dentro (botones, campos, tarjetas). Fuera de
 * el, el resto del panel se ve como siempre.
 */
export function LwSurface({ children, className }: LwSurfaceProps) {
  return <div className={clsx(styles.surface, className)}>{children}</div>
}

export interface LwPageTitleProps {
  title: ReactNode
  /** Parte del titulo resaltada en verde (el folio en "Editar cotizacion: COT-...") */
  highlight?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

export function LwPageTitle({ title, highlight, subtitle, actions, className }: LwPageTitleProps) {
  return (
    <div className={clsx('d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4', className)}>
      <div>
        <h1 className="h3">
          {title}
          {highlight ? <> <span className={styles.accentText}>{highlight}</span></> : null}
        </h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="d-flex gap-2 flex-wrap">{actions}</div> : null}
    </div>
  )
}
