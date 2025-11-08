'use client'

import React, { useState } from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAPPaymentMutations, useBankAccounts } from '@/modules/finance'
import { useContacts } from '@/modules/contacts'
import { Button } from '@/ui/components/base/Button'
import type { APPaymentForm } from '@/modules/finance/types'

export default function CreateAPPaymentPage() {
  const navigation = useNavigationProgress()
  const { createAPPayment } = useAPPaymentMutations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load contacts for supplier selection (only suppliers)
  const { contacts, isLoading: contactsLoading } = useContacts({
    filters: { isSupplier: true }
  })

  // Load bank accounts for payment source selection
  const { bankAccounts, isLoading: bankAccountsLoading } = useBankAccounts({
    filters: { status: 'active' }
  })
  const [formData, setFormData] = useState<APPaymentForm>({
    contactId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'transfer',
    currency: 'MXN',
    amount: '0.00',
    bankAccountId: null,
    status: 'draft'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!formData.contactId || !formData.paymentDate || !formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Todos los campos requeridos deben estar completos y el monto debe ser mayor a 0')
      }

      const response = await createAPPayment(formData)
      console.log('✅ [APPaymentCreate] Payment created successfully:', response)
      navigation.push('/dashboard/finance/ap-payments')
    } catch (err) {
      console.error('❌ [APPaymentCreate] Error creating AP payment:', err)
      setError(err instanceof Error ? err.message : 'Error al crear el pago a proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
  }

  const handleInputChange = (field: keyof APPaymentForm, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
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
                    <label htmlFor="contactId" className="form-label">
                      Proveedor <span className="text-danger">*</span>
                    </label>
                    <select
                      id="contactId"
                      className="form-select"
                      value={formData.contactId}
                      onChange={(e) => handleInputChange('contactId', e.target.value)}
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
                      <div className="form-text text-muted">
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Cargando proveedores...
                      </div>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      min="0"
                      step="0.01"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="paymentMethod" className="form-label">
                      Método de Pago <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      required
                    >
                      <option value="transfer">Transferencia</option>
                      <option value="check">Cheque</option>
                      <option value="cash">Efectivo</option>
                      <option value="credit_card">Tarjeta de Crédito</option>
                      <option value="debit_card">Tarjeta de Débito</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="bankAccountId" className="form-label">
                      Cuenta Bancaria (Opcional)
                    </label>
                    <select
                      id="bankAccountId"
                      className="form-select"
                      value={formData.bankAccountId || ''}
                      onChange={(e) => handleInputChange('bankAccountId', e.target.value || null)}
                      disabled={bankAccountsLoading || isLoading}
                    >
                      <option value="">Sin cuenta bancaria específica</option>
                      {bankAccounts?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber} ({account.currency})
                        </option>
                      ))}
                    </select>
                    {bankAccountsLoading && (
                      <div className="form-text text-muted">
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Cargando cuentas bancarias...
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'posted' }))}
                    >
                      <option value="draft">Borrador</option>
                      <option value="posted">Contabilizado</option>
                    </select>
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
            En esta fase se implementa la funcionalidad básica de pagos a proveedores. 
            La aplicación automática de pagos a facturas estará disponible en fases posteriores.
          </div>
        </div>
      </div>
    </div>
  )
}