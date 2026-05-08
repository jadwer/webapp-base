'use client'

import { useEffect } from 'react'

interface SimpleToastProps {
  message: string | null
  type?: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function SimpleToast({
  message,
  type = 'success',
  onClose,
  duration = 3000
}: SimpleToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!message) return null

  const getToastClasses = () => {
    const baseClasses = 'toast show position-fixed top-0 end-0 m-3'
    switch (type) {
      case 'success':
        return `${baseClasses} text-bg-success`
      case 'error':
        return `${baseClasses} text-bg-danger`
      case 'warning':
        return `${baseClasses} text-bg-warning`
      case 'info':
        return `${baseClasses} text-bg-info`
      default:
        return `${baseClasses} text-bg-success`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle'
      case 'error':
        return 'bi-x-circle'
      case 'warning':
        return 'bi-exclamation-triangle'
      case 'info':
        return 'bi-info-circle'
      default:
        return 'bi-check-circle'
    }
  }

  return (
    <div className={getToastClasses()} role="alert" style={{ zIndex: 1060 }}>
      <div className="toast-body d-flex align-items-center">
        <i className={`bi ${getIcon()} me-2`}></i>
        <div className="flex-grow-1">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
        ></button>
      </div>
    </div>
  )
}
