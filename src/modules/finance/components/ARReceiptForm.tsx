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
    aRInvoiceId: parseInt(arInvoice.id),
    bankAccountId: 0,
    receiptDate: new Date().toISOString().split('T')[0], // Note: receiptDate not paymentDate
    amount: arInvoice.remainingBalance,
    paymentMethod: 'transfer',
    reference: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ARReceiptForm, value: string | number) => {
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
    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero'
    }
    if (formData.amount > arInvoice.remainingBalance) {
      newErrors.amount = `El monto no puede ser mayor al saldo pendiente (${arInvoice.remainingBalance})`
    }
    if (!formData.reference.trim()) {
      newErrors.reference = 'La referencia es obligatoria'
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
              <strong>Total:</strong> {formatCurrency(arInvoice.total)}
            </div>
            <div className="col-md-6">
              <strong>Cobrado:</strong> {formatCurrency(arInvoice.collectedAmount)}<br />
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
              value={formData.bankAccountId}
              onChange={(e) => handleInputChange('bankAccountId', parseInt(e.target.value))}
              disabled={isLoading}
            >
              <option value="0">Seleccionar cuenta...</option>
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
          <div className="col-md-6">
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
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                min="0"
                max={arInvoice.remainingBalance}
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

          {/* Payment Method */}
          <div className="col-md-6">
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

          {/* Reference */}
          <div className="col-12">
            <label htmlFor="reference" className="form-label">
              Referencia/Concepto <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="reference"
              className={`form-control ${errors.reference ? 'is-invalid' : ''}`}
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              disabled={isLoading}
              placeholder="Número de depósito, transferencia, etc."
            />
            {errors.reference && (
              <div className="invalid-feedback">{errors.reference}</div>
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