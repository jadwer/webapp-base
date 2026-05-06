'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Alert.module.scss'

export interface AlertProps {
  /** Contenido del alert */
  children: ReactNode
  /** Variante visual del alert */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  /** Tamaño del alert */
  size?: 'small' | 'medium' | 'large'
  /** Si el alert se puede cerrar */
  dismissible?: boolean
  /** Función ejecutada al cerrar el alert */
  onClose?: () => void
  /** Icono personalizado */
  icon?: ReactNode
  /** Título del alert */
  title?: string
  /** Si mostrar icono por defecto según variant */
  showIcon?: boolean
  /** Clases adicionales */
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  size = 'medium',
  dismissible = false,
  onClose,
  icon,
  title,
  showIcon = true,
  className,
  ...props
}) => {
  const alertClassName = clsx(
    styles.alert,
    styles[size],
    styles[variant],
    {
      [styles.dismissible]: dismissible,
      [styles.withIcon]: (showIcon && !icon) || icon,
      [styles.withTitle]: title,
    },
    className
  )

  const getDefaultIcon = () => {
    if (!showIcon) return null
    
    switch (variant) {
      case 'success':
        return <i className="bi bi-check-circle-fill" aria-hidden="true" />
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
      case 'danger':
        return <i className="bi bi-x-circle-fill" aria-hidden="true" />
      case 'info':
        return <i className="bi bi-info-circle-fill" aria-hidden="true" />
      case 'primary':
        return <i className="bi bi-star-fill" aria-hidden="true" />
      case 'secondary':
        return <i className="bi bi-circle-fill" aria-hidden="true" />
      default:
        return <i className="bi bi-info-circle-fill" aria-hidden="true" />
    }
  }

  const displayIcon = icon || getDefaultIcon()

  return (
    <div className={alertClassName} role="alert" {...props}>
      {displayIcon && (
        <div className={styles.iconContainer}>
          {displayIcon}
        </div>
      )}
      
      <div className={styles.content}>
        {title && (
          <div className={styles.title}>
            {title}
          </div>
        )}
        <div className={styles.message}>
          {children}
        </div>
      </div>

      {dismissible && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          <i className="bi bi-x" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}