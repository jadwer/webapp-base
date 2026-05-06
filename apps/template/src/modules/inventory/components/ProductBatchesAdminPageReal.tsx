/**
 * PRODUCT BATCHES ADMIN PAGE - REAL IMPLEMENTATION
 * Página real de gestión de lotes de productos siguiendo patrón exitoso de MovementsAdminPageReal
 * Sencilla, profesional, bonita, completa
 */

'use client'

import React, { useState } from 'react'
import { useProductBatches } from '../hooks'
import { ProductBatchTableSimple } from './ProductBatchTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const ProductBatchesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const navigation = useNavigationProgress()

  // Hooks con paginación real del backend
  const { productBatches, meta, isLoading, error } = useProductBatches({
    filters: searchTerm ? { search: searchTerm } : undefined,
    page: currentPage,
    pageSize: pageSize
  })

  // Paginación desde meta structure
  const totalPages = meta?.lastPage || 1
  const totalItems = meta?.total || 0
  const currentBackendPage = meta?.currentPage || currentPage

  // Calculate batch metrics dynamically
  const batchMetrics = React.useMemo(() => {
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)
    
    return {
      total: productBatches.length,
      active: productBatches.filter(b => b.status === 'active').length,
      expired: productBatches.filter(b => {
        if (!b.expirationDate) return false
        return new Date(b.expirationDate) < now
      }).length,
      expiringSoon: productBatches.filter(b => {
        if (!b.expirationDate) return false
        const expDate = new Date(b.expirationDate)
        return expDate >= now && expDate <= sevenDaysFromNow
      }).length,
      lowStock: productBatches.filter(b => {
        if (!b.currentQuantity || !b.initialQuantity) return false
        return (b.currentQuantity / b.initialQuantity) <= 0.25
      }).length,
      quarantine: productBatches.filter(b => b.status === 'quarantine').length
    }
  }, [productBatches])

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
          <h1 className="h3 mb-0">Lotes de Productos</h1>
          <p className="text-muted mb-0">
            Gestión y seguimiento de lotes de productos por fechas y calidad
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => navigation.push('/dashboard/inventory/product-batch/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Nuevo Lote
          </Button>
        </div>
      </div>

      {/* Batch Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total Lotes</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Activos</h6>
                  <h3 className="mb-0">{batchMetrics.active}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Vencidos</h6>
                  <h3 className="mb-0">{batchMetrics.expired}</h3>
                </div>
                <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Vencen Pronto</h6>
                  <h3 className="mb-0">{batchMetrics.expiringSoon}</h3>
                </div>
                <i className="bi bi-clock" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Stock Bajo</h6>
                  <h3 className="mb-0">{batchMetrics.lowStock}</h3>
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
                  <h6 className="card-title text-white-50">Cuarentena</h6>
                  <h3 className="mb-0">{batchMetrics.quarantine}</h3>
                </div>
                <i className="bi bi-shield-exclamation" style={{ fontSize: '2rem', opacity: 0.7 }} />
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
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="warning" 
                  size="small"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    // Could implement status filter here
                  }}
                >
                  <i className="bi bi-clock me-1" />
                  Ver Próximos a Vencer
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    // Could implement status filter here
                  }}
                >
                  <i className="bi bi-x-circle me-1" />
                  Ver Vencidos
                </Button>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    // Could implement stock filter here
                  }}
                >
                  <i className="bi bi-exclamation-triangle me-1" />
                  Ver Stock Bajo
                </Button>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    // Could implement status filter here
                  }}
                >
                  <i className="bi bi-shield-exclamation me-1" />
                  Ver Cuarentena
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar por número de lote, producto, proveedor..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar los lotes'}
        </Alert>
      )}

      {/* Alerts for critical situations */}
      {batchMetrics.expired > 0 && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Atención:</strong> Tienes {batchMetrics.expired} lote(s) vencido(s) que requieren atención inmediata.
        </Alert>
      )}
      
      {batchMetrics.expiringSoon > 0 && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-clock me-2" />
          <strong>Alerta:</strong> {batchMetrics.expiringSoon} lote(s) vencerán en los próximos 7 días.
        </Alert>
      )}

      {batchMetrics.lowStock > 0 && (
        <Alert variant="info" className="mb-3">
          <i className="bi bi-info-circle me-2" />
          <strong>Información:</strong> {batchMetrics.lowStock} lote(s) tienen stock bajo (≤25%).
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <ProductBatchTableSimple
            productBatches={productBatches}
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
              pageSize={meta?.perPage || pageSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}