'use client'

import React, { useState } from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useBankAccountMutations } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'
import type { BankAccountForm } from '@/modules/finance/types'

export default function CreateBankAccountPage() {
  const navigation = useNavigationProgress()
  const { createBankAccount } = useBankAccountMutations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<BankAccountForm>({
    bankName: '',
    accountNumber: '',
    clabe: '',
    currency: 'MXN',
    accountType: 'checking',
    openingBalance: '0.00',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!formData.bankName || !formData.accountNumber) {
        throw new Error('El nombre del banco y el número de cuenta son requeridos')
      }

      const response = await createBankAccount(formData)
      console.log('✅ [BankAccountCreate] Bank account created successfully:', response)
      navigation.push('/dashboard/finance/bank-accounts')
    } catch (err) {
      console.error('❌ [BankAccountCreate] Error creating bank account:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta bancaria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Cuenta Bancaria
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
                    <label htmlFor="bankName" className="form-label">
                      Nombre del Banco <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="openingBalance" className="form-label">
                      Saldo de Apertura
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="openingBalance"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData(prev => ({ ...prev, openingBalance: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="accountNumber" className="form-label">
                      Número de Cuenta <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="accountType" className="form-label">
                      Tipo de Cuenta <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="accountType"
                      value={formData.accountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                      required
                    >
                      <option value="checking">Cuenta Corriente</option>
                      <option value="savings">Cuenta de Ahorros</option>
                      <option value="investment">Cuenta de Inversión</option>
                      <option value="credit">Línea de Crédito</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="currency" className="form-label">
                      Moneda <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      required
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'closed' }))}
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                      <option value="closed">Cerrada</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label htmlFor="clabe" className="form-label">
                      CLABE / IBAN
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="clabe"
                      value={formData.clabe}
                      onChange={(e) => setFormData(prev => ({ ...prev, clabe: e.target.value }))}
                      maxLength={255}
                      placeholder="Clave Bancaria Estandarizada (18 dígitos) o IBAN internacional"
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
                        Crear Cuenta
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
        
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información
              </h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <small>
                  <strong>Campos importantes:</strong>
                  <ul className="mb-0 mt-2">
                    <li><strong>CLABE:</strong> Para transferencias SPEI en México (18 dígitos)</li>
                    <li><strong>IBAN:</strong> Para transferencias internacionales</li>
                    <li><strong>Saldo apertura:</strong> Saldo inicial de la cuenta</li>
                    <li><strong>Tipo de cuenta:</strong> Define el comportamiento contable</li>
                    <li><strong>Estado:</strong> Solo cuentas activas permiten movimientos</li>
                  </ul>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Phase 1 - Funcionalidad Básica:</strong> 
            En esta fase se implementa la funcionalidad básica de cuentas bancarias. 
            La conciliación bancaria y funciones avanzadas estarán disponibles en fases posteriores.
          </div>
        </div>
      </div>
    </div>
  )
}