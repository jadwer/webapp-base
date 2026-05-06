/**
 * STOCK ADMIN PAGE PRO
 * Página principal de administración de stock
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useStock, useStockMutations, useWarehouses } from '../hooks'
import { useStockUIStore } from '../store'
import { StockTable } from './StockTable'
import { StockFilters } from './StockFilters'
import type { Stock } from '../types'

export const StockAdminPagePro: React.FC = () => {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  
  // UI State (Zustand) - Independent, no data re-fetch
  const {
    filters,
    sort,
    pagination,
    viewMode,
    selectedIds,
    setFilters,
    setSort,
    setPagination,
    setViewMode,
    setSelectedIds
  } = useStockUIStore()
  
  // Server State (SWR) - Data fetching with cache
  const {
    stock,
    isLoading,
    error,
    mutate
  } = useStock({
    filters,
    sort,
    pagination,
    include: ['product', 'warehouse', 'location']
  })
  
  // Warehouses for reference
  const { warehouses } = useWarehouses()
  
  // Mutations
  const { deleteStock } = useStockMutations()
  
  // Memoized data to prevent unnecessary re-renders
  const stockData = useMemo(() => stock || [], [stock])
  const warehousesData = useMemo(() => warehouses || [], [warehouses])
  
  const handleEdit = (stockItem: Stock) => {
    router.push(`/dashboard/inventory/stock/${stockItem.id}/edit`)
  }
  
  const handleView = (stockItem: Stock) => {
    router.push(`/dashboard/inventory/stock/${stockItem.id}`)
  }
  
  const handleDelete = async (stockItem: Stock) => {
    try {
      await deleteStock(stockItem.id)
      setShowDeleteModal(null)
      
      // Show success message
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-success text-white">
            <strong class="me-auto">Éxito</strong>
          </div>
          <div class="toast-body">
            Stock eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } catch (error: any) {
      console.error('Error deleting stock:', error)
      
      // Check for FK constraint errors
      const isFKConstraint = error?.response?.status === 409 || 
                            error?.response?.data?.errors?.some((err: any) => 
                              err.code === 'FOREIGN_KEY_CONSTRAINT'
                            )
      
      const message = isFKConstraint 
        ? 'No se puede eliminar el stock porque tiene movimientos asociados'
        : 'Error al eliminar el stock'
      
      // Show error message
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 6000)
    }
  }
  
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    
    try {
      await Promise.all(selectedIds.map(id => deleteStock(id)))
      setSelectedIds([])
      mutate()
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }
  
  // Calculate stock summary
  const stockSummary = useMemo(() => {
    const totalValue = stockData.reduce((sum, item) => sum + (item.totalValue || 0), 0)
    const totalQuantity = stockData.reduce((sum, item) => sum + item.quantity, 0)
    const lowStockCount = stockData.filter(item => 
      item.availableQuantity <= (item.minimumStock || 0)
    ).length
    
    return { totalValue, totalQuantity, lowStockCount }
  }, [stockData])
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Error loading stock: {error.message}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Stock Management</h2>
          <p className="text-muted mb-0">
            Administración de niveles de inventario por producto y ubicación
          </p>
        </div>
        <div className="d-flex gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => router.push('/dashboard/inventory/stock/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Add Stock Entry
          </Button>
        </div>
      </div>
      
      {/* Stock Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-box-seam display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{stockData.length}</div>
                  <div className="small">Stock Entries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-boxes display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{stockSummary.totalQuantity.toLocaleString()}</div>
                  <div className="small">Total Quantity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-currency-dollar display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">${stockSummary.totalValue.toLocaleString()}</div>
                  <div className="small">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-exclamation-triangle display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{stockSummary.lowStockCount}</div>
                  <div className="small">Low Stock Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <StockFilters 
            filters={filters}
            warehouses={warehousesData}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
      
      {/* View Mode Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span>{stockData.length} stock entries found</span>
          )}
        </div>
        <div className="btn-group" role="group">
          <input
            type="radio"
            className="btn-check"
            name="viewMode"
            id="table-view"
            checked={viewMode === 'table'}
            onChange={() => setViewMode('table')}
          />
          <label className="btn btn-outline-secondary btn-sm" htmlFor="table-view">
            <i className="bi bi-table" />
          </label>
          <input
            type="radio"
            className="btn-check"
            name="viewMode"
            id="grid-view"
            checked={viewMode === 'grid'}
            onChange={() => setViewMode('grid')}
          />
          <label className="btn btn-outline-secondary btn-sm" htmlFor="grid-view">
            <i className="bi bi-grid-3x3" />
          </label>
        </div>
      </div>
      
      {/* Content */}
      {viewMode === 'table' ? (
        <StockTable
          stock={stockData}
          warehouses={warehousesData}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(stockItem) => setShowDeleteModal(stockItem.id)}
          sort={sort}
          onSortChange={setSort}
        />
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">Grid view will be implemented in next iteration</p>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(null)}
                />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this stock entry? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const stockItem = stockData.find(s => s.id === showDeleteModal)
                    if (stockItem) handleDelete(stockItem)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}