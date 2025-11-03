'use client'

/**
 * Payment Application Form Component
 * Create and edit payment applications to invoices
 * Features: Payment/Invoice selection, amount validation, date handling
 */

import React, { useState, useEffect } from 'react'
import { usePaymentApplication, usePaymentApplicationMutations } from '../hooks'
import { PaymentApplicationForm as PaymentApplicationFormType } from '../types'

interface PaymentApplicationFormProps {
  applicationId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const PaymentApplicationForm: React.FC<PaymentApplicationFormProps> = ({
  applicationId,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!applicationId
  const { application, isLoading: isLoadingApplication } = usePaymentApplication(applicationId || null)
  const { createApplication, updateApplication } = usePaymentApplicationMutations()

  const [applicationType, setApplicationType] = useState<'ar' | 'ap'>('ar')
  const [formData, setFormData] = useState<PaymentApplicationFormType>({
    paymentId: '',
    arInvoiceId: null,
    apInvoiceId: null,
    amount: '',
    applicationDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing data when editing
  useEffect(() => {
    if (application && isEditing) {
      setFormData({
        paymentId: application.paymentId,
        arInvoiceId: application.arInvoiceId,
        apInvoiceId: application.apInvoiceId,
        amount: application.amount,
        applicationDate: application.applicationDate
      })
      setApplicationType(application.arInvoiceId ? 'ar' : 'ap')
    }
  }, [application, isEditing])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentId.trim()) {
      newErrors.paymentId = 'El ID de pago es requerido'
    }

    if (applicationType === 'ar' && !formData.arInvoiceId?.trim()) {
      newErrors.arInvoiceId = 'El ID de factura AR es requerido'
    }

    if (applicationType === 'ap' && !formData.apInvoiceId?.trim()) {
      newErrors.apInvoiceId = 'El ID de factura AP es requerido'
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'El monto es requerido'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero'
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = 'La fecha de aplicación es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    // Prepare data based on application type
    const submitData: PaymentApplicationFormType = {
      paymentId: formData.paymentId,
      arInvoiceId: applicationType === 'ar' ? formData.arInvoiceId : null,
      apInvoiceId: applicationType === 'ap' ? formData.apInvoiceId : null,
      amount: formData.amount,
      applicationDate: formData.applicationDate
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      if (isEditing && applicationId) {
        await updateApplication(applicationId, submitData)
        showToast('Aplicación de pago actualizada correctamente', 'success')
      } else {
        await createApplication(submitData)
        showToast('Aplicación de pago creada correctamente', 'success')
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error submitting payment application:', error)
      setErrors({
        submit: error.response?.data?.errors?.[0]?.detail || 'Error al guardar la aplicación de pago'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`
    toast.style.zIndex = '9999'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  if (isLoadingApplication && isEditing) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                {isEditing ? 'Editar Aplicación de Pago' : 'Nueva Aplicación de Pago'}
              </h4>
            </div>
            <div className="card-body">
              {errors.submit && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Application Type */}
                {!isEditing && (
                  <div className="mb-4">
                    <label className="form-label">
                      Tipo de Aplicación <span className="text-danger">*</span>
                    </label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        id="typeAR"
                        name="applicationType"
                        checked={applicationType === 'ar'}
                        onChange={() => {
                          setApplicationType('ar')
                          setFormData({ ...formData, apInvoiceId: null })
                        }}
                        disabled={isSubmitting}
                      />
                      <label className="btn btn-outline-success" htmlFor="typeAR">
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Cobro (AR Invoice)
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        id="typeAP"
                        name="applicationType"
                        checked={applicationType === 'ap'}
                        onChange={() => {
                          setApplicationType('ap')
                          setFormData({ ...formData, arInvoiceId: null })
                        }}
                        disabled={isSubmitting}
                      />
                      <label className="btn btn-outline-warning" htmlFor="typeAP">
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Pago (AP Invoice)
                      </label>
                    </div>
                  </div>
                )}

                {/* Payment ID */}
                <div className="mb-3">
                  <label htmlFor="paymentId" className="form-label">
                    ID de Pago <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="paymentId"
                    className={`form-control ${errors.paymentId ? 'is-invalid' : ''}`}
                    value={formData.paymentId}
                    onChange={(e) => setFormData({ ...formData, paymentId: e.target.value })}
                    placeholder="ID del pago a aplicar"
                    disabled={isSubmitting}
                  />
                  {errors.paymentId && (
                    <div className="invalid-feedback">{errors.paymentId}</div>
                  )}
                  <div className="form-text">
                    ID del pago que se aplicará a la factura
                  </div>
                </div>

                {/* AR Invoice ID */}
                {applicationType === 'ar' && (
                  <div className="mb-3">
                    <label htmlFor="arInvoiceId" className="form-label">
                      ID de Factura AR (Cobro) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="arInvoiceId"
                      className={`form-control ${errors.arInvoiceId ? 'is-invalid' : ''}`}
                      value={formData.arInvoiceId || ''}
                      onChange={(e) => setFormData({ ...formData, arInvoiceId: e.target.value })}
                      placeholder="ID de la factura de cobro"
                      disabled={isSubmitting}
                    />
                    {errors.arInvoiceId && (
                      <div className="invalid-feedback">{errors.arInvoiceId}</div>
                    )}
                    <div className="form-text">
                      Factura de cuentas por cobrar a la que se aplicará el pago
                    </div>
                  </div>
                )}

                {/* AP Invoice ID */}
                {applicationType === 'ap' && (
                  <div className="mb-3">
                    <label htmlFor="apInvoiceId" className="form-label">
                      ID de Factura AP (Pago) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="apInvoiceId"
                      className={`form-control ${errors.apInvoiceId ? 'is-invalid' : ''}`}
                      value={formData.apInvoiceId || ''}
                      onChange={(e) => setFormData({ ...formData, apInvoiceId: e.target.value })}
                      placeholder="ID de la factura de pago"
                      disabled={isSubmitting}
                    />
                    {errors.apInvoiceId && (
                      <div className="invalid-feedback">{errors.apInvoiceId}</div>
                    )}
                    <div className="form-text">
                      Factura de cuentas por pagar a la que se aplicará el pago
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="mb-3">
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
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isSubmitting}
                    />
                    {errors.amount && (
                      <div className="invalid-feedback">{errors.amount}</div>
                    )}
                  </div>
                  <div className="form-text">
                    Monto del pago a aplicar a la factura
                  </div>
                </div>

                {/* Application Date */}
                <div className="mb-4">
                  <label htmlFor="applicationDate" className="form-label">
                    Fecha de Aplicación <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    id="applicationDate"
                    className={`form-control ${errors.applicationDate ? 'is-invalid' : ''}`}
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.applicationDate && (
                    <div className="invalid-feedback">{errors.applicationDate}</div>
                  )}
                  <div className="form-text">
                    Fecha en la que se realiza la aplicación del pago
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2">
                  {onCancel && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        {isEditing ? 'Actualizar' : 'Crear'} Aplicación
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Card */}
          <div className="card mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información sobre Aplicaciones de Pago
              </h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li><strong>AR (Cuentas por Cobrar):</strong> Aplicación de cobros a facturas de clientes</li>
                <li><strong>AP (Cuentas por Pagar):</strong> Aplicación de pagos a facturas de proveedores</li>
                <li>El monto no puede exceder el saldo pendiente de la factura</li>
                <li>Un mismo pago puede aplicarse a múltiples facturas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
