'use client'

import React from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAccountMutations } from '@/modules/accounting'
import { Button } from '@/ui/components/base/Button'
import type { AccountForm } from '@/modules/accounting/types'

export default function CreateAccountPage() {
  const navigation = useNavigationProgress()
  const { createAccount } = useAccountMutations()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<AccountForm>({
    code: '',
    name: '',
    accountType: 'asset',
    level: 1,
    parentId: null,
    currency: 'MXN',
    isPostable: true,
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await createAccount(formData)
      navigation.push('/dashboard/accounting/accounts')
    } catch (error) {
      console.error('Error creating account:', error)
      // TODO: Show error message to user
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
                Nueva Cuenta Contable
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="code" className="form-label">
                      Código <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                      required
                    >
                      <option value="asset">Activo</option>
                      <option value="liability">Pasivo</option>
                      <option value="equity">Capital</option>
                      <option value="revenue">Ingreso</option>
                      <option value="expense">Gasto</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="level" className="form-label">
                      Nivel
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="level"
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                      min={1}
                      max={10}
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
                    <label htmlFor="status" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPostable"
                        checked={formData.isPostable}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPostable: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="isPostable">
                        Cuenta de movimiento (permite asientos contables)
                      </label>
                    </div>
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
                  <strong>Consejos:</strong>
                  <ul className="mb-0 mt-2">
                    <li>El código debe ser único</li>
                    <li>Las cuentas de movimiento permiten asientos contables</li>
                    <li>El nivel determina la jerarquía contable</li>
                  </ul>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}