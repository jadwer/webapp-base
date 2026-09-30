'use client'

import { useState } from 'react'
import { QuoteSendModal } from './QuoteSendModal'
import type { Quote } from '../types'

interface QuoteSendButtonProps {
  quote: Quote
  onSent?: () => void
  className?: string
  /**
   * Renderiza como dropdown-item para integrarse al menu Operaciones
   * (OperationsMenu item type 'custom').
   */
  asMenuItem?: boolean
}

/**
 * QuoteSendButton
 *
 * Abre el modal de destinatarios (2026-09-30): principal, adicionales,
 * personas de contacto y correos en caliente. Solo para cotizaciones en
 * borrador o enviadas (reenvio).
 */
export function QuoteSendButton({ quote, onSent, className, asMenuItem = false }: QuoteSendButtonProps) {
  const [show, setShow] = useState(false)
  const canSend = ['draft', 'sent'].includes(quote.status)

  const button = asMenuItem ? (
    <button
      type="button"
      className="dropdown-item"
      onClick={() => setShow(true)}
      disabled={!canSend}
      title={!canSend ? 'Solo cotizaciones en borrador o enviadas' : undefined}
    >
      <i className="bi bi-envelope me-2" />
      Enviar
    </button>
  ) : (
    <button
      type="button"
      className={className || 'btn btn-outline-secondary'}
      onClick={() => setShow(true)}
      disabled={!canSend}
    >
      <i className="bi bi-envelope me-2" />
      Enviar
    </button>
  )

  return (
    <>
      {button}
      <QuoteSendModal quote={quote} show={show} onHide={() => setShow(false)} onSent={onSent} />
    </>
  )
}
