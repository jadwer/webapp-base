/**
 * REGISTER PAYMENT MODAL
 * Modal para registrar un pago (cobro) sobre una factura AR (Cuentas por Cobrar).
 *
 * Backend: POST /api/v1/ar-invoices/{id}/register-payment
 * body: { payment_date, amount, forma_pago, reference?, comments? }
 * -> 200 { message, invoice: { id, total_amount, paid_amount, balance, status } }
 * -> 422 sobrepago / forma de pago invalida / factura cancelada
 */

'use client'

import React, { useState } from 'react'
import { Modal } from '@/ui/components/base/Modal'
import { Button } from '@/ui/components/base/Button'
import { useFormaPagoOptions, useRegisterARPayment } from '../hooks'
import type { ARInvoice, RegisterARPaymentForm } from '../types'

interface RegisterPaymentModalProps {
  isOpen: boolean
  arInvoice: ARInvoice | null
  onClose: () => void
  onSuccess: (result: { id: string; totalAmount: number; paidAmount: number; balance: number; status: string }) => void
}

interface AxiosLikeError {
  response?: {
    status?: number
    data?: {
      message?: string
      errors?: Array<{ detail?: string; title?: string }>
    }
  }
  message?: string
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosLikeError
    const data = axiosError.response?.data
    if (data?.message) return data.message
    if (data?.errors && data.errors.length > 0) {
      return data.errors[0].detail || data.errors[0].title || fallback
    }
  }
  if (error instanceof Error) return error.message
  return fallback
}

export const RegisterPaymentModal = ({
  isOpen,
  arInvoice,
  onClose,
  onSuccess,
}: RegisterPaymentModalProps) => {
  const { formaPagoOptions, isLoading: loadingFormaPago } = useFormaPagoOptions()
  const { registerPayment } = useRegisterARPayment()

  const balance = arInvoice ? arInvoice.totalAmount - arInvoice.paidAmount : 0
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<RegisterARPaymentForm>({
    paymentDate: today,
    amount: balance,
    formaPago: '',
    reference: '',
    comments: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form whenever a different invoice is opened
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null)
  if (arInvoice && arInvoice.id !== lastInvoiceId) {
    setLastInvoiceId(arInvoice.id)
    setFormData({
      paymentDate: today,
      amount: arInvoice.totalAmount - arInvoice.paidAmount,
      formaPago: '',
      reference: '',
      comments: '',
    })
    setErrors({})
    setSubmitError(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: arInvoice?.currency || 'MXN',
    }).format(amount)
  }

  const handleChange = (field: keyof RegisterARPaymentForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de pago es obligatoria'
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero'
    } else if (formData.amount > balance) {
      newErrors.amount = `El monto no puede ser mayor al saldo pendiente (${formatCurrency(balance)})`
    }
    if (!formData.formaPago) {
      newErrors.formaPago = 'Debe seleccionar una forma de pago'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!arInvoice) return
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await registerPayment(arInvoice.id, formData)
      onSuccess({
        id: response.invoice.id,
        totalAmount: response.invoice.totalAmount,
        paidAmount: response.invoice.paidAmount,
        balance: response.invoice.balance,
        status: response.invoice.status,
      })
    } catch (error: unknown) {
      setSubmitError(extractErrorMessage(error, 'No se pudo registrar el pago. Intente nuevamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  if (!arInvoice) return null

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      title="Registrar Pago"
      size="medium"
      closable={!isSubmitting}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="register-payment-form" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2" />
                Registrar Pago
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="alert alert-info mb-4">
        <div className="row">
          <div className="col-md-6">
            <strong>Factura:</strong> {arInvoice.invoiceNumber}
            <br />
            <strong>Total:</strong> {formatCurrency(arInvoice.totalAmount)}
          </div>
          <div className="col-md-6">
            <strong>Pagado:</strong> {formatCurrency(arInvoice.paidAmount)}
            <br />
            <strong>Saldo pendiente:</strong>{' '}
            <span className="text-primary fw-bold">{formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="alert alert-danger mb-4" role="alert">
          {submitError}
        </div>
      )}

      <form id="register-payment-form" onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="paymentDate" className="form-label">
            Fecha de Pago <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            id="paymentDate"
            className={`form-control ${errors.paymentDate ? 'is-invalid' : ''}`}
            value={formData.paymentDate}
            onChange={(e) => handleChange('paymentDate', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.paymentDate && <div className="invalid-feedback">{errors.paymentDate}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="amount" className="form-label">
            Monto <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              id="amount"
              className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              disabled={isSubmitting}
              min="0"
              max={balance}
              step="0.01"
            />
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>
          <div className="form-text">Máximo: {formatCurrency(balance)}</div>
        </div>

        <div className="col-md-6">
          <label htmlFor="formaPago" className="form-label">
            Forma de Pago <span className="text-danger">*</span>
          </label>
          <select
            id="formaPago"
            className={`form-select ${errors.formaPago ? 'is-invalid' : ''}`}
            value={formData.formaPago}
            onChange={(e) => handleChange('formaPago', e.target.value)}
            disabled={isSubmitting || loadingFormaPago}
          >
            <option value="">
              {loadingFormaPago ? 'Cargando...' : 'Seleccionar forma de pago...'}
            </option>
            {formaPagoOptions.map((option) => (
              <option key={option.clave} value={option.clave}>
                {option.clave} - {option.descripcion}
              </option>
            ))}
          </select>
          {errors.formaPago && <div className="invalid-feedback">{errors.formaPago}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="reference" className="form-label">
            Referencia
          </label>
          <input
            type="text"
            id="reference"
            className="form-control"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            disabled={isSubmitting}
            placeholder="Numero de transferencia, cheque, etc."
          />
        </div>

        <div className="col-12">
          <label htmlFor="comments" className="form-label">
            Comentarios
          </label>
          <textarea
            id="comments"
            className="form-control"
            rows={2}
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  )
}
