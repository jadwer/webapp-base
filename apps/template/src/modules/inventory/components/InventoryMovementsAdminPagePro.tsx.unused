/**
 * INVENTORY MOVEMENTS ADMIN PAGE PRO
 * Página principal de administración de movimientos de inventario
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useInventoryMovements, useInventoryMovementsMutations, useWarehouses } from '../hooks'
import { useMovementUIStore } from '../store'
import { InventoryMovementsTable } from './InventoryMovementsTable'
import { InventoryMovementsFilters } from './InventoryMovementsFilters'
import type { InventoryMovement } from '../types'

export const InventoryMovementsAdminPagePro: React.FC = () => {
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
    setViewMode,
    setSelectedIds
  } = useMovementUIStore()
  
  // Server State (SWR) - Data fetching with cache
  const {
    movements,
    isLoading,
    error,
    mutate
  } = useInventoryMovements({
    filters,
    sort: sort || undefined,
    pagination,
    include: ['product', 'warehouse', 'location', 'destinationWarehouse', 'destinationLocation', 'user']
  })
  
  // Warehouses for reference
  const { warehouses } = useWarehouses()
  
  // Mutations
  const { deleteMovement } = useInventoryMovementsMutations()
  
  // Memoized data to prevent unnecessary re-renders
  const movementsData = useMemo(() => movements || [], [movements])
  const warehousesData = useMemo(() => warehouses || [], [warehouses])
  
  const handleEdit = (movement: InventoryMovement) => {
    router.push(`/dashboard/inventory/movements/${movement.id}/edit`)
  }
  
  const handleView = (movement: InventoryMovement) => {
    router.push(`/dashboard/inventory/movements/${movement.id}`)
  }
  
  const handleDelete = async (movement: InventoryMovement) => {
    try {
      await deleteMovement(movement.id)
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
            Movement eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } catch (error: any) {
      console.error('Error deleting movement:', error)
      
      const message = 'Error al eliminar el movement. Los movimientos suelen ser inmutables por auditoría.'
      
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
      await Promise.all(selectedIds.map(id => deleteMovement(id)))
      setSelectedIds([])
      mutate()
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }
  
  // Calculate movements summary
  const movementsSummary = useMemo(() => {
    const totalValue = movementsData.reduce((sum, movement) => sum + (movement.totalValue || 0), 0)
    const entriesCount = movementsData.filter(m => m.movementType === 'entry').length
    const exitsCount = movementsData.filter(m => m.movementType === 'exit').length
    const transfersCount = movementsData.filter(m => m.movementType === 'transfer').length
    
    return { totalValue, entriesCount, exitsCount, transfersCount }
  }, [movementsData])
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Error loading movements: {error.message}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Inventory Movements</h2>
          <p className="text-muted mb-0">
            Registro y seguimiento de todos los movimientos de inventario
          </p>
        </div>
        <div className="d-flex gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="danger" 
              size="small"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => router.push('/dashboard/inventory/movements/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Record Movement
          </Button>
        </div>
      </div>
      
      {/* Movements Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-arrow-repeat display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{movementsData.length}</div>
                  <div className="small">Total Movements</div>
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
                  <i className="bi bi-arrow-down-circle display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{movementsSummary.entriesCount}</div>
                  <div className="small">Entries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-arrow-up-circle display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{movementsSummary.exitsCount}</div>
                  <div className="small">Exits</div>
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
                  <i className="bi bi-arrow-left-right display-6" />
                </div>
                <div>
                  <div className="h4 mb-0">{movementsSummary.transfersCount}</div>
                  <div className="small">Transfers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <InventoryMovementsFilters 
            filters={filters}
            warehouses={warehousesData as unknown}
            products={[]} 
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
            <span>{movementsData.length} movements found</span>
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
        <InventoryMovementsTable
          movements={movementsData}
          warehouses={warehousesData}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(movement) => setShowDeleteModal(movement.id)}
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
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2" />
                  <strong>Warning:</strong> Deleting inventory movements can affect stock calculations and audit trail.
                </div>
                Are you sure you want to delete this movement? This action cannot be undone.
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
                    const movement = movementsData.find(m => m.id === showDeleteModal)
                    if (movement) handleDelete(movement)
                  }}
                >
                  Delete Movement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}