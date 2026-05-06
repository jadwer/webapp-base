'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { ToastContainer } from './base/ToastContainer'
import { useToast, ToastItem } from '../hooks/useToast'

interface ToastContextType {
  toasts: ToastItem[]
  show: (message: string, type?: 'info' | 'success' | 'error' | 'warning', options?: { title?: string; duration?: number }) => string
  hide: (id: string) => void
  hideAll: () => void
  success: (message: string, options?: { title?: string; duration?: number }) => string
  error: (message: string, options?: { title?: string; duration?: number }) => string
  warning: (message: string, options?: { title?: string; duration?: number }) => string
  info: (message: string, options?: { title?: string; duration?: number }) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const GlobalToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastMethods = useToast()

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer 
        toasts={toastMethods.toasts}
        onClose={toastMethods.hide}
        position="top-right"
      />
    </ToastContext.Provider>
  )
}

export const useGlobalToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useGlobalToast must be used within a GlobalToastProvider')
  }
  return context
}

export default GlobalToastProvider