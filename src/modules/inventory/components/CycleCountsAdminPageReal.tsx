/**
 * CYCLE COUNTS ADMIN PAGE - REAL IMPLEMENTATION
 *
 * Pagina de gestion de conteos ciclicos de inventario siguiendo patron exitoso.
 * Incluye metricas, filtros, acciones rapidas y tabla con operaciones.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useCycleCounts } from '../hooks/useCycleCounts'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { CycleCountsTableSimple } from './CycleCountsTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { CycleCountFilters, CycleCountStatus } from '../types'

export const CycleCountsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<CycleCountStatus[]>([])
  const [showOverdue, setShowOverdue] = useState(false)
  const pageSize = 20
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Mutations hook
  const { startCount, cancelCount, isLoading: isMutating } = useCycleCountMutations()

  // Build filters
  const filters: CycleCountFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter.length > 0 && { status: statusFilter }),
    ...(showOverdue && { overdue: true })
  }

  // Hooks con paginacion real del backend
  const { cycleCounts, meta, isLoading, error } = useCycleCounts({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    page: currentPage,
    pageSize: pageSize
  })

  // Paginacion desde meta structure
  const totalPages = meta?.lastPage || 1
  const totalItems = meta?.total || 0
  const currentBackendPage = meta?.currentPage || currentPage

  // Calculate metrics dynamically
  const countMetrics = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      total: cycleCounts.length,
      scheduled: cycleCounts.filter(c => c.status === 'scheduled').length,
      inProgress: cycleCounts.filter(c => c.status === 'in_progress').length,
      completed: cycleCounts.filter(c => c.status === 'completed').length,
      withVariance: cycleCounts.filter(c => c.hasVariance).length,
      overdue: cycleCounts.filter(c => {
        if (c.status !== 'scheduled') return false
        const scheduled = new Date(c.scheduledDate)
        return scheduled < today
      }).length
    }
  }, [cycleCounts])

  // Reset to page 1 when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: CycleCountStatus[] | null) => {
    setStatusFilter(status || [])
    setShowOverdue(false)
    setCurrentPage(1)
  }

  const handleShowOverdue = () => {
    setStatusFilter(['scheduled'])
    setShowOverdue(true)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter([])
    setShowOverdue(false)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Action handlers
  const handleStartCount = useCallback(
    async (id: string) => {
      const count = cycleCounts.find(c => c.id === id)
      const confirmed = await confirmModalRef.current?.confirm(
        `Deseas iniciar el conteo ${count?.countNumber || id}? El estado cambiara a "En Progreso".`,
        {
          title: 'Iniciar Conteo',
          confirmVariant: 'warning',
          confirmText: 'Iniciar',
          cancelText: 'Cancelar'
        }
      )
      if (confirmed) {
        try {
          await startCount(id)
        } catch {
          // Error handled by mutation hook
        }
      }
    },
    [cycleCounts, startCount]
  )

  const handleRecordCount = useCallback(
    (id: string) => {
      // Navigate to record count page/modal
      navigation.push(`/dashboard/inventory/cycle-counts/${id}/record`)
    },
    [navigation]
  )

  const handleCancelCount = useCallback(
    async (id: string) => {
      const count = cycleCounts.find(c => c.id === id)
      const confirmed = await confirmModalRef.current?.confirm(
        `Estas seguro de cancelar el conteo ${count?.countNumber || id}? Esta accion no se puede deshacer.`,
        {
          title: 'Cancelar Conteo',
          confirmVariant: 'danger',
          confirmText: 'Cancelar Conteo',
          cancelText: 'Volver'
        }
      )
      if (confirmed) {
        try {
          await cancelCount(id, 'Cancelado por el usuario')
        } catch {
          // Error handled by mutation hook
        }
      }
    },
    [cycleCounts, cancelCount]
  )

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Conteos Ciclicos</h1>
          <p className="text-muted mb-0">Gestion de conteos ciclicos de inventario (Analisis ABC)</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigation.push('/dashboard/inventory/cycle-counts/create')}>
            <i className="bi bi-plus-lg me-2" />
            Nuevo Conteo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-clipboard-check" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-info text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter(['scheduled'])}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Programados</h6>
                  <h3 className="mb-0">{countMetrics.scheduled}</h3>
                </div>
                <i className="bi bi-calendar-event" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-warning text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter(['in_progress'])}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">En Progreso</h6>
                  <h3 className="mb-0">{countMetrics.inProgress}</h3>
                </div>
                <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-success text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter(['completed'])}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Completados</h6>
                  <h3 className="mb-0">{countMetrics.completed}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-danger text-white" style={{ cursor: 'pointer' }} onClick={handleShowOverdue}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Vencidos</h6>
                  <h3 className="mb-0">{countMetrics.overdue}</h3>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Con Variacion</h6>
                  <h3 className="mb-0">{countMetrics.withVariance}</h3>
                </div>
                <i className="bi bi-arrow-left-right" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body py-3">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted me-2">Filtros rapidos:</span>
                <Button
                  variant={statusFilter.includes('scheduled') && !showOverdue ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(['scheduled'])}
                >
                  <i className="bi bi-calendar-event me-1" />
                  Programados
                </Button>
                <Button
                  variant={statusFilter.includes('in_progress') ? 'warning' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(['in_progress'])}
                >
                  <i className="bi bi-hourglass-split me-1" />
                  En Progreso
                </Button>
                <Button variant={showOverdue ? 'danger' : 'secondary'} size="small" onClick={handleShowOverdue}>
                  <i className="bi bi-exclamation-triangle me-1" />
                  Vencidos
                </Button>
                <Button
                  variant={statusFilter.includes('completed') ? 'success' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(['completed'])}
                >
                  <i className="bi bi-check-circle me-1" />
                  Completados
                </Button>
                {(statusFilter.length > 0 || showOverdue || searchTerm) && (
                  <Button variant="secondary" size="small" onClick={handleClearFilters}>
                    <i className="bi bi-x-lg me-1" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar por numero de conteo, producto, almacen..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar los conteos ciclicos'}
        </Alert>
      )}

      {/* Alerts for critical situations */}
      {countMetrics.overdue > 0 && !showOverdue && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Atencion:</strong> Tienes {countMetrics.overdue} conteo(s) vencido(s) que requieren atencion
          inmediata.
          <Button variant="danger" size="small" className="ms-3" onClick={handleShowOverdue}>
            Ver vencidos
          </Button>
        </Alert>
      )}

      {countMetrics.inProgress > 0 && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-hourglass-split me-2" />
          <strong>En progreso:</strong> {countMetrics.inProgress} conteo(s) estan en progreso y esperan resultados.
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <CycleCountsTableSimple
            cycleCounts={cycleCounts}
            isLoading={isLoading || isMutating}
            onStartCount={handleStartCount}
            onRecordCount={handleRecordCount}
            onCancelCount={handleCancelCount}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationSimple
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={meta?.perPage || pageSize}
            />
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
