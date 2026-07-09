'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AccountForm } from './AccountForm'
import { useAccount, useAccountMutations } from '../hooks'
import { useToast } from '@/ui/hooks/useToast'
import { Alert } from '@/ui/components/base'
import type { AccountFormData } from '../types'

interface AccountFormWrapperProps {
  accountId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const AccountFormWrapper: React.FC<AccountFormWrapperProps> = ({
  accountId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter()
  const toast = useToast()
  const { account, isLoading: accountLoading, error: accountError } = useAccount(accountId || null)
  const { createAccount, updateAccount } = useAccountMutations()

  const handleSubmit = async (formData: AccountFormData) => {
    try {
      if (accountId && account) {
        await updateAccount(accountId, formData)
        toast.success('Cuenta actualizada exitosamente')
      } else {
        await createAccount(formData)
        toast.success('Cuenta creada exitosamente')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/accounting/accounts')
      }
    } catch {
      toast.error(accountId ? 'Error al actualizar la cuenta' : 'Error al crear la cuenta')
    }
  }

  // Loading state for existing account
  if (accountId && accountLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="placeholder col-4 mb-3" style={{ height: '2rem' }}></div>
            <div className="placeholder col-12 mb-3"></div>
            <div className="placeholder col-8 mb-3"></div>
            <div className="placeholder col-6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state for existing account
  if (accountId && accountError) {
    return (
      <div className="card">
        <div className="card-body">
          <Alert
            variant="danger"
            title="Error al cargar la cuenta"
            showIcon={true}
          >
            {accountError.message || 'No se pudo obtener la información de la cuenta'}
          </Alert>
        </div>
      </div>
    )
  }

  // Account not found
  if (accountId && !account && !accountLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-journal-text" />
          </div>
          <h3 className="text-muted mb-2">Cuenta no encontrada</h3>
          <p className="text-muted mb-4">La cuenta que buscas no existe o ha sido eliminada</p>
        </div>
      </div>
    )
  }

  return (
    <AccountForm
      account={account || undefined}
      isLoading={false}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default AccountFormWrapper
