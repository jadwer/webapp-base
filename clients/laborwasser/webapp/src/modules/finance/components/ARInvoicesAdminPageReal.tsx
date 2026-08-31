/**
 * AR INVOICES ADMIN PAGE - PHASE 1 IMPLEMENTATION
 * Simple AR Invoice management following AdminPageReal pattern
 * Professional, clean, functional UI for Accounts Receivable
 */

'use client'

import React, { useMemo, useState } from 'react'
import { useARInvoices } from '../hooks'
import { ARInvoicesTableSimple } from './ARInvoicesTableSimple'
import { RegisterPaymentModal } from './RegisterPaymentModal'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { toast } from '@/lib/toast'
import type { ARInvoice } from '../types'

export const ARInvoicesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [paymentInvoice, setPaymentInvoice] = useState<ARInvoice | null>(null)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Build filters object
  const filters: Record<string, unknown> = {}
  if (statusFilter) filters.status = statusFilter

  // Hooks with real backend pagination
  const { arInvoices: rawInvoices, isLoading, error, mutate } = useARInvoices({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    pagination: { page: currentPage, size: pageSize },
    include: ['contact']
  })

  // Client-side filters: the backend schema does not expose a date-range
  // or free-text search filter for ar-invoices, so period and customer
  // search are applied on the already-fetched page.
  const arInvoices = useMemo(() => {
    return rawInvoices.filter((invoice) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesNumber = invoice.invoiceNumber?.toLowerCase().includes(term)
        const matchesContact = invoice.contactName?.toLowerCase().includes(term)
        if (!matchesNumber && !matchesContact) return false
      }
      if (dateFrom && invoice.invoiceDate < dateFrom) return false
      if (dateTo && invoice.invoiceDate > dateTo) return false
      return true
    })
  }, [rawInvoices, searchTerm, dateFrom, dateTo])

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
    navigation.push('/dashboard/finance/ar-invoices/create')
  }

  const handleViewClick = (id: string) => {
    navigation.push(`/dashboard/finance/ar-invoices/${id}`)
  }

  const handleEditClick = (id: string) => {
    navigation.push(`/dashboard/finance/ar-invoices/${id}/edit`)
  }

  const handleRegisterPaymentClick = (invoice: ARInvoice) => {
    setPaymentInvoice(invoice)
  }

  const handlePaymentSuccess = () => {
    setPaymentInvoice(null)
    toast.success('Pago registrado exitosamente')
    mutate()
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error al cargar las facturas de clientes: {error.message}
      </Alert>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de facturas por cobrar (Accounts Receivable)
          </p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="bg-green-600 hover:bg-green-700"
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
          { value: 'paid', label: 'Cobrada' },
        ]}
        placeholder="Buscar por número de factura, cliente..."
      />

      {/* Period filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dateFrom" className="block text-sm text-gray-600 mb-1">
            Periodo desde
          </label>
          <input
            id="dateFrom"
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div>
          <label htmlFor="dateTo" className="block text-sm text-gray-600 mb-1">
            Periodo hasta
          </label>
          <input
            id="dateTo"
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        {(dateFrom || dateTo) && (
          <div className="flex items-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar periodo
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Facturas</div>
          <div className="text-2xl font-bold text-gray-900">
            {arInvoices?.length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Borradores</div>
          <div className="text-2xl font-bold text-yellow-600">
            {arInvoices?.filter(inv => inv.status === 'draft').length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Por Cobrar</div>
          <div className="text-2xl font-bold text-blue-600">
            {arInvoices?.filter(inv => inv.status === 'sent' && (inv.totalAmount - inv.paidAmount) > 0).length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Cobradas</div>
          <div className="text-2xl font-bold text-green-600">
            {arInvoices?.filter(inv => inv.status === 'paid').length || 0}
          </div>
        </div>
      </div>

      {/* Total amounts summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">Total por Cobrar</div>
          <div className="text-2xl font-bold text-blue-700">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(
              arInvoices?.reduce((sum, inv) =>
                (inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'void')
                  ? sum + (inv.totalAmount - inv.paidAmount)
                  : sum, 0
              ) || 0
            )}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">Total Cobrado</div>
          <div className="text-2xl font-bold text-green-700">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(
              arInvoices?.reduce((sum, inv) => sum + inv.paidAmount, 0) || 0
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Facturado</div>
          <div className="text-2xl font-bold text-gray-700">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(
              arInvoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) || 0
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <ARInvoicesTableSimple
          arInvoices={arInvoices || []}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onRegisterPayment={handleRegisterPaymentClick}
        />
      </div>

      {/* Pagination */}
      {arInvoices && arInvoices.length > 0 && (
        <div className="mt-6">
          <PaginationSimple
            currentPage={currentPage}
            totalPages={Math.ceil((arInvoices.length || 0) / pageSize)}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Register Payment Modal */}
      <RegisterPaymentModal
        isOpen={paymentInvoice !== null}
        arInvoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}