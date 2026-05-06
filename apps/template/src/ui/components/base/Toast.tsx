'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Toast.module.scss'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  /** Contenido del toast */
  children: ReactNode
  /** Tipo de toast */
  type?: ToastType
  /** Si el toast está visible */
  show: boolean
  /** Callback al cerrar */
  onClose: () => void
  /** Duración en ms antes de auto-cerrar (0 = no auto-cerrar) */
  duration?: number
  /** Posición del toast */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /** Título opcional */
  title?: string
  /** Si se puede cerrar manualmente */
  closable?: boolean
  /** Clase adicional */
  className?: string
}

export const Toast: React.FC<ToastProps> = ({
  children,
  type = 'info',
  show,
  onClose,
  duration = 3000,
  position = 'bottom-right',
  title,
  closable = true,
  className
}) => {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onClose, 300) // Wait for animation
        }, duration)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [show, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill" />
      case 'error':
        return <i className="bi bi-exclamation-circle-fill" />
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill" />
      case 'info':
        return <i className="bi bi-info-circle-fill" />
      default:
        return null
    }
  }

  if (!mounted || !show) return null

  const toastElement = (
    <div className={clsx(styles.toastContainer, styles[position])}>
      <div 
        className={clsx(
          styles.toast,
          styles[type],
          {
            [styles.show]: isVisible,
            [styles.hide]: !isVisible
          },
          className
        )}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.content}>
          <div className={styles.icon}>
            {getIcon()}
          </div>
          <div className={styles.body}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.message}>{children}</div>
          </div>
          {closable && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Cerrar notificación"
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(toastElement, document.body)
}

export default Toast