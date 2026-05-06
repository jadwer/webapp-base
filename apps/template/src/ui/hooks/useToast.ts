'use client'

import { useState, useCallback } from 'react'
import type { ToastType } from '../components/base/Toast'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  title?: string
  duration?: number
  show: boolean
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((
    message: string,
    type: ToastType = 'info',
    options: {
      title?: string
      duration?: number
    } = {}
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2)
    const newToast: ToastItem = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration ?? 3000,
      show: true
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration + animation time
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, newToast.duration + 500)
    }

    return id
  }, [])

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, show: false } : toast
    ))

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }, [])

  const hideAll = useCallback(() => {
    setToasts(prev => prev.map(toast => ({ ...toast, show: false })))
    
    setTimeout(() => {
      setToasts([])
    }, 300)
  }, [])

  // Convenience methods
  const success = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'success', options)
  }, [show])

  const error = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'error', options)
  }, [show])

  const warning = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'warning', options)
  }, [show])

  const info = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'info', options)
  }, [show])

  return {
    toasts,
    show,
    hide,
    hideAll,
    success,
    error,
    warning,
    info
  }
}

export default useToast