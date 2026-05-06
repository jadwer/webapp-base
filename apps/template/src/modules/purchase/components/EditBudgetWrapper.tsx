/**
 * Edit Budget Wrapper Component
 *
 * Wrapper component for budget editing with data loading.
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { BudgetForm } from './BudgetForm'
import { useBudget, useBudgetMutations } from '../hooks'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { BudgetFormData } from '../types'

interface EditBudgetWrapperProps {
  budgetId: string
}

export const EditBudgetWrapper: React.FC<EditBudgetWrapperProps> = ({ budgetId }) => {
  const navigation = useNavigationProgress()
  const { budget, isLoading: budgetLoading, error: budgetError } = useBudget({ id: budgetId })
  const { updateBudget, isLoading: mutationLoading } = useBudgetMutations()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      setError(null)
      await updateBudget(budgetId, data)
      navigation.push('/dashboard/purchase/budgets')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el presupuesto')
    }
  }

  const handleCancel = () => {
    navigation.push('/dashboard/purchase/budgets')
  }

  // Loading state
  if (budgetLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando presupuesto...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (budgetError) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el presupuesto: {budgetError.message || 'Error desconocido'}
        </Alert>
      </div>
    )
  }

  // Not found state
  if (!budget) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2" />
          No se encontro el presupuesto solicitado
        </Alert>
      </div>
    )
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
            <li className="breadcrumb-item">
              <Link href={`/dashboard/purchase/budgets/${budgetId}`}>
                {budget.name}
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Editar
            </li>
          </ol>
        </nav>
        <h1 className="h3 mb-0">Editar Presupuesto</h1>
        <p className="text-muted mb-0">
          Editando: <strong>{budget.name}</strong> ({budget.code})
        </p>
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
            initialData={budget}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={mutationLoading}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  )
}

export default EditBudgetWrapper
