/**
 * AR RECEIPT FORM COMPONENT
 * Form for creating receipts against AR invoices following Phase 1 requirements
 * Similar to APPaymentForm but for Accounts Receivable
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Button, todayDateInput } from '@lwm/ui'
import { useActivePaymentMethods } from '../hooks/usePaymentMethods'
import type { ARReceiptForm, ARInvoice, BankAccount } from '../types'

interface ARReceiptFormProps {
  arInvoice: ARInvoice
  onSubmit: (data: ARReceiptForm) => void
  onCancel: () => void
  isLoading?: boolean
  bankAccounts?: BankAccount[]
}

export const ARReceiptFormComponent = ({
  arInvoice,
  onSubmit,
  onCancel,
  isLoading = false,
  bankAccounts = []
}: ARReceiptFormProps) => {
  const remainingBalance = arInvoice.totalAmount - arInvoice.paidAmount

  const { activePaymentMethods } = useActivePaymentMethods()
  const [formData, setFormData] = useState<ARReceiptForm>({
    paymentNumber: '',
    contactId: Number(arInvoice.contactId),
    paymentDate: todayDateInput(),
    paymentMethodId: 0,
    currency: arInvoice.currency || 'MXN',
    amount: remainingBalance,
    bankAccountId: 0,
    status: 'unapplied',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ARReceiptForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Debe seleccionar un método de cobro'
    }
    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Debe seleccionar una cuenta bancaria'
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de cobro es obligatoria'
    }
    const amountNum = Number(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero'
    }
    if (amountNum > remainingBalance) {
      newErrors.amount = `El monto no puede ser mayor al saldo pendiente (${remainingBalance})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        contactId: Number(formData.contactId),
        bankAccountId: Number(formData.bankAccountId),
        paymentMethodId: Number(formData.paymentMethodId),
        amount: Number(formData.amount),
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-wallet2 me-2"></i>
          Registrar Cobro
        </h5>
      </div>
      <div className="card-body">
        {/* Invoice Info */}
        <div className="alert alert-info mb-4">
          <div className="row">
            <div className="col-md-6">
              <strong>Factura:</strong> {arInvoice.invoiceNumber}<br />
              <strong>Total:</strong> {formatCurrency(typeof arInvoice.totalAmount === 'string' ? parseFloat(arInvoice.totalAmount) : arInvoice.totalAmount)}
            </div>
            <div className="col-md-6">
              <strong>Cobrado:</strong> {formatCurrency(arInvoice.paidAmount)}<br />
              <strong>Saldo pendiente:</strong> <span className="text-primary fw-bold">{formatCurrency(remainingBalance)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Payment Number */}
          <div className="col-md-6">
            <label htmlFor="paymentNumber" className="form-label">
              Número de Cobro
            </label>
            <input
              type="text"
              id="paymentNumber"
              className={`form-control ${errors.paymentNumber ? 'is-invalid' : ''}`}
              value={formData.paymentNumber}
              onChange={(e) => handleInputChange('paymentNumber', e.target.value)}
              maxLength={255}
              placeholder="Automático (PAY-000001)"
              disabled={isLoading}
            />
            <div className="form-text">Déjalo vacío para que el sistema asigne el folio.</div>
            {errors.paymentNumber && (
              <div className="invalid-feedback">{errors.paymentNumber}</div>
            )}
          </div>

          {/* Bank Account Selection */}
          <div className="col-md-6">
            <label htmlFor="bankAccountId" className="form-label">
              Cuenta Bancaria <span className="text-danger">*</span>
            </label>
            <select
              id="bankAccountId"
              className={`form-select ${errors.bankAccountId ? 'is-invalid' : ''}`}
              value={formData.bankAccountId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bankAccountId: Number(e.target.value) || 0 }))}
              disabled={isLoading}
            >
              <option value="">Seleccionar cuenta...</option>
              {bankAccounts.filter(account => account.status === 'active').map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountNumber} ({account.currency})
                </option>
              ))}
            </select>
            {errors.bankAccountId && (
              <div className="invalid-feedback">{errors.bankAccountId}</div>
            )}
          </div>

          {/* Receipt Date */}
          <div className="col-md-6">
            <label htmlFor="paymentDate" className="form-label">
              Fecha de Cobro <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="paymentDate"
              className={`form-control ${errors.paymentDate ? 'is-invalid' : ''}`}
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              disabled={isLoading}
            />
            {errors.paymentDate && (
              <div className="invalid-feedback">{errors.paymentDate}</div>
            )}
          </div>

          {/* Receipt Amount */}
          <div className="col-md-4">
            <label htmlFor="amount" className="form-label">
              Monto a Cobrar <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                id="amount"
                className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value === '' ? 0 : Number(e.target.value) }))}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <div className="invalid-feedback">{errors.amount}</div>
              )}
            </div>
            <div className="form-text">
              Máximo: {formatCurrency(remainingBalance)}
            </div>
          </div>

          {/* Currency */}
          <div className="col-md-4">
            <label htmlFor="currency" className="form-label">
              Moneda
            </label>
            <select
              id="currency"
              className="form-select"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              disabled={isLoading}
            >
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="col-md-4">
            <label htmlFor="paymentMethodId" className="form-label">
              Método de Cobro <span className="text-danger">*</span>
            </label>
            <select
              id="paymentMethodId"
              className={`form-select ${errors.paymentMethodId ? 'is-invalid' : ''}`}
              value={formData.paymentMethodId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: Number(e.target.value) || 0 }))}
              disabled={isLoading}
            >
              <option value="">Seleccionar método...</option>
              {activePaymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
            {errors.paymentMethodId && (
              <div className="invalid-feedback">{errors.paymentMethodId}</div>
            )}
          </div>

          {/* Form Actions */}
          <div className="col-12">
            <hr />
            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Registrar Cobro
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}