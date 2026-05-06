'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'

interface SendTestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSend: (email: string) => Promise<{ message: string }>
  title?: string
}

export default function SendTestDialog({ isOpen, onClose, onSend, title = 'Enviar Email de Prueba' }: SendTestDialogProps) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!email.trim()) {
      toast.warning('Ingresa un email de destino')
      return
    }

    setSending(true)
    try {
      const result = await onSend(email.trim())
      toast.success(result.message)
      setEmail('')
      onClose()
    } catch {
      toast.error('Error al enviar el email de prueba')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-send me-2"></i>
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={sending}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted small mb-3">
              Ingresa la direccion de correo donde quieres recibir el email de prueba.
              No tiene que ser el correo de la empresa.
            </p>
            <div className="mb-3">
              <label htmlFor="test-email" className="form-label">Email de destino</label>
              <input
                type="email"
                className="form-control"
                id="test-email"
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={sending}
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSend} disabled={sending || !email.trim()}>
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Enviar Prueba
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
