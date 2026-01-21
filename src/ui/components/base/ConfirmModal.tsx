'use client'

import React, { useState, forwardRef, useImperativeHandle, ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'

export interface ConfirmModalHandle {
  confirm: (message: string, options?: ConfirmModalOptions) => Promise<boolean>
}

export interface ConfirmModalOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  icon?: ReactNode
  size?: 'small' | 'medium' | 'large'
}

const ConfirmModal = forwardRef<ConfirmModalHandle>((_, ref) => {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState<string>('¿Confirmar acción?')
  const [confirmText, setConfirmText] = useState('Confirmar')
  const [cancelText, setCancelText] = useState('Cancelar')
  const [confirmVariant, setConfirmVariant] = useState<'primary' | 'secondary' | 'success' | 'warning' | 'danger'>('danger')
  const [icon, setIcon] = useState<ReactNode>(null)
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small')
  const [resolveFn, setResolveFn] = useState<(result: boolean) => void>(() => () => {})

  useImperativeHandle(ref, () => ({
    confirm(msg: string, options: ConfirmModalOptions = {}) {
      setMessage(msg)
      setTitle(options.title || '¿Confirmar acción?')
      setConfirmText(options.confirmText || 'Confirmar')
      setCancelText(options.cancelText || 'Cancelar')
      setConfirmVariant(options.confirmVariant || 'danger')
      setIcon(options.icon || null)
      setSize(options.size || 'small')
      setShow(true)
      
      return new Promise<boolean>((resolve) => {
        setResolveFn(() => resolve)
      })
    },
  }))

  const handleClose = () => {
    setShow(false)
    resolveFn(false)
  }

  const handleConfirm = () => {
    setShow(false)
    resolveFn(true)
  }

  const footer = (
    <>
      <Button
        variant="secondary"
        buttonStyle="outline"
        onClick={handleClose}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
      >
        {confirmText}
      </Button>
    </>
  )

  return (
    <Modal
      show={show}
      onHide={handleClose}
      title={title}
      size={size}
      centered
      footer={footer}
    >
      <div className="d-flex align-items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-1" style={{ fontSize: '1.5rem' }}>
            {icon}
          </div>
        )}
        <div className="flex-grow-1">
          {message}
        </div>
      </div>
    </Modal>
  )
})

ConfirmModal.displayName = 'ConfirmModal'

export { ConfirmModal }
export default ConfirmModal