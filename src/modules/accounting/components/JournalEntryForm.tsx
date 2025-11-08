'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { JournalEntry, JournalEntryWithLines, JournalLineForm } from '../types'
import { usePostableAccounts } from '../hooks'

interface JournalEntryFormProps {
  journalEntry?: JournalEntry
  isLoading?: boolean
  onSubmit: (data: JournalEntryWithLines) => Promise<void>
  onCancel?: () => void
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  journalEntry,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const { postableAccounts } = usePostableAccounts()

  const [formData, setFormData] = useState({
    date: journalEntry?.date || new Date().toISOString().split('T')[0],
    description: journalEntry?.description || '',
    reference: journalEntry?.reference || '',
    currency: journalEntry?.currency || 'MXN',
    exchangeRate: journalEntry?.exchangeRate || '1.00'
  })

  const [lines, setLines] = useState<JournalLineForm[]>([
    { accountId: '', debit: '0.00', credit: '0.00', memo: '' },
    { accountId: '', debit: '0.00', credit: '0.00', memo: '' }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (journalEntry) {
      setFormData({
        date: journalEntry.date,
        description: journalEntry.description,
        reference: journalEntry.reference || '',
        currency: journalEntry.currency,
        exchangeRate: journalEntry.exchangeRate
      })
    }
  }, [journalEntry])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    // Validate lines
    const validLines = lines.filter(line => line.accountId)
    if (validLines.length < 2) {
      newErrors.lines = 'Se requieren al menos 2 líneas con cuenta asignada'
    }

    // Validate balance (debits must equal credits)
    const totalDebit = lines.reduce((sum, line) => sum + parseFloat(line.debit || '0'), 0)
    const totalCredit = lines.reduce((sum, line) => sum + parseFloat(line.credit || '0'), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      newErrors.balance = `Póliza descuadrada: Débito ($${totalDebit.toFixed(2)}) ≠ Crédito ($${totalCredit.toFixed(2)})`
    }

    // Validate each line
    validLines.forEach((line, index) => {
      const debit = parseFloat(line.debit || '0')
      const credit = parseFloat(line.credit || '0')

      if (debit === 0 && credit === 0) {
        newErrors[`line_${index}_amount`] = 'Debe tener débito o crédito'
      }

      if (debit > 0 && credit > 0) {
        newErrors[`line_${index}_both`] = 'No puede tener débito y crédito al mismo tiempo'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLineChange = (index: number, field: keyof JournalLineForm, value: string) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)

    // Clear balance error when lines change
    if (errors.balance) {
      setErrors(prev => ({ ...prev, balance: '' }))
    }
  }

  const addLine = () => {
    setLines([...lines, { accountId: '', debit: '0.00', credit: '0.00', memo: '' }])
  }

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) {
      return
    }

    // Filter only lines with account assigned
    const validLines = lines.filter(line => line.accountId)

    const submitData: JournalEntryWithLines = {
      date: formData.date,
      description: formData.description.trim(),
      ...(formData.reference && { reference: formData.reference.trim() }),
      ...(formData.currency && { currency: formData.currency }),
      ...(formData.exchangeRate && { exchangeRate: formData.exchangeRate }),
      lines: validLines
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  const totalDebit = lines.reduce((sum, line) => sum + parseFloat(line.debit || '0'), 0)
  const totalCredit = lines.reduce((sum, line) => sum + parseFloat(line.credit || '0'), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-12">
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de la Póliza
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Input
                    label="Fecha"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    onBlur={() => handleBlur('date')}
                    errorText={touched.date ? errors.date : ''}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Input
                    label="Descripción"
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    errorText={touched.description ? errors.description : ''}
                    required
                    placeholder="Descripción de la póliza"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <Input
                    label="Referencia"
                    type="text"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="Opcional"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Líneas de la Póliza
              </h6>
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={addLine}
                disabled={isLoading}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Agregar línea
              </Button>
            </div>
            <div className="card-body">
              {errors.lines && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.lines}
                </div>
              )}

              {errors.balance && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {errors.balance}
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Cuenta</th>
                      <th style={{ width: '25%' }}>Concepto</th>
                      <th style={{ width: '15%' }} className="text-end">Débito</th>
                      <th style={{ width: '15%' }} className="text-end">Crédito</th>
                      <th style={{ width: '10%' }} className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className={`form-select form-select-sm ${errors[`line_${index}_account`] ? 'is-invalid' : ''}`}
                            value={line.accountId}
                            onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">Seleccionar cuenta...</option>
                            {postableAccounts.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={line.memo || ''}
                            onChange={(e) => handleLineChange(index, 'memo', e.target.value)}
                            placeholder="Concepto"
                            disabled={isLoading}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={`form-control form-control-sm text-end ${errors[`line_${index}_amount`] || errors[`line_${index}_both`] ? 'is-invalid' : ''}`}
                            value={line.debit}
                            onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                            disabled={isLoading}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={`form-control form-control-sm text-end ${errors[`line_${index}_amount`] || errors[`line_${index}_both`] ? 'is-invalid' : ''}`}
                            value={line.credit}
                            onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                            disabled={isLoading}
                          />
                        </td>
                        <td className="text-center">
                          {lines.length > 2 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeLine(index)}
                              disabled={isLoading}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={`fw-bold ${isBalanced ? 'table-success' : 'table-danger'}`}>
                      <td colSpan={2} className="text-end">TOTALES:</td>
                      <td className="text-end">${totalDebit.toFixed(2)}</td>
                      <td className="text-end">${totalCredit.toFixed(2)}</td>
                      <td className="text-center">
                        {isBalanced ? (
                          <i className="bi bi-check-circle text-success"></i>
                        ) : (
                          <i className="bi bi-x-circle text-danger"></i>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            buttonStyle="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading || !isBalanced}
        >
          <i className="bi bi-check-lg me-2"></i>
          {journalEntry ? 'Actualizar póliza' : 'Crear póliza'}
        </Button>
      </div>
    </form>
  )
}

export default JournalEntryForm
