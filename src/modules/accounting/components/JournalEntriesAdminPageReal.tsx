/**
 * JOURNAL ENTRIES ADMIN PAGE - PHASE 1 IMPLEMENTATION
 * Simple Journal Entry management following AdminPageReal pattern
 * Professional, clean, functional UI for accounting entries
 */

'use client'

import React, { useState } from 'react'
import { useJournalEntries } from '../hooks'
import { JournalEntriesTableSimple } from './JournalEntriesTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const JournalEntriesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Build filters object
  const filters: Record<string, any> = {}
  if (searchTerm) filters.search = searchTerm
  if (statusFilter) filters.status = statusFilter

  // Hooks with real backend pagination - Fix JSON:API format
  const { journalEntries, isLoading, error } = useJournalEntries({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    pagination: { page: currentPage, size: pageSize },
    include: ['journalLines', 'journalLines.account']
  })

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateClick = () => {
    navigation.push('/dashboard/accounting/journal-entries/create')
  }

  const handleViewClick = (id: string) => {
    navigation.push(`/dashboard/accounting/journal-entries/${id}`)
  }

  const handleEditClick = (id: string) => {
    navigation.push(`/dashboard/accounting/journal-entries/${id}/edit`)
  }

  // Debug logs for development
  console.log('📖 [JournalEntriesAdminPageReal] Debug info:', {
    journalEntries,
    journalEntriesLength: journalEntries?.length,
    isLoading,
    error,
    searchTerm,
    statusFilter,
    currentPage
  })

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error al cargar los asientos contables: {error.message}
      </Alert>
    )
  }

  // Calculate totals
  const totalDebit = journalEntries?.reduce((sum, entry) => sum + (parseFloat(entry.totalDebit) || 0), 0) || 0
  const totalCredit = journalEntries?.reduce((sum, entry) => sum + (parseFloat(entry.totalCredit) || 0), 0) || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asientos Contables</h1>
          <p className="text-gray-600 mt-1">
            Journal Entries - Registro de movimientos contables
          </p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="bg-green-600 hover:bg-green-700"
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Nuevo Asiento
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusOptions={[
          { value: '', label: 'Todos los estados' },
          { value: 'draft', label: 'Borrador' },
          { value: 'posted', label: 'Contabilizado' },
        ]}
        placeholder="Buscar por número, descripción..."
      />

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Asientos</div>
          <div className="text-2xl font-bold text-gray-900">
            {journalEntries?.length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Borradores</div>
          <div className="text-2xl font-bold text-yellow-600">
            {journalEntries?.filter(entry => entry.status === 'draft').length || 0}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">Total Débitos</div>
          <div className="text-xl font-bold text-green-700">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 2
            }).format(totalDebit)}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">Total Créditos</div>
          <div className="text-xl font-bold text-blue-700">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 2
            }).format(totalCredit)}
          </div>
        </div>
      </div>

      {/* Balance Check Alert */}
      {Math.abs(totalDebit - totalCredit) > 0.01 && (
        <div className="mb-4 p-3 bg-warning text-dark rounded">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>
              <strong>Advertencia:</strong> Los totales de débitos y créditos no coinciden. 
              Diferencia: {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(Math.abs(totalDebit - totalCredit))}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <JournalEntriesTableSimple
          journalEntries={journalEntries || []}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
        />
      </div>

      {/* Pagination */}
      {journalEntries && journalEntries.length > 0 && (
        <div className="mt-6">
          <PaginationSimple
            currentPage={currentPage}
            totalPages={Math.ceil((journalEntries.length || 0) / pageSize)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}