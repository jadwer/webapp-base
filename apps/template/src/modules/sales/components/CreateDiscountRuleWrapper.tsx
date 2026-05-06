/**
 * Create DiscountRule Wrapper Component
 *
 * Wrapper component for creating a new discount rule.
 */

'use client'

import React, { useState } from 'react'
import { DiscountRuleForm } from './DiscountRuleForm'
import { useDiscountRuleMutations } from '../hooks/useDiscountRuleMutations'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { DiscountRuleFormData } from '../types'

export const CreateDiscountRuleWrapper: React.FC = () => {
  const navigation = useNavigationProgress()
  const { createDiscountRule, isLoading } = useDiscountRuleMutations()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: DiscountRuleFormData) => {
    try {
      setError(null)
      await createDiscountRule(data)
      navigation.push('/dashboard/sales/discount-rules')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la regla de descuento')
    }
  }

  const handleCancel = () => {
    navigation.push('/dashboard/sales/discount-rules')
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
              <h1 className="h3 mb-0">Nueva Regla de Descuento</h1>
              <p className="text-muted mb-0">Crear una nueva regla de descuento automatico</p>
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
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateDiscountRuleWrapper
