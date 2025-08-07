'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Modal.module.scss'

export interface ModalProps {
  /** Si el modal está visible */
  show: boolean
  /** Callback al cerrar */
  onHide: () => void
  /** Título del modal */
  title?: ReactNode
  /** Contenido del modal */
  children: ReactNode
  /** Tamaño del modal */
  size?: 'small' | 'medium' | 'large' | 'xl'
  /** Si se puede cerrar con ESC o click fuera */
  closable?: boolean
  /** Si muestra el botón X de cerrar */
  closeButton?: boolean
  /** Si el modal está centrado verticalmente */
  centered?: boolean
  /** Footer del modal */
  footer?: ReactNode
  /** Clase adicional */
  className?: string
  /** Clase adicional para el contenido */
  contentClassName?: string
}

export const Modal: React.FC<ModalProps> = ({
  show,
  onHide,
  title,
  children,
  size = 'medium',
  closable = true,
  closeButton = true,
  centered = true,
  footer,
  className,
  contentClassName
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
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [show])

  useEffect(() => {
    if (!closable) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onHide()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [show, onHide, closable])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closable && event.target === event.currentTarget) {
      onHide()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onHide, 150) // Wait for animation
  }

  if (!mounted || !show) return null

  const modalElement = (
    <div
      className={clsx(
        styles.modalBackdrop,
        {
          [styles.show]: isVisible,
          [styles.hide]: !isVisible
        }
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={clsx(
          styles.modalDialog,
          styles[size],
          {
            [styles.centered]: centered
          },
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx(styles.modalContent, contentClassName)}>
          {/* Header */}
          {(title || closeButton) && (
            <div className={styles.modalHeader}>
              {title && (
                <h5 className={styles.modalTitle}>
                  {title}
                </h5>
              )}
              {closeButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleClose}
                  aria-label="Cerrar modal"
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={styles.modalBody}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={styles.modalFooter}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalElement, document.body)
}

export default Modal