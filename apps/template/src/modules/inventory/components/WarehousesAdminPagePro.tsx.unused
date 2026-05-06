/**
 * WAREHOUSES ADMIN PAGE PRO
 * Página principal de administración de warehouses
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useWarehouses, useWarehousesMutations } from '../hooks'
import { useWarehouseUIStore } from '../store'
import { WarehousesTable } from './WarehousesTable'
import { WarehousesFilters } from './WarehousesFilters'
import type { Warehouse } from '../types'

export const WarehousesAdminPagePro: React.FC = () => {
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
  } = useWarehouseUIStore()
  
  // Server State (SWR) - Data fetching with cache
  const {
    warehouses,
    isLoading,
    error,
    mutate
  } = useWarehouses({
    filters,
    sort,
    pagination,
    include: ['locations', 'stock']
  })
  
  // Mutations
  const { deleteWarehouse } = useWarehousesMutations()
  
  // Memoized data to prevent unnecessary re-renders
  const warehousesData = useMemo(() => warehouses || [], [warehouses])
  
  const handleEdit = (warehouse: Warehouse) => {
    router.push(`/dashboard/inventory/warehouses/${warehouse.id}/edit`)
  }
  
  const handleView = (warehouse: Warehouse) => {
    router.push(`/dashboard/inventory/warehouses/${warehouse.id}`)
  }
  
  const handleDelete = async (warehouse: Warehouse) => {
    try {
      await deleteWarehouse(warehouse.id)
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
            Warehouse eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } catch (error: any) {
      console.error('Error deleting warehouse:', error)
      
      // Check for FK constraint errors
      const isFKConstraint = error?.response?.status === 409 || 
                            error?.response?.data?.errors?.some((err: any) => 
                              err.code === 'FOREIGN_KEY_CONSTRAINT'
                            )
      
      const message = isFKConstraint 
        ? 'No se puede eliminar el warehouse porque tiene locations o stock asociados'
        : 'Error al eliminar el warehouse'
      
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
      await Promise.all(selectedIds.map(id => deleteWarehouse(id)))
      setSelectedIds([])
      mutate()
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Error loading warehouses: {error.message}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Warehouses Management</h2>
          <p className="text-muted mb-0">
            Administración de almacenes y centros de distribución
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
            onClick={() => router.push('/dashboard/inventory/warehouses/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Create Warehouse
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <WarehousesFilters 
            filters={filters}
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
            <span>{warehousesData.length} warehouses found</span>
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
        <WarehousesTable
          warehouses={warehousesData}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(warehouse) => setShowDeleteModal(warehouse.id)}
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
                Are you sure you want to delete this warehouse? This action cannot be undone.
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
                    const warehouse = warehousesData.find(w => w.id === showDeleteModal)
                    if (warehouse) handleDelete(warehouse)
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