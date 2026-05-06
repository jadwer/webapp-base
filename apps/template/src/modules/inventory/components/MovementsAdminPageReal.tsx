/**
 * MOVEMENTS ADMIN PAGE - REAL IMPLEMENTATION
 * Página real de gestión de movimientos de inventario siguiendo patrón exitoso de Warehouses
 * Sencilla, profesional, bonita, completa
 */

'use client'

import React, { useState } from 'react'
import { useInventoryMovements } from '../hooks'
import { MovementsTableSimple } from './MovementsTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const MovementsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Hooks con paginación real del backend
  const { movements, meta, isLoading, error } = useInventoryMovements({
    filters: searchTerm ? { search: searchTerm } : undefined,
    pagination: { page: currentPage, size: pageSize },
    include: ['product', 'warehouse', 'location'] // ¡Esto faltaba!
  })

  // Paginación desde meta.page structure
  const paginationInfo = meta?.page as { lastPage?: number; total?: number; currentPage?: number; perPage?: number } | undefined
  const totalPages = paginationInfo?.lastPage || 1
  const totalItems = paginationInfo?.total || 0
  const currentBackendPage = paginationInfo?.currentPage || currentPage

  // Calculate movement metrics dynamically
  const movementMetrics = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    return {
      entriesToday: movements.filter(m => {
        const movementDate = m.movementDate?.split('T')[0]
        return movementDate === today && m.movementType === 'entry'
      }).length,
      exitsToday: movements.filter(m => {
        const movementDate = m.movementDate?.split('T')[0]
        return movementDate === today && m.movementType === 'exit'
      }).length,
      transfers: movements.filter(m => m.movementType === 'transfer').length
    }
  }, [movements])

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Movimientos de Inventario</h1>
          <p className="text-muted mb-0">
            Historial y trazabilidad de movimientos de stock
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => {}}>
            <i className="bi bi-box-arrow-in-down me-2" />
            Entrada
          </Button>
          <Button variant="danger" onClick={() => {}}>
            <i className="bi bi-box-arrow-up me-2" />
            Salida
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigation.push('/dashboard/inventory/movements/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Movement Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Entradas Hoy</h6>
                  <h3 className="mb-0">{movementMetrics.entriesToday}</h3>
                </div>
                <i className="bi bi-box-arrow-in-down" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Salidas Hoy</h6>
                  <h3 className="mb-0">{movementMetrics.exitsToday}</h3>
                </div>
                <i className="bi bi-box-arrow-up" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Transferencias</h6>
                  <h3 className="mb-0">{movementMetrics.transfers}</h3>
                </div>
                <i className="bi bi-arrow-left-right" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total Movimientos</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-list-check" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar movimientos..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar los movimientos'}
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <MovementsTableSimple
            movements={movements}
            isLoading={isLoading}
            _onView={() => {}}
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