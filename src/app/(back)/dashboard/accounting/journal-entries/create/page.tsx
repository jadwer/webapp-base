/**
 * Create Journal Entry Page
 * Route: /dashboard/accounting/journal-entries/create
 */

'use client'

import React from 'react'
import { JournalEntryFormWrapper } from '@/modules/accounting'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CreateJournalEntryPage() {
  const navigation = useNavigationProgress()

  const handleCancel = () => {
    navigation.push('/dashboard/accounting/journal-entries')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-plus-circle me-3 text-primary"></i>
            Nueva Póliza Contable
          </h1>
          <p className="text-muted mb-0">
            Complete la información para crear una nueva póliza con partida doble
          </p>
        </div>
      </div>

      <JournalEntryFormWrapper onCancel={handleCancel} />
    </div>
  )
}
