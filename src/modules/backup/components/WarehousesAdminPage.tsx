/**
 * WAREHOUSES ADMIN PAGE
 * Página principal de administración de warehouses
 * UI simple y elegante con funcionalidad completa
 */

'use client'

import { useState } from 'react'
import { useWarehouses, useWarehousesMutations } from '../hooks'
import { WarehousesTableSimple } from './WarehousesTableSimple'
import { WarehouseFormModal } from './WarehouseFormModal'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { Modal } from '@/ui/components/base/Modal'
import type { Warehouse, CreateWarehouseData, UpdateWarehouseData } from '../types'

export const WarehousesAdminPage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null)

  const pageSize = 20

  // Hooks - Backend DOES support pagination with correct format
  const { warehouses, meta, isLoading, error, mutate } = useWarehouses({
    filters: searchTerm ? { search: searchTerm } : undefined,
    pagination: { page: currentPage, size: pageSize }
  })

  // Debug: Log data to see what we're getting
  console.log('🔍 [WarehousesAdminPage] Debug info:', {
    warehouses,
    warehousesLength: warehouses?.length,
    meta,
    metaKeys: meta ? Object.keys(meta) : null,
    currentPage,
    isLoading,
    error,
    searchTerm
  })
  
  // Backend pagination info - correct structure
  const paginationInfo = meta?.page
  const hasRealPagination = !!(paginationInfo?.total && paginationInfo?.lastPage)
  
  console.log('📄 [Pagination Debug]:', {
    hasRealPagination,
    meta,
    paginationInfo,
    backendSupportsPagination: !!hasRealPagination
  })
  
  // Use backend pagination data
  const totalItems = paginationInfo?.total || 0
  const totalPages = paginationInfo?.lastPage || 1
  const currentBackendPage = paginationInfo?.currentPage || currentPage
  const pageFrom = paginationInfo?.from || 0
  const pageTo = paginationInfo?.to || 0
  
  console.log('📊 [Backend Pagination]:', {
    totalItems,
    totalPages,
    currentPage,
    currentBackendPage,
    pageFrom,
    pageTo,
    warehousesReceived: warehouses?.length
  })

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const { 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse, 
    isLoading: isMutating 
  } = useWarehousesMutations()

  // Handlers
  const handleCreate = async (data: CreateWarehouseData) => {
    try {
      await createWarehouse(data)
      setIsCreateModalOpen(false)
      mutate() // Refresh data
    } catch (error) {
      console.error('Error creating warehouse:', error)
      throw error
    }
  }

  const handleUpdate = async (data: UpdateWarehouseData) => {
    if (!editingWarehouse) return
    
    try {
      await updateWarehouse(editingWarehouse.id, data)
      setEditingWarehouse(null)
      mutate() // Refresh data
    } catch (error) {
      console.error('Error updating warehouse:', error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deletingWarehouse) return
    
    try {
      await deleteWarehouse(deletingWarehouse.id)
      setDeletingWarehouse(null)
      mutate() // Refresh data
    } catch (error) {
      console.error('Error deleting warehouse:', error)
      throw error
    }
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
  }

  const handleDeleteClick = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Almacenes</h1>
          <p className="text-muted">Administración de almacenes y centros de distribución</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isMutating}
        >
          <i className="bi bi-plus-circle me-2" />
          Agregar Almacén
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar almacenes..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error.message || 'Error al cargar los almacenes'}
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <WarehousesTableSimple
            warehouses={warehouses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
          
          {/* Pagination - Show if we have more than 1 page */}
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

      {/* Create Modal */}
      <WarehouseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Nuevo Almacén"
        isLoading={isMutating}
      />

      {/* Edit Modal */}
      <WarehouseFormModal
        isOpen={!!editingWarehouse}
        onClose={() => setEditingWarehouse(null)}
        onSubmit={handleUpdate}
        title="Editar Almacén"
        isLoading={isMutating}
        initialData={editingWarehouse || undefined}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingWarehouse}
        onClose={() => setDeletingWarehouse(null)}
        title="Eliminar Almacén"
      >
        <div className="modal-body">
          <p className="mb-0">
            ¿Estás seguro que deseas eliminar el almacén &quot;{deletingWarehouse?.name}&quot;?
          </p>
          <p className="text-muted small mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => setDeletingWarehouse(null)}
            disabled={isMutating}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isMutating}
            isLoading={isMutating}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}