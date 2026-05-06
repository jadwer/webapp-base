'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import Toast from 'react-bootstrap/Toast'

export interface ToastNotifierHandle {
  show: (message: string, type?: ToastType, duration?: number) => void
}

type ToastType = 'success' | 'error' | 'info' | 'warning'

export type { ToastType }

const bgColorMap: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-info text-white',
  warning: 'bg-warning text-dark',
}

const ToastNotifier = forwardRef<ToastNotifierHandle>((_, ref) => {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('success')

  useImperativeHandle(ref, () => ({
    show(msg: string, toastType: ToastType = 'success', duration = 6000) {
      setMessage(msg)
      setType(toastType)
      setShow(true)
      setTimeout(() => setShow(false), duration)
    },
  }))

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050,
      }}
    >
      <Toast show={show} onClose={() => setShow(false)}>
        <Toast.Body className={bgColorMap[type]}>
          {message}
        </Toast.Body>
      </Toast>
    </div>
  )
})

ToastNotifier.displayName = 'ToastNotifier'

export default ToastNotifier
