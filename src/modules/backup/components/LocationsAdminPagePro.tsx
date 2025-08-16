/**
 * LOCATIONS ADMIN PAGE PRO
 * Página principal de administración de warehouse locations
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useLocations, useLocationsMutations, useWarehouses } from '../hooks'
import { useLocationUIStore } from '../store'
import { LocationsTable } from './LocationsTable'
import { LocationsFilters } from './LocationsFilters'
import type { WarehouseLocation } from '../types'

export const LocationsAdminPagePro: React.FC = () => {
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
  } = useLocationUIStore()
  
  // Server State (SWR) - Data fetching with cache
  const {
    locations,
    isLoading,
    error,
    mutate
  } = useLocations({
    filters,
    sort,
    pagination,
    include: ['warehouse', 'stock']
  })
  
  // Warehouses for reference
  const { warehouses } = useWarehouses()
  
  // Mutations
  const { deleteLocation } = useLocationsMutations()
  
  // Memoized data to prevent unnecessary re-renders
  const locationsData = useMemo(() => locations || [], [locations])
  const warehousesData = useMemo(() => warehouses || [], [warehouses])
  
  const handleEdit = (location: WarehouseLocation) => {
    router.push(`/dashboard/inventory/locations/${location.id}/edit`)
  }
  
  const handleView = (location: WarehouseLocation) => {
    router.push(`/dashboard/inventory/locations/${location.id}`)
  }
  
  const handleDelete = async (location: WarehouseLocation) => {
    try {
      await deleteLocation(location.id)
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
            Location eliminada correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } catch (error: any) {
      console.error('Error deleting location:', error)
      
      // Check for FK constraint errors
      const isFKConstraint = error?.response?.status === 409 || 
                            error?.response?.data?.errors?.some((err: any) => 
                              err.code === 'FOREIGN_KEY_CONSTRAINT'
                            )
      
      const message = isFKConstraint 
        ? 'No se puede eliminar la location porque tiene stock asociado'
        : 'Error al eliminar la location'
      
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
      await Promise.all(selectedIds.map(id => deleteLocation(id)))
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
          Error loading locations: {error.message}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Warehouse Locations</h2>
          <p className="text-muted mb-0">
            Administración de ubicaciones dentro de los almacenes
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
            onClick={() => router.push('/dashboard/inventory/locations/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Create Location
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <LocationsFilters 
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
            <span>{locationsData.length} locations found</span>
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
        <LocationsTable
          locations={locationsData}
          warehouses={warehousesData}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(location) => setShowDeleteModal(location.id)}
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
                Are you sure you want to delete this location? This action cannot be undone.
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
                    const location = locationsData.find(l => l.id === showDeleteModal)
                    if (location) handleDelete(location)
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