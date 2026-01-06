/**
 * Edit DiscountRule Wrapper Component
 *
 * Wrapper component for editing an existing discount rule.
 */

'use client'

import React, { useState } from 'react'
import { DiscountRuleForm } from './DiscountRuleForm'
import { useDiscountRule } from '../hooks/useDiscountRule'
import { useDiscountRuleMutations } from '../hooks/useDiscountRuleMutations'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { DiscountRuleFormData } from '../types'

interface EditDiscountRuleWrapperProps {
  ruleId: string
}

export const EditDiscountRuleWrapper: React.FC<EditDiscountRuleWrapperProps> = ({ ruleId }) => {
  const navigation = useNavigationProgress()
  const { discountRule, isLoading: isLoadingRule, error: loadError } = useDiscountRule({ id: ruleId })
  const { updateDiscountRule, isLoading: isUpdating } = useDiscountRuleMutations()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: DiscountRuleFormData) => {
    try {
      setError(null)
      await updateDiscountRule(ruleId, data)
      navigation.push('/dashboard/sales/discount-rules')
    } catch (err) {
      console.error('Error updating discount rule:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar la regla de descuento')
    }
  }

  const handleCancel = () => {
    navigation.push('/dashboard/sales/discount-rules')
  }

  // Loading state
  if (isLoadingRule) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando regla de descuento...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError || !discountRule) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {loadError?.message || 'No se pudo cargar la regla de descuento'}
        </Alert>
        <button className="btn btn-secondary mt-3" onClick={handleCancel}>
          <i className="bi bi-arrow-left me-2" />
          Volver
        </button>
      </div>
    )
  }

  // Transform parsed discount rule to form data (convert null to undefined for form)
  const initialData: Partial<DiscountRuleFormData> = {
    name: discountRule.name,
    code: discountRule.code,
    description: discountRule.description || '',
    discountType: discountRule.discountType,
    discountValue: discountRule.discountValue,
    buyQuantity: discountRule.buyQuantity ?? undefined,
    getQuantity: discountRule.getQuantity ?? undefined,
    appliesTo: discountRule.appliesTo,
    minOrderAmount: discountRule.minOrderAmount ?? undefined,
    minQuantity: discountRule.minQuantity ?? undefined,
    maxDiscountAmount: discountRule.maxDiscountAmount ?? undefined,
    productIds: discountRule.productIds || [],
    categoryIds: discountRule.categoryIds || [],
    customerIds: discountRule.customerIds || [],
    customerClassifications: discountRule.customerClassifications || [],
    startDate: discountRule.startDate || '',
    endDate: discountRule.endDate || '',
    usageLimit: discountRule.usageLimit ?? undefined,
    usagePerCustomer: discountRule.usagePerCustomer ?? undefined,
    priority: discountRule.priority,
    isCombinable: discountRule.isCombinable,
    isActive: discountRule.isActive
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              className="btn btn-link text-muted p-0 me-3"
              onClick={handleCancel}
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0">Editar Regla de Descuento</h1>
              <p className="text-muted mb-0">
                Editando: <strong>{discountRule.name}</strong> ({discountRule.code})
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </Alert>
          )}

          {/* Form Card */}
          <div className="card">
            <div className="card-body">
              <DiscountRuleForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isUpdating}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditDiscountRuleWrapper
