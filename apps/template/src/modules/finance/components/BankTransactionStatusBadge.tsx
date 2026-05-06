/**
 * BankTransaction Status Badge Component
 *
 * Displays the reconciliation status of a bank transaction.
 */

'use client'

import React from 'react'
import clsx from 'clsx'
import type { ParsedBankTransaction } from '../types'
import { RECONCILIATION_STATUS_CONFIG, BANK_TRANSACTION_TYPE_CONFIG } from '../types'

interface BankTransactionStatusBadgeProps {
  transaction: ParsedBankTransaction
  showType?: boolean
}

export const BankTransactionStatusBadge: React.FC<BankTransactionStatusBadgeProps> = ({
  transaction,
  showType = false,
}) => {
  const statusConfig = RECONCILIATION_STATUS_CONFIG[transaction.reconciliationStatus]
  const typeConfig = BANK_TRANSACTION_TYPE_CONFIG[transaction.transactionType]

  return (
    <div className="d-flex gap-1 flex-wrap">
      {showType && typeConfig && (
        <span className={clsx('badge', typeConfig.badgeClass)}>
          <i className={clsx('bi', typeConfig.icon, 'me-1')} />
          {typeConfig.label}
        </span>
      )}
      {statusConfig && (
        <span className={clsx('badge', statusConfig.badgeClass)}>
          {statusConfig.label}
        </span>
      )}
    </div>
  )
}

export default BankTransactionStatusBadge
