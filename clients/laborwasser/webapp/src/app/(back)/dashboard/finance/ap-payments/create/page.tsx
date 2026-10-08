/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import {
  useAPPaymentMutations,
  useBankAccounts,
  useActivePaymentMethods,
  getFinanceErrorMessage,
} from '@/modules/finance'
import { useContacts } from '@/modules/contacts'
import { Button } from '@/ui/components/base/Button'
import type { APPaymentForm } from '@/modules/finance'
import { todayDateInput } from '@lwm/ui'

// Pagos y cobros se guardan en el recurso `payments`. Fecha, contacto, cuenta
// bancaria, metodo y monto son obligatorios; el folio es opcional (el backend
// genera PAY-000001). Los numeros viajan como number.
export default function CreateAPPaymentPage() {
  const navigation = useNavigationProgress()
  const { createAPPayment } = useAPPaymentMutations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { contacts, isLoading: contactsLoading } = useContacts({
    filters: { isSupplier: true }
  })

  const { bankAccounts, isLoading: bankAccountsLoading } = useBankAccounts({
    filters: { is_active: true }
  })

  const { activePaymentMethods, isLoading: paymentMethodsLoading } = useActivePaymentMethods()

  const [formData, setFormData] = useState({
    paymentNumber: '',
    contactId: '',
    paymentDate: todayDateInput(),
    paymentMethodId: '',
    currency: 'MXN',
    amount: '',
    bankAccountId: '',
    reference: '',
    notes: '',
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amount = Number(formData.amount)
    if (!formData.contactId || !formData.paymentDate ||
        !formData.paymentMethodId || !formData.bankAccountId || !formData.amount) {
      setError('Completa los campos obligatorios: proveedor, fecha, monto, método de pago y cuenta bancaria.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }

    const payload: APPaymentForm = {
      ...(formData.paymentNumber.trim() ? { paymentNumber: formData.paymentNumber.trim() } : {}),
      paymentDate: formData.paymentDate,
      contactId: Number(formData.contactId),
      bankAccountId: Number(formData.bankAccountId),
      paymentMethodId: Number(formData.paymentMethodId),
      amount,
      currency: formData.currency,
      ...(formData.reference ? { reference: formData.reference } : {}),
      ...(formData.notes ? { notes: formData.notes } : {}),
    }

    setIsLoading(true)
    try {
      await createAPPayment(payload)
      navigation.push('/dashboard/finance/ap-payments')
    } catch (err) {
      setError(getFinanceErrorMessage(err, 'Error al crear el pago a proveedor'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Nuevo Pago a Proveedor
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="paymentNumber" className="form-label">
                      Folio
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="paymentNumber"
                      value={formData.paymentNumber}
                      onChange={(e) => handleChange('paymentNumber', e.target.value)}
                      maxLength={255}
                      placeholder="Automático (PAY-000001)"
                    />
                    <div className="form-text">Déjalo vacío para que el sistema asigne el folio.</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="contactId" className="form-label">
                      Proveedor <span className="text-danger">*</span>
                    </label>
                    <select
                      id="contactId"
                      className="form-select"
                      value={formData.contactId}
                      onChange={(e) => handleChange('contactId', e.target.value)}
                      disabled={contactsLoading || isLoading}
                      required
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {contacts?.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name || `Proveedor ID: ${contact.id}`}
                        </option>
                      ))}
                    </select>
                    {contactsLoading && (
                      <div className="form-text text-muted">Cargando proveedores...</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="paymentDate" className="form-label">
                      Fecha de Pago <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="paymentDate"
                      value={formData.paymentDate}
                      onChange={(e) => handleChange('paymentDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="amount" className="form-label">
                      Monto <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="currency" className="form-label">
                      Moneda
                    </label>
                    <select
                      className="form-select"
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="paymentMethodId" className="form-label">
                      Método de Pago <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="paymentMethodId"
                      value={formData.paymentMethodId}
                      onChange={(e) => handleChange('paymentMethodId', e.target.value)}
                      disabled={paymentMethodsLoading || isLoading}
                      required
                    >
                      <option value="">Seleccionar método...</option>
                      {activePaymentMethods?.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="bankAccountId" className="form-label">
                      Cuenta Bancaria <span className="text-danger">*</span>
                    </label>
                    <select
                      id="bankAccountId"
                      className="form-select"
                      value={formData.bankAccountId}
                      onChange={(e) => handleChange('bankAccountId', e.target.value)}
                      disabled={bankAccountsLoading || isLoading}
                      required
                    >
                      <option value="">Seleccionar cuenta...</option>
                      {bankAccounts?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber} ({account.currency})
                        </option>
                      ))}
                    </select>
                    {bankAccountsLoading && (
                      <div className="form-text text-muted">Cargando cuentas bancarias...</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="reference" className="form-label">
                      Referencia
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => handleChange('reference', e.target.value)}
                      maxLength={255}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="notes" className="form-label">
                      Notas
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Crear Pago
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigation.back()}
                    disabled={isLoading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            El pago se registra sin aplicar a facturas. La aplicación a facturas por pagar estará disponible en una fase posterior.
          </div>
        </div>
      </div>
    </div>
  )
}
