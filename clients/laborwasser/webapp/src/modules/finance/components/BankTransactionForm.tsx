/**
 * BankTransaction Form Component
 *
 * Form for creating and editing bank transactions.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import { Alert } from '@/ui/components/base/Alert'
import { useBankAccounts } from '../hooks'
import type { BankTransactionFormData, BankTransactionType, ReconciliationStatus } from '../types'
import { BANK_TRANSACTION_TYPE_OPTIONS, RECONCILIATION_STATUS_OPTIONS } from '../types'

interface BankTransactionFormProps {
  initialData?: Partial<BankTransactionFormData>
  onSubmit: (data: BankTransactionFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  isLoading?: boolean
}

const defaultFormData: BankTransactionFormData = {
  bankAccountId: 0,
  transactionDate: new Date().toISOString().split('T')[0],
  amount: 0,
  transactionType: 'debit',
  reference: '',
  description: '',
  reconciliationStatus: 'unreconciled',
  statementNumber: '',
  runningBalance: undefined,
  isActive: true,
}

export const BankTransactionFormComponent: React.FC<BankTransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BankTransactionFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch bank accounts for dropdown
  const { bankAccounts, isLoading: loadingAccounts } = useBankAccounts()

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
      })
    }
  }, [initialData])

  const handleChange = (field: keyof BankTransactionFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.bankAccountId || formData.bankAccountId === 0) {
      newErrors.bankAccountId = 'La cuenta bancaria es requerida'
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'La fecha de transaccion es requerida'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.transactionType) {
      newErrors.transactionType = 'El tipo de transaccion es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al guardar la transaccion')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {submitError && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {submitError}
        </Alert>
      )}

      <div className="row g-3">
        {/* Bank Account */}
        <div className="col-md-6">
          <label htmlFor="bankAccountId" className="form-label">
            Cuenta Bancaria <span className="text-danger">*</span>
          </label>
          <select
            id="bankAccountId"
            className={`form-select ${errors.bankAccountId ? 'is-invalid' : ''}`}
            value={formData.bankAccountId}
            onChange={(e) => handleChange('bankAccountId', Number(e.target.value))}
            disabled={isLoading || loadingAccounts}
          >
            <option value={0}>Seleccionar cuenta...</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName} - {account.bankName} ({account.accountNumber})
              </option>
            ))}
          </select>
          {errors.bankAccountId && <div className="invalid-feedback">{errors.bankAccountId}</div>}
        </div>

        {/* Transaction Date */}
        <div className="col-md-6">
          <label htmlFor="transactionDate" className="form-label">
            Fecha de Transaccion <span className="text-danger">*</span>
          </label>
          <Input
            id="transactionDate"
            type="date"
            value={formData.transactionDate}
            onChange={(e) => handleChange('transactionDate', e.target.value)}
            errorText={errors.transactionDate}
            disabled={isLoading}
          />
        </div>

        {/* Transaction Type */}
        <div className="col-md-6">
          <label htmlFor="transactionType" className="form-label">
            Tipo de Transaccion <span className="text-danger">*</span>
          </label>
          <select
            id="transactionType"
            className={`form-select ${errors.transactionType ? 'is-invalid' : ''}`}
            value={formData.transactionType}
            onChange={(e) => handleChange('transactionType', e.target.value as BankTransactionType)}
            disabled={isLoading}
          >
            {BANK_TRANSACTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.transactionType && <div className="invalid-feedback">{errors.transactionType}</div>}
        </div>

        {/* Amount */}
        <div className="col-md-6">
          <label htmlFor="amount" className="form-label">
            Monto <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', Number(e.target.value))}
              errorText={errors.amount}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Reference */}
        <div className="col-md-6">
          <label htmlFor="reference" className="form-label">
            Referencia
          </label>
          <Input
            id="reference"
            type="text"
            placeholder="Numero de referencia o cheque"
            value={formData.reference || ''}
            onChange={(e) => handleChange('reference', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Statement Number */}
        <div className="col-md-6">
          <label htmlFor="statementNumber" className="form-label">
            Numero de Estado de Cuenta
          </label>
          <Input
            id="statementNumber"
            type="text"
            placeholder="Ej: 2025-01"
            value={formData.statementNumber || ''}
            onChange={(e) => handleChange('statementNumber', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div className="col-12">
          <label htmlFor="description" className="form-label">
            Descripcion
          </label>
          <textarea
            id="description"
            className="form-control"
            rows={3}
            placeholder="Descripcion de la transaccion..."
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Reconciliation Status (only for edit) */}
        {isEdit && (
          <div className="col-md-6">
            <label htmlFor="reconciliationStatus" className="form-label">
              Estado de Conciliacion
            </label>
            <select
              id="reconciliationStatus"
              className="form-select"
              value={formData.reconciliationStatus}
              onChange={(e) => handleChange('reconciliationStatus', e.target.value as ReconciliationStatus)}
              disabled={isLoading}
            >
              {RECONCILIATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Running Balance */}
        <div className="col-md-6">
          <label htmlFor="runningBalance" className="form-label">
            Saldo Acumulado
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <Input
              id="runningBalance"
              type="number"
              step="0.01"
              placeholder="Opcional"
              value={formData.runningBalance ?? ''}
              onChange={(e) => handleChange('runningBalance', e.target.value ? Number(e.target.value) : undefined)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="col-12">
          <div className="form-check">
            <input
              id="isActive"
              type="checkbox"
              className="form-check-input"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="form-check-label">
              Transaccion activa
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <Button variant="secondary" buttonStyle="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Guardando...
            </>
          ) : isEdit ? (
            'Actualizar Transaccion'
          ) : (
            'Crear Transaccion'
          )}
        </Button>
      </div>
    </form>
  )
}

export default BankTransactionFormComponent
