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
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { WarehouseParsed, CreateWarehouseData, UpdateWarehouseData } from '../types'

export const WarehousesAdminPage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseParsed | null>(null)
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseParsed | null>(null)

  const pageSize = 20
  const navigation = useNavigationProgress()

  // Hooks - Backend DOES support pagination with correct format
  const { warehouses, meta, isLoading, error, mutate } = useWarehouses({
    filters: searchTerm ? { search: searchTerm } : undefined,
    pagination: { page: currentPage, size: pageSize }
  })

  // Backend pagination info - correct structure
  const paginationInfo = meta?.page
  const hasRealPagination = !!(paginationInfo && typeof paginationInfo === 'object' && 'total' in paginationInfo && 'lastPage' in paginationInfo)

  // Use backend pagination data
  const totalItems = (paginationInfo && typeof paginationInfo === 'object' && 'total' in paginationInfo) ? (paginationInfo as Record<string, unknown>).total as number : 0
  const totalPages = (paginationInfo && typeof paginationInfo === 'object' && 'lastPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).lastPage as number : 1
  const currentBackendPage = (paginationInfo && typeof paginationInfo === 'object' && 'currentPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).currentPage as number : currentPage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _pageFrom = (paginationInfo && typeof paginationInfo === 'object' && 'from' in paginationInfo) ? (paginationInfo as Record<string, unknown>).from as number : 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _pageTo = (paginationInfo && typeof paginationInfo === 'object' && 'to' in paginationInfo) ? (paginationInfo as Record<string, unknown>).to as number : 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _hasRealPagination = hasRealPagination

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
  const handleCreate = async (data: CreateWarehouseData | UpdateWarehouseData) => {
    try {
      await createWarehouse(data as CreateWarehouseData)
      setIsCreateModalOpen(false)
      mutate() // Refresh data
    } catch (error) {
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
      throw error
    }
  }

  const handleEdit = (warehouse: WarehouseParsed) => {
    setEditingWarehouse(warehouse)
  }

  const handleDeleteClick = (warehouse: WarehouseParsed) => {
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
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => navigation.push('/dashboard/inventory/warehouses/create')}
          >
            <i className="bi bi-plus-circle me-2" />
            Crear Nuevo
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isMutating}
          >
            <i className="bi bi-plus-circle me-2" />
            Modal Rápido
          </Button>
        </div>
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
              pageSize={pageSize}
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
        show={!!deletingWarehouse}
        onHide={() => setDeletingWarehouse(null)}
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