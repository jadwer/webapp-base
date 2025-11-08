/**
 * AR RECEIPT FORM COMPONENT
 * Form for creating receipts against AR invoices following Phase 1 requirements
 * Similar to APPaymentForm but for Accounts Receivable
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
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
  const [formData, setFormData] = useState<ARReceiptForm>({
    contactId: arInvoice.contactId,
    receiptDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'transfer',
    currency: arInvoice.currency || 'MXN',
    amount: arInvoice.remainingBalance.toString(),
    bankAccountId: null,
    status: 'draft',
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

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Debe seleccionar una cuenta bancaria'
    }
    if (!formData.receiptDate) {
      newErrors.receiptDate = 'La fecha de cobro es obligatoria'
    }
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero'
    }
    if (amountNum > arInvoice.remainingBalance) {
      newErrors.amount = `El monto no puede ser mayor al saldo pendiente (${arInvoice.remainingBalance})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
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
              <strong>Total:</strong> {formatCurrency(typeof arInvoice.total === 'string' ? parseFloat(arInvoice.total) : arInvoice.total)}
            </div>
            <div className="col-md-6">
              <strong>Cobrado:</strong> {formatCurrency(arInvoice.paidAmount)}<br />
              <strong>Saldo pendiente:</strong> <span className="text-primary fw-bold">{formatCurrency(arInvoice.remainingBalance)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Bank Account Selection */}
          <div className="col-md-6">
            <label htmlFor="bankAccountId" className="form-label">
              Cuenta Bancaria <span className="text-danger">*</span>
            </label>
            <select
              id="bankAccountId"
              className={`form-select ${errors.bankAccountId ? 'is-invalid' : ''}`}
              value={formData.bankAccountId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bankAccountId: e.target.value || null }))}
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
            <label htmlFor="receiptDate" className="form-label">
              Fecha de Cobro <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="receiptDate"
              className={`form-control ${errors.receiptDate ? 'is-invalid' : ''}`}
              value={formData.receiptDate}
              onChange={(e) => handleInputChange('receiptDate', e.target.value)}
              disabled={isLoading}
            />
            {errors.receiptDate && (
              <div className="invalid-feedback">{errors.receiptDate}</div>
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
                onChange={(e) => handleInputChange('amount', e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <div className="invalid-feedback">{errors.amount}</div>
              )}
            </div>
            <div className="form-text">
              Máximo: {formatCurrency(arInvoice.remainingBalance)}
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
            <label htmlFor="paymentMethod" className="form-label">
              Método de Cobro
            </label>
            <select
              id="paymentMethod"
              className="form-select"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              disabled={isLoading}
            >
              <option value="transfer">Transferencia Bancaria</option>
              <option value="check">Cheque</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
            </select>
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