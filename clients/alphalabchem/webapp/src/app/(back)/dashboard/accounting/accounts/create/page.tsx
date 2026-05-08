/**
 * Create Account Page
 * Route: /dashboard/accounting/accounts/create
 */

'use client'

import React from 'react'
import { AccountFormWrapper } from '@/modules/accounting'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CreateAccountPage() {
  const navigation = useNavigationProgress()

  const handleCancel = () => {
    navigation.push('/dashboard/accounting/accounts')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-plus-circle me-3 text-primary"></i>
            Nueva Cuenta Contable
          </h1>
          <p className="text-muted mb-0">
            Complete la información para crear una nueva cuenta en el catálogo
          </p>
        </div>
      </div>

      <AccountFormWrapper onCancel={handleCancel} />
    </div>
  )
}
