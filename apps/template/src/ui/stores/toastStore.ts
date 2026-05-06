'use client'

import { create } from 'zustand'
import type { ToastType } from '../components/base/Toast'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  title?: string
  duration?: number
  show: boolean
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id' | 'show'>) => string
  removeToast: (id: string) => void
  hideToast: (id: string) => void
  hideAllToasts: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2)
    const newToast: ToastItem = {
      ...toast,
      id,
      show: true
    }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto remove after duration + animation time
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration + 500)
    }

    return id
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },
  
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map(toast => 
        toast.id === id ? { ...toast, show: false } : toast
      )
    }))
    
    // Remove from array after animation
    setTimeout(() => {
      get().removeToast(id)
    }, 300)
  },
  
  hideAllToasts: () => {
    set((state) => ({
      toasts: state.toasts.map(toast => ({ ...toast, show: false }))
    }))
    
    setTimeout(() => {
      set({ toasts: [] })
    }, 300)
  }
}))

// Hook conveniente para usar desde componentes
export const useGlobalToast = () => {
  const { addToast, hideToast, hideAllToasts } = useToastStore()
  
  const show = (
    message: string,
    type: ToastType = 'info',
    options: {
      title?: string
      duration?: number
    } = {}
  ) => {
    return addToast({
      message,
      type,
      title: options.title,
      duration: options.duration ?? 3000
    })
  }

  const success = (message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'success', options)
  }

  const error = (message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'error', options)
  }

  const warning = (message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'warning', options)
  }

  const info = (message: string, options?: { title?: string; duration?: number }) => {
    return show(message, 'info', options)
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    hide: hideToast,
    hideAll: hideAllToasts
  }
}