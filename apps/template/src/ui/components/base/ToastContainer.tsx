'use client'

import React from 'react'
import Toast, { type ToastProps } from './Toast'
import type { ToastItem } from '../../hooks/useToast'

export interface ToastContainerProps {
  /** Array de toasts a mostrar */
  toasts: ToastItem[]
  /** Callback al cerrar un toast */
  onClose: (id: string) => void
  /** Posición de los toasts */
  position?: ToastProps['position']
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'bottom-right'
}) => {
  if (toasts.length === 0) return null

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          show={toast.show}
          onClose={() => onClose(toast.id)}
          duration={toast.duration}
          position={position}
          title={toast.title}
        >
          {toast.message}
        </Toast>
      ))}
    </>
  )
}

export default ToastContainer