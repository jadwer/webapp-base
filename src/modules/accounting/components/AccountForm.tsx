'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { Account, AccountFormData } from '../types'

interface AccountFormProps {
  account?: Account
  isLoading?: boolean
  onSubmit: (data: AccountFormData) => Promise<void>
  onCancel?: () => void
}

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    code: account?.code || '',
    name: account?.name || '',
    accountType: account?.accountType || 'asset',
    nature: account?.nature || 'debit',
    level: account?.level || 1,
    isPostable: account?.isPostable ?? true,
    isCashFlow: account?.isCashFlow ?? false,
    status: account?.status || 'active',
    parentId: account?.parentId || undefined,
    currency: account?.currency || 'MXN',
    metadata: account?.metadata || undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        nature: account.nature || 'debit',
        level: account.level,
        isPostable: account.isPostable,
        isCashFlow: account.isCashFlow ?? false,
        status: account.status,
        parentId: account.parentId || undefined,
        currency: account.currency || 'MXN',
        metadata: account.metadata || undefined
      })
    }
  }, [account])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido'
    } else if (formData.code.length > 255) {
      newErrors.code = 'El código no puede exceder 255 caracteres'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres'
    }

    if (formData.level < 1 || formData.level > 10) {
      newErrors.level = 'El nivel debe estar entre 1 y 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof AccountFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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

    const submitData: AccountFormData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      accountType: formData.accountType,
      nature: formData.nature,
      level: formData.level,
      isPostable: formData.isPostable,
      isCashFlow: formData.isCashFlow,
      status: formData.status,
      ...(formData.parentId && { parentId: formData.parentId }),
      ...(formData.currency && { currency: formData.currency }),
      ...(formData.metadata && { metadata: formData.metadata })
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información General
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <Input
                    label="Código"
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    onBlur={() => handleBlur('code')}
                    errorText={touched.code ? errors.code : ''}
                    required
                    placeholder="Ej: 1001, 4001"
                    disabled={isLoading || !!account}
                    helpText="Código único de la cuenta (no modificable después de crear)"
                  />
                </div>

                <div className="col-md-8 mb-3">
                  <Input
                    label="Nombre de la cuenta"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    errorText={touched.name ? errors.name : ''}
                    required
                    placeholder="Ej: Bancos, Clientes, Ventas"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Tipo de cuenta <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value as typeof formData.accountType)}
                    disabled={isLoading}
                    required
                  >
                    <option value="asset">Activo (Asset)</option>
                    <option value="liability">Pasivo (Liability)</option>
                    <option value="equity">Capital (Equity)</option>
                    <option value="revenue">Ingresos (Revenue)</option>
                    <option value="expense">Gastos (Expense)</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <Input
                    label="Nivel"
                    type="number"
                    value={formData.level.toString()}
                    onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                    onBlur={() => handleBlur('level')}
                    errorText={touched.level ? errors.level : ''}
                    required
                    min={1}
                    max={10}
                    disabled={isLoading}
                    helpText="Nivel jerárquico (1-10)"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    Moneda
                  </label>
                  <select
                    className="form-select"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Estado <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as typeof formData.status)}
                    disabled={isLoading}
                    required
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isPostable"
                      checked={formData.isPostable}
                      onChange={(e) => handleInputChange('isPostable', e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="isPostable">
                      Cuenta posteable (permite movimientos)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-eye me-2"></i>
                Vista previa
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Código:</strong>
                <div className="text-muted">
                  <code>{formData.code || 'Sin código'}</code>
                </div>
              </div>

              <div className="mb-3">
                <strong>Nombre:</strong>
                <div className="text-muted">
                  {formData.name || 'Sin nombre'}
                </div>
              </div>

              <div className="mb-3">
                <strong>Tipo:</strong>
                <div>
                  <span className={`badge bg-${
                    formData.accountType === 'asset' ? 'primary' :
                    formData.accountType === 'liability' ? 'warning' :
                    formData.accountType === 'equity' ? 'info' :
                    formData.accountType === 'revenue' ? 'success' :
                    'danger'
                  }`}>
                    {formData.accountType === 'asset' && 'Activo'}
                    {formData.accountType === 'liability' && 'Pasivo'}
                    {formData.accountType === 'equity' && 'Capital'}
                    {formData.accountType === 'revenue' && 'Ingresos'}
                    {formData.accountType === 'expense' && 'Gastos'}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <strong>Nivel jerárquico:</strong>
                <div className="text-muted">
                  {formData.level}
                </div>
              </div>

              <div className="mb-3">
                <strong>Estado:</strong>
                <div>
                  <span className={`badge ${formData.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {formData.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <div className="mb-0">
                <strong>Posteable:</strong>
                <div>
                  <span className={`badge ${formData.isPostable ? 'bg-success' : 'bg-warning'}`}>
                    {formData.isPostable ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Consejos
              </h6>
            </div>
            <div className="card-body">
              <ul className="mb-0 small">
                <li>El código debe ser único</li>
                <li>Nivel 1 = cuentas principales</li>
                <li>Solo cuentas posteables permiten movimientos</li>
                <li>Las cuentas padre no deben ser posteables</li>
              </ul>
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
          disabled={isLoading}
        >
          <i className="bi bi-check-lg me-2"></i>
          {account ? 'Actualizar cuenta' : 'Crear cuenta'}
        </Button>
      </div>
    </form>
  )
}

export default AccountForm
