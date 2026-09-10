/**
 * Commissions Module - Pay Batch / Mark Paid Modal
 *
 * Asks for a payment_reference and confirms the payout of either a single
 * commission (markPaid) or a batch of selected commissions (payBatch).
 * The backend is transactional for batches: if any row is not "earned"
 * nothing is updated and a 422 with the offending ids is returned.
 */

'use client'

import React, { useState } from 'react'
import { Modal, Button } from '@lwm/ui'

interface PayBatchModalProps {
  show: boolean
  count: number
  totalAmount: number
  isSubmitting: boolean
  errorMessage: string | null
  onConfirm: (paymentReference: string) => void
  onClose: () => void
}

export const PayBatchModal: React.FC<PayBatchModalProps> = ({
  show,
  count,
  totalAmount,
  isSubmitting,
  errorMessage,
  onConfirm,
  onClose,
}) => {
  const [paymentReference, setPaymentReference] = useState('')

  const handleClose = () => {
    setPaymentReference('')
    onClose()
  }

  const handleConfirm = () => {
    if (!paymentReference.trim()) return
    onConfirm(paymentReference.trim())
  }

  const footer = (
    <>
      <Button variant="secondary" buttonStyle="outline" onClick={handleClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        variant="success"
        onClick={handleConfirm}
        disabled={isSubmitting || !paymentReference.trim()}
      >
        {isSubmitting ? 'Procesando...' : 'Confirmar pago'}
      </Button>
    </>
  )

  return (
    <Modal show={show} onHide={handleClose} title="Registrar pago de comisiones" size="small" centered footer={footer}>
      <p className="mb-2">
        Se marcaran como <strong>pagadas</strong> {count} comision{count === 1 ? '' : 'es'}
        {' '}por un total de <strong>{totalAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong>.
      </p>

      {errorMessage && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle me-1" />
          {errorMessage}
        </div>
      )}

      <label className="form-label small text-muted mb-1">Referencia de pago</label>
      <input
        type="text"
        className="form-control"
        placeholder="Ej: SPEI-000123 o folio de nomina"
        value={paymentReference}
        onChange={(e) => setPaymentReference(e.target.value)}
        autoFocus
      />
    </Modal>
  )
}

export default PayBatchModal
