/**
 * Edit Account Page
 * Route: /dashboard/accounting/accounts/[id]/edit
 */

'use client'

import React from 'react'
import { use } from 'react'
import { AccountFormWrapper } from '@/modules/accounting'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

interface EditAccountPageProps {
  params: Promise<{ id: string }>
}

export default function EditAccountPage({ params }: EditAccountPageProps) {
  const navigation = useNavigationProgress()
  const { id } = use(params)

  const handleCancel = () => {
    navigation.push('/dashboard/accounting/accounts')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-pencil me-3 text-primary"></i>
            Editar Cuenta Contable
          </h1>
          <p className="text-muted mb-0">
            Modifique la información de la cuenta contable
          </p>
        </div>
      </div>

      <AccountFormWrapper accountId={id} onCancel={handleCancel} />
    </div>
  )
}
