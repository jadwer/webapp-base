/**
 * STOCK ADMIN PAGE - REAL IMPLEMENTATION
 * Página real de gestión de stock/inventario siguiendo patrón exitoso de Warehouses
 * Sencilla, profesional, bonita, completa
 */

'use client'

import React, { useState } from 'react'
import { useStock, useStockMutations } from '../hooks'
import { StockTableSimple } from './StockTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import type { Stock } from '../types'

export const StockAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Hooks con paginación real del backend
  const { stock, meta, isLoading, error, mutate } = useStock({
    filters: searchTerm ? { search: searchTerm } : undefined,
    pagination: { page: currentPage, size: pageSize }
  })

  // Paginación desde meta.page structure
  const paginationInfo = meta?.page
  const totalPages = paginationInfo?.lastPage || 1
  const totalItems = paginationInfo?.total || 0
  const currentBackendPage = paginationInfo?.currentPage || currentPage

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Debug logs para desarrollo
  console.log('📦 [StockAdminPageReal] Debug info:', {
    stock,
    stockLength: stock?.length,
    meta,
    paginationInfo,
    currentPage,
    totalPages,
    isLoading,
    error,
    searchTerm
  })

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Control de Inventario</h1>
          <p className="text-muted mb-0">
            Gestión de stock y niveles de inventario por producto y ubicación
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => {}}>
            <i className="bi bi-download me-2" />
            Exportar
          </Button>
          <Button variant="primary" onClick={() => {}}>
            <i className="bi bi-plus-lg me-2" />
            Ajuste de Stock
          </Button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total Productos</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-boxes" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Stock Disponible</h6>
                  <h3 className="mb-0">--</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Stock Bajo</h6>
                  <h3 className="mb-0">--</h3>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Sin Stock</h6>
                  <h3 className="mb-0">--</h3>
                </div>
                <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar productos en stock..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar el stock'}
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <StockTableSimple
            stock={stock}
            isLoading={isLoading}
            onEdit={() => {}}
            onAdjust={() => {}}
          />
          
          {/* Paginación - Show if we have more than 1 page */}
          {totalPages > 1 && (
            <PaginationSimple
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={paginationInfo?.perPage || pageSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}