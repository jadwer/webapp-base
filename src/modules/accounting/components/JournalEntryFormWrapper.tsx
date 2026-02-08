'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { JournalEntryForm } from './JournalEntryForm'
import { useJournalEntry, useJournalEntryMutations } from '../hooks'
import { useToast } from '@/ui/hooks/useToast'
import { Alert } from '@/ui/components/base'
import type { JournalEntryWithLines } from '../types'

interface JournalEntryFormWrapperProps {
  journalEntryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const JournalEntryFormWrapper: React.FC<JournalEntryFormWrapperProps> = ({
  journalEntryId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter()
  const toast = useToast()
  const { journalEntry, isLoading: journalEntryLoading, error: journalEntryError } = useJournalEntry(journalEntryId || null)
  const { createJournalEntryWithLines } = useJournalEntryMutations()

  const handleSubmit = async (formData: JournalEntryWithLines) => {
    try {
      await createJournalEntryWithLines(formData)
      toast.success('Póliza creada exitosamente')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/accounting/journal-entries')
      }
    } catch {
      toast.error('Error al crear la póliza')
    }
  }

  // Loading state for existing journal entry
  if (journalEntryId && journalEntryLoading) {
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

  // Error state for existing journal entry
  if (journalEntryId && journalEntryError) {
    return (
      <div className="card">
        <div className="card-body">
          <Alert
            variant="danger"
            title="Error al cargar la póliza"
            showIcon={true}
          >
            {journalEntryError.message || 'No se pudo obtener la información de la póliza'}
          </Alert>
        </div>
      </div>
    )
  }

  // Journal Entry not found
  if (journalEntryId && !journalEntry && !journalEntryLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-journal-text" />
          </div>
          <h3 className="text-muted mb-2">Póliza no encontrada</h3>
          <p className="text-muted mb-4">La póliza que buscas no existe o ha sido eliminada</p>
        </div>
      </div>
    )
  }

  return (
    <JournalEntryForm
      journalEntry={journalEntry || undefined}
      isLoading={false}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default JournalEntryFormWrapper
