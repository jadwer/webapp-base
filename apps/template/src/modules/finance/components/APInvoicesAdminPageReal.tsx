/**
 * AP INVOICES ADMIN PAGE - PHASE 1 IMPLEMENTATION
 * Simple AP Invoice management following AdminPageReal pattern
 * Professional, clean, functional UI
 */

'use client'

import React, { useState } from 'react'
import { useAPInvoices } from '../hooks'
import { APInvoicesTableSimple } from './APInvoicesTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const APInvoicesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Build filters object
  const filters: Record<string, unknown> = {}
  if (searchTerm) filters.search = searchTerm
  if (statusFilter) filters.status = statusFilter

  // Hooks with real backend pagination
  const { apInvoices, isLoading, error } = useAPInvoices({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    pagination: { page: currentPage, size: pageSize },
    include: ['contact']
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
    navigation.push('/dashboard/finance/ap-invoices/create')
  }

  const handleViewClick = (id: string) => {
    navigation.push(`/dashboard/finance/ap-invoices/${id}`)
  }

  const handleEditClick = (id: string) => {
    navigation.push(`/dashboard/finance/ap-invoices/${id}/edit`)
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error al cargar las facturas de proveedores: {error.message}
      </Alert>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas de Proveedores</h1>
          <p className="text-gray-600 mt-1">
            Gestión de facturas por pagar (Accounts Payable)
          </p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Nueva Factura
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
          { value: 'sent', label: 'Enviada' },
          { value: 'paid', label: 'Pagada' },
        ]}
        placeholder="Buscar por número de factura, proveedor..."
      />

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Facturas</div>
          <div className="text-2xl font-bold text-gray-900">
            {apInvoices?.length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Borradores</div>
          <div className="text-2xl font-bold text-yellow-600">
            {apInvoices?.filter(inv => inv.status === 'draft').length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold text-blue-600">
            {apInvoices?.filter(inv => inv.status === 'sent' && (inv.totalAmount - inv.paidAmount) > 0).length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Pagadas</div>
          <div className="text-2xl font-bold text-green-600">
            {apInvoices?.filter(inv => inv.status === 'paid').length || 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <APInvoicesTableSimple
          apInvoices={apInvoices || []}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
        />
      </div>

      {/* Pagination */}
      {apInvoices && apInvoices.length > 0 && (
        <div className="mt-6">
          <PaginationSimple
            currentPage={currentPage}
            totalPages={Math.ceil((apInvoices.length || 0) / pageSize)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}