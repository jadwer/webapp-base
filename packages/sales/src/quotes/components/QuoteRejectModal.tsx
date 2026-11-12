'use client'

import { useEffect, useState } from 'react'
import { LwSurface } from '@lwm/ui'
import type { Quote } from '../types'

interface QuoteRejectModalProps {
  quote: Quote | null
  busy?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

/** Rechazo de una cotizacion con su motivo (queda en el historial). */
export function QuoteRejectModal({ quote, busy, onClose, onConfirm }: QuoteRejectModalProps) {
  const [reason, setReason] = useState('')
  useEffect(() => setReason(''), [quote?.id])
  if (!quote) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(1,42,148,0.08)' }} role="dialog" aria-modal="true" aria-labelledby="quote-reject-title">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 bg-transparent">
          <LwSurface>
            <h2 className="h5 mb-1" id="quote-reject-title">Rechazar cotización {quote.quoteNumber}</h2>
            <p className="small mb-3">Registra la respuesta del cliente. El motivo ayuda a medir por qué no se cierran ventas.</p>
            <label htmlFor="quote-reject-reason" className="form-label">Motivo del rechazo (opcional)</label>
            <textarea
              id="quote-reject-reason"
              className="form-control"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej.: el cliente encontró mejor precio"
              disabled={busy}
            />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-primary" onClick={onClose} disabled={busy}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={() => onConfirm(reason.trim())} disabled={busy}>
                {busy ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </LwSurface>
        </div>
      </div>
    </div>
  )
}
