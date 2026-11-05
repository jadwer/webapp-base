'use client'

/**
 * Captura de la factura del proveedor sobre una cuenta por pagar nacida de la
 * recepcion de una orden de compra. La orden no lleva IVA (decision de la
 * contadora); aqui se registran el folio o UUID y el IVA de la factura real.
 * El subtotal debe coincidir con lo recibido; el backend lo valida.
 */

import React, { useState } from 'react'
import { Modal, Button } from '@lwm/ui'
import { apInvoicesService } from '../services'
import type { APInvoice } from '../types'
import { getFinanceErrorMessage } from '../utils/errors'

interface SupplierInvoiceModalProps {
  isOpen: boolean
  apInvoice: APInvoice
  onClose: () => void
  onSuccess: () => void
}

const money = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

export const SupplierInvoiceModal = ({ isOpen, apInvoice, onClose, onSuccess }: SupplierInvoiceModalProps) => {
  const subtotal = Number(apInvoice.subtotal) || 0
  const [number, setNumber] = useState('')
  const [uuid, setUuid] = useState('')
  const [tax, setTax] = useState((Math.round(subtotal * 16) / 100).toFixed(2))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const taxNumber = Number(tax)
  const canSubmit = number.trim() !== '' && tax !== '' && !Number.isNaN(taxNumber) && taxNumber >= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await apInvoicesService.captureSupplierInvoice(apInvoice.id, {
        supplierInvoiceNumber: number.trim(),
        supplierUuid: uuid.trim() || undefined,
        subtotal,
        taxAmount: taxNumber,
      })
      onSuccess()
    } catch (error: unknown) {
      setSubmitError(getFinanceErrorMessage(error, 'No se pudo capturar la factura del proveedor.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      show={isOpen}
      onHide={() => !isSubmitting && onClose()}
      title="Capturar factura del proveedor"
      size="medium"
      closable={!isSubmitting}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="supplier-invoice-form" variant="primary" disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
            Capturar factura
          </Button>
        </div>
      }
    >
      <p className="text-muted small">
        Registra los datos de la factura que te mandó el proveedor. El subtotal es lo recibido en la orden de
        compra; si su factura trae otro subtotal, corrige primero la orden.
      </p>
      {submitError && (
        <div className="alert alert-danger" role="alert">
          {submitError}
        </div>
      )}
      <form id="supplier-invoice-form" onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="supplierInvoiceNumber" className="form-label">Folio de la factura *</label>
          <input id="supplierInvoiceNumber" className="form-control" value={number} maxLength={60}
            onChange={(e) => setNumber(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label htmlFor="supplierUuid" className="form-label">UUID (folio fiscal)</label>
          <input id="supplierUuid" className="form-control" value={uuid} placeholder="opcional"
            onChange={(e) => setUuid(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Subtotal recibido</label>
          <input className="form-control" value={money(subtotal)} readOnly disabled />
        </div>
        <div className="col-md-6">
          <label htmlFor="supplierTax" className="form-label">IVA de la factura *</label>
          <input id="supplierTax" type="number" min="0" step="0.01" className="form-control" value={tax}
            onChange={(e) => setTax(e.target.value)} required />
          <div className="form-text">Sugerido al 16 %; usa el de la factura (0 si no lleva).</div>
        </div>
        <div className="col-12 text-end fw-bold">
          Total de la factura: {money(subtotal + (Number.isNaN(taxNumber) ? 0 : taxNumber))}
        </div>
      </form>
    </Modal>
  )
}

export default SupplierInvoiceModal
