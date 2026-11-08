'use client'

import { useEffect, useState } from 'react'
import type { GuideAction } from '../types'

interface GuideActionModalProps {
  action: GuideAction | null
  busy: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

const MIN_REASON = 5

/**
 * Confirmacion del manejador generico (acciones sin `asks`). Cuando la accion
 * pide motivo (cancelar), el motivo es obligatorio y queda en el historial.
 */
export function GuideActionModal({ action, busy, onClose, onConfirm }: GuideActionModalProps) {
  const [reason, setReason] = useState('')
  useEffect(() => setReason(''), [action?.key])
  if (!action) return null

  const needsReason = action.requiresReason
  const canConfirm = !busy && (!needsReason || reason.trim().length >= MIN_REASON)

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-modal="true" aria-labelledby="guide-action-title">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="guide-action-title">{action.phrase}</h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} disabled={busy} />
          </div>
          <div className="modal-body">
            <p className="mb-2">{needsReason ? 'Escribe el motivo; queda en el historial del documento.' : 'Se registra en el historial del documento.'}</p>
            <label htmlFor="guide-action-reason" className="form-label">
              Motivo{needsReason ? '' : ' (opcional)'}
            </label>
            <textarea
              id="guide-action-reason"
              className="form-control"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
            {needsReason && reason.trim().length > 0 && reason.trim().length < MIN_REASON ? (
              <div className="form-text text-danger">El motivo necesita al menos {MIN_REASON} caracteres.</div>
            ) : null}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button
              type="button"
              className={`btn ${needsReason ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => onConfirm(reason)}
              disabled={!canConfirm}
            >
              {busy ? 'Procesando...' : 'Hacerlo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
