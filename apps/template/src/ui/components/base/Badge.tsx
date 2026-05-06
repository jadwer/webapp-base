'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Badge.module.scss'

export interface BadgeProps {
  /** Contenido del badge */
  children: ReactNode
  /** Variante visual del badge */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark'
  /** Tamaño del badge */
  size?: 'small' | 'medium' | 'large'
  /** Forma del badge */
  shape?: 'rounded' | 'pill'
  /** Icono al inicio */
  startIcon?: ReactNode
  /** Icono al final */
  endIcon?: ReactNode
  /** Clases adicionales */
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  startIcon,
  endIcon,
  className,
  ...props
}) => {
  const badgeClassName = clsx(
    styles.badge,
    styles[size],
    styles[variant],
    styles[shape],
    {
      [styles.withIcon]: startIcon || endIcon,
    },
    className
  )

  return (
    <span className={badgeClassName} {...props}>
      {startIcon && (
        <span className={styles.startIcon}>
          {startIcon}
        </span>
      )}
      <span className={styles.content}>
        {children}
      </span>
      {endIcon && (
        <span className={styles.endIcon}>
          {endIcon}
        </span>
      )}
    </span>
  )
}

export default Badge