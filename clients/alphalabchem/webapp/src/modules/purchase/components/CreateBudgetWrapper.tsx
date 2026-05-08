/**
 * Create Budget Wrapper Component
 *
 * Wrapper component for budget creation with navigation.
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { BudgetForm } from './BudgetForm'
import { useBudgetMutations } from '../hooks'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { BudgetFormData } from '../types'

export const CreateBudgetWrapper = () => {
  const navigation = useNavigationProgress()
  const { createBudget, isLoading } = useBudgetMutations()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      setError(null)
      await createBudget(data)
      navigation.push('/dashboard/purchase/budgets')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el presupuesto')
    }
  }

  const handleCancel = () => {
    navigation.push('/dashboard/purchase/budgets')
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/dashboard/purchase/budgets">
                Presupuestos
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Nuevo Presupuesto
            </li>
          </ol>
        </nav>
        <h1 className="h3 mb-0">Crear Presupuesto</h1>
        <p className="text-muted mb-0">Complete el formulario para crear un nuevo presupuesto</p>
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
          <BudgetForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            isEdit={false}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateBudgetWrapper
