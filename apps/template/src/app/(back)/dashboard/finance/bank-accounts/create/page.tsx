/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useBankAccountMutations, getFinanceErrorMessage } from '@/modules/finance'
import { usePostableAccounts } from '@/modules/accounting'
import { Button } from '@/ui/components/base/Button'
import type { BankAccountForm } from '@/modules/finance'

export default function CreateBankAccountPage() {
  const navigation = useNavigationProgress()
  const { createBankAccount } = useBankAccountMutations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cuenta contable (GL) de la cuenta bancaria: NOT NULL en bank_accounts.
  const { postableAccounts, isLoading: accountsLoading } = usePostableAccounts({
    'page[size]': 500,
    sort: 'code',
  })

  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    currency: 'MXN',
    glAccountId: '',
    openingBalance: '0',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // NOT NULL en bank_accounts; el backend responde 422 si faltan
    if (!formData.accountName.trim() || !formData.bankName.trim() ||
        !formData.accountNumber.trim() || !formData.glAccountId) {
      setError('El nombre de la cuenta, el banco, el número de cuenta y la cuenta contable son obligatorios')
      return
    }
    const openingBalance = formData.openingBalance === '' ? 0 : Number(formData.openingBalance)
    if (!Number.isFinite(openingBalance)) {
      setError('El saldo de apertura debe ser un número')
      return
    }

    const payload: BankAccountForm = {
      accountName: formData.accountName.trim(),
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber.trim(),
      currency: formData.currency,
      glAccountId: Number(formData.glAccountId),
      openingBalance,
      currentBalance: openingBalance,
      status: formData.status,
    }

    setIsLoading(true)
    try {
      await createBankAccount(payload)
      navigation.push('/dashboard/finance/bank-accounts')
    } catch (err) {
      setError(getFinanceErrorMessage(err, 'Error al crear la cuenta bancaria'))
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
                    <label htmlFor="accountName" className="form-label">
                      Nombre de la Cuenta <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                      required
                      maxLength={255}
                      placeholder="Ej. Cuenta operativa MXN"
                    />
                  </div>
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
                    <label htmlFor="glAccountId" className="form-label">
                      Cuenta Contable <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="glAccountId"
                      value={formData.glAccountId}
                      onChange={(e) => setFormData(prev => ({ ...prev, glAccountId: e.target.value }))}
                      disabled={accountsLoading || isLoading}
                      required
                    >
                      <option value="">Seleccionar cuenta contable...</option>
                      {postableAccounts?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                    {accountsLoading && (
                      <div className="form-text text-muted">Cargando catálogo de cuentas...</div>
                    )}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                      <option value="closed">Cerrada</option>
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
                    <li><strong>Cuenta contable:</strong> Cuenta del catálogo donde se registran los movimientos del banco</li>
                    <li><strong>Saldo apertura:</strong> Saldo inicial de la cuenta</li>
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