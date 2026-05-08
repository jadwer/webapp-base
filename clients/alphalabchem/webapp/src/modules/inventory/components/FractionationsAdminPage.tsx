'use client'

import { useState } from 'react'
import { useFractionations } from '../hooks/useFractionations'
import { FractionationHistory } from './FractionationHistory'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const FractionationsAdminPage = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  const { fractionations, meta, isLoading, error } = useFractionations({
    filters: statusFilter ? { status: statusFilter } : undefined,
    pagination: { page: currentPage, size: pageSize },
    include: ['sourceProduct', 'destinationProduct', 'warehouse'],
  })

  const paginationInfo = meta?.page
  const totalItems = (paginationInfo && typeof paginationInfo === 'object' && 'total' in paginationInfo) ? (paginationInfo as Record<string, unknown>).total as number : 0
  const totalPages = (paginationInfo && typeof paginationInfo === 'object' && 'lastPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).lastPage as number : 1
  const currentBackendPage = (paginationInfo && typeof paginationInfo === 'object' && 'currentPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).currentPage as number : currentPage

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Fraccionamiento</h1>
          <p className="text-muted">Historial de fraccionamiento de productos</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigation.push('/dashboard/inventory/fraccionamiento/create')}
        >
          <i className="bi bi-scissors me-2" />
          Nuevo Fraccionamiento
        </Button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0 small text-muted">Estado:</label>
            </div>
            <div className="col-auto">
              <div className="btn-group btn-group-sm">
                <button
                  className={`btn ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setStatusFilter(''); setCurrentPage(1) }}
                >
                  Todos
                </button>
                <button
                  className={`btn ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setStatusFilter('completed'); setCurrentPage(1) }}
                >
                  Completados
                </button>
                <button
                  className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setStatusFilter('pending'); setCurrentPage(1) }}
                >
                  Pendientes
                </button>
                <button
                  className={`btn ${statusFilter === 'cancelled' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1) }}
                >
                  Cancelados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error.message || 'Error al cargar el historial'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <FractionationHistory
            fractionations={fractionations}
            isLoading={isLoading}
          />

          {totalPages > 1 && (
            <PaginationSimple
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}
