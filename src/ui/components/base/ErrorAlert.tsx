'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from './Button'

export interface ErrorAlertProps {
  title: string
  message: string
  type?: 'error' | 'warning' | 'constraint'
  icon?: string
  onClose?: () => void
  onRetry?: () => void
  className?: string
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  type = 'error',
  icon,
  onClose,
  onRetry,
  className
}) => {
  const getAlertClass = () => {
    switch (type) {
      case 'warning':
        return 'alert-warning'
      case 'constraint':
        return 'alert-danger'
      default:
        return 'alert-danger'
    }
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'warning':
        return 'bi-exclamation-triangle-fill'
      case 'constraint':
        return 'bi-shield-exclamation'
      default:
        return 'bi-exclamation-circle-fill'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-warning'
      case 'constraint':
        return 'text-danger'
      default:
        return 'text-danger'
    }
  }

  return (
    <div className={clsx('alert d-flex align-items-start', getAlertClass(), className)} role="alert">
      <i className={clsx('bi', getIcon(), getIconColor(), 'me-3 mt-1')} />
      
      <div className="flex-fill">
        <div className="fw-bold mb-1">{title}</div>
        <div className="mb-3">{message}</div>
        
        {(onRetry || onClose) && (
          <div className="d-flex gap-2">
            {onRetry && (
              <Button
                size="small"
                variant="primary"
                buttonStyle="outline"
                onClick={onRetry}
              >
                <i className="bi bi-arrow-clockwise me-1" />
                Reintentar
              </Button>
            )}
            {onClose && (
              <Button
                size="small"
                variant="secondary"
                buttonStyle="outline"
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-1" />
                Cerrar
              </Button>
            )}
          </div>
        )}
      </div>
      
      {onClose && !onRetry && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  )
}

export default ErrorAlert