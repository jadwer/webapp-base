/**
 * ACCOUNTS ADMIN PAGE - PHASE 1 IMPLEMENTATION
 * Simple Chart of Accounts management following AdminPageReal pattern
 * Professional, clean, functional UI
 */

'use client'

import React, { useState } from 'react'
import { useAccounts } from '../hooks'
import { AccountsTableSimple } from './AccountsTableSimple'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const AccountsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [postableFilter, setPostableFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Build filters object
  const filters: Record<string, string | number> = {}
  if (searchTerm) filters.search = searchTerm
  if (typeFilter) filters.accountType = typeFilter
  if (postableFilter) filters.isPostable = postableFilter === 'true' ? 1 : 0

  // Hooks with real backend pagination
  const { accounts, isLoading, error } = useAccounts({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    pagination: { page: currentPage, size: pageSize }
  })

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (newType: string) => {
    setTypeFilter(newType)
    setCurrentPage(1)
  }

  const handlePostableFilterChange = (newPostable: string) => {
    setPostableFilter(newPostable)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateClick = () => {
    navigation.push('/dashboard/accounting/accounts/create')
  }

  const handleViewClick = (id: string) => {
    navigation.push(`/dashboard/accounting/accounts/${id}`)
  }

  const handleEditClick = (id: string) => {
    navigation.push(`/dashboard/accounting/accounts/${id}/edit`)
  }

  // Debug logs for development
  console.log('📊 [AccountsAdminPageReal] Debug info:', {
    accounts,
    accountsLength: accounts?.length,
    isLoading,
    error,
    searchTerm,
    typeFilter,
    postableFilter,
    currentPage
  })

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error al cargar el catálogo de cuentas: {error.message}
      </Alert>
    )
  }

  const accountsByType = accounts?.reduce((acc, account) => {
    acc[account.accountType] = (acc[account.accountType] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const postableCount = accounts?.filter(acc => acc.isPostable).length || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Cuentas</h1>
          <p className="text-gray-600 mt-1">
            Chart of Accounts - Gestión del plan contable
          </p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <i className="bi bi-plus-circle mr-2"></i>
          Nueva Cuenta
        </Button>
      </div>

      {/* Extended Filters */}
      <div className="mb-4 p-4 bg-light rounded">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Account Type Filter */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="asset">Activos</option>
              <option value="liability">Pasivos</option>
              <option value="equity">Capital</option>
              <option value="revenue">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>

          {/* Postable Filter */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={postableFilter}
              onChange={(e) => handlePostableFilterChange(e.target.value)}
            >
              <option value="">Todas las cuentas</option>
              <option value="true">Solo cuentas de movimiento</option>
              <option value="false">Solo cuentas de grupo</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || typeFilter || postableFilter) && (
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('')
                  setPostableFilter('')
                  setCurrentPage(1)
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Cuentas</div>
          <div className="text-2xl font-bold text-gray-900">
            {accounts?.length || 0}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="text-xs text-green-600">Activos</div>
          <div className="text-xl font-bold text-green-700">
            {accountsByType.asset || 0}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="text-xs text-red-600">Pasivos</div>
          <div className="text-xl font-bold text-red-700">
            {accountsByType.liability || 0}
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600">Capital</div>
          <div className="text-xl font-bold text-blue-700">
            {accountsByType.equity || 0}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-600">Ingresos</div>
          <div className="text-xl font-bold text-purple-700">
            {accountsByType.revenue || 0}
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="text-xs text-orange-600">Gastos</div>
          <div className="text-xl font-bold text-orange-700">
            {accountsByType.expense || 0}
          </div>
        </div>
      </div>

      {/* Postable Accounts Info */}
      <div className="mb-4 p-3 bg-info text-white rounded">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          <span>
            <strong>{postableCount}</strong> cuentas de movimiento disponibles para asientos contables
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <AccountsTableSimple
          accounts={accounts || []}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
        />
      </div>

      {/* Pagination */}
      {accounts && accounts.length > 0 && (
        <div className="mt-6">
          <PaginationSimple
            currentPage={currentPage}
            totalPages={Math.ceil((accounts.length || 0) / pageSize)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}