'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { ToastContainer } from '@/ui/components/base'
import { useToast } from '@/ui/hooks'
import type { ToastType } from '@/ui/components/base'

export interface ToastNotifierHandle {
  show: (message: string, type?: ToastType) => void
}

const ToastNotifierDS = forwardRef<ToastNotifierHandle>((_, ref) => {
  const toast = useToast()

  useImperativeHandle(ref, () => ({
    show(message: string, type: ToastType = 'info') {
      toast.show(message, type)
    }
  }))

  return (
    <ToastContainer
      toasts={toast.toasts}
      onClose={toast.hide}
      position="bottom-right"
    />
  )
})

ToastNotifierDS.displayName = 'ToastNotifierDS'

export default ToastNotifierDS