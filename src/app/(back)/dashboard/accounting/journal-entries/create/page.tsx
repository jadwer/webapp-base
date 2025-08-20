'use client'

import React from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useJournalEntryMutations, useAccounts } from '@/modules/accounting'
import { Button } from '@/ui/components/base/Button'
import type { JournalEntryForm, JournalLineForm } from '@/modules/accounting/types'

export default function CreateJournalEntryPage() {
  const navigation = useNavigationProgress()
  const { createJournalEntry } = useJournalEntryMutations()
  const { accounts } = useAccounts({ filters: { isPostable: 1 } }) // Solo cuentas de movimiento
  const [isLoading, setIsLoading] = React.useState(false)
  
  const [formData, setFormData] = React.useState<JournalEntryForm>({
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'draft'
  })

  const [lines, setLines] = React.useState<JournalLineForm[]>([
    { accountId: '', debit: '0.00', credit: '0.00', memo: '' },
    { accountId: '', debit: '0.00', credit: '0.00', memo: '' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await createJournalEntry(formData)
      navigation.push('/dashboard/accounting/journal-entries')
    } catch (error) {
      console.error('Error creating journal entry:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
  }

  const addLine = () => {
    setLines(prev => [...prev, { accountId: '', debit: '0.00', credit: '0.00', memo: '' }])
  }

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateLine = (index: number, field: keyof JournalLineForm, value: string) => {
    setLines(prev => prev.map((line, i) => 
      i === index ? { ...line, [field]: value } : line
    ))
  }

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01
  const difference = totalDebit - totalCredit

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Nuevo Asiento Contable
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Header Information */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label htmlFor="reference" className="form-label">
                      Referencia
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      maxLength={255}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="date" className="form-label">
                      Fecha <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="status" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="draft">Borrador</option>
                      <option value="posted">Contabilizado</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label">
                      Descripción <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Journal Lines */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Líneas del Asiento</h6>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={addLine}
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      Agregar Línea
                    </Button>
                  </div>
                  
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '30%' }}>Cuenta</th>
                          <th style={{ width: '25%' }}>Descripción</th>
                          <th style={{ width: '15%' }}>Débito</th>
                          <th style={{ width: '15%' }}>Crédito</th>
                          <th style={{ width: '10%' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((line, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={line.accountId}
                                onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                                required
                              >
                                <option value="">Seleccionar cuenta...</option>
                                {accounts.map(account => (
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
                                value={line.memo}
                                onChange={(e) => updateLine(index, 'memo', e.target.value)}
                                placeholder="Descripción de la línea"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={line.debit}
                                onChange={(e) => updateLine(index, 'debit', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={line.credit}
                                onChange={(e) => updateLine(index, 'credit', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => removeLine(index)}
                                disabled={lines.length <= 2}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colSpan={2}>Totales:</th>
                          <th className="text-end">
                            {new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(totalDebit)}
                          </th>
                          <th className="text-end">
                            {new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(totalCredit)}
                          </th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Balance Validation */}
                {!isBalanced && (
                  <div className="alert alert-warning mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Asiento desbalanceado:</strong> 
                    Los débitos y créditos no coinciden. 
                    Diferencia: {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }).format(Math.abs(difference))}
                  </div>
                )}
                
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || !isBalanced}
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
                        Crear Asiento
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
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
            <strong>Phase 1 - Funcionalidad Básica:</strong> 
            Los asientos contables deben estar balanceados (débitos = créditos). 
            Solo se muestran cuentas de movimiento (isPostable = true).
          </div>
        </div>
      </div>
    </div>
  )
}