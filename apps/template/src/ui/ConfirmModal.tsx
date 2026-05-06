'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { Modal, Button } from 'react-bootstrap'

export interface ConfirmModalHandle {
  confirm: (message: string) => Promise<boolean>
}

const ConfirmModal = forwardRef<ConfirmModalHandle>((_, ref) => {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [resolveFn, setResolveFn] = useState<(result: boolean) => void>(() => () => {})

  useImperativeHandle(ref, () => ({
    confirm(msg: string) {
      setMessage(msg)
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

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>¿Confirmar acción?</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  )
})

ConfirmModal.displayName = 'ConfirmModal'

export default ConfirmModal
