/**
 * LOCATIONS ADMIN PAGE - REAL IMPLEMENTATION
 * Página real de gestión de ubicaciones siguiendo patrón exitoso de Warehouses
 * Sencilla, profesional, bonita, completa
 */

'use client'

import React, { useState } from 'react'
import { useLocations, useLocationsMutations } from '../hooks'
import { LocationsTableSimple } from './LocationsTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import type { WarehouseLocation } from '../types'

export const LocationsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Hooks con paginación real del backend
  const { locations, meta, isLoading, error, mutate } = useLocations({
    filters: searchTerm ? { search: searchTerm } : undefined,
    pagination: { page: currentPage, size: pageSize }
  })

  // Paginación desde meta.page structure
  const paginationInfo = meta?.page
  const totalPages = paginationInfo?.lastPage || 1
  const totalItems = paginationInfo?.total || 0
  const currentBackendPage = paginationInfo?.currentPage || currentPage

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Debug logs para desarrollo
  console.log('🏢 [LocationsAdminPageReal] Debug info:', {
    locations,
    locationsLength: locations?.length,
    meta,
    paginationInfo,
    currentPage,
    totalPages,
    isLoading,
    error,
    searchTerm
  })

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Ubicaciones de Almacén</h1>
          <p className="text-muted mb-0">
            Gestión de ubicaciones físicas dentro de almacenes
          </p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          <i className="bi bi-plus-lg me-2" />
          Agregar Ubicación
        </Button>
      </div>

      {/* Filtros */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Buscar ubicaciones..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar las ubicaciones'}
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <LocationsTableSimple
            locations={locations}
            isLoading={isLoading}
            onEdit={() => {}}
            onDelete={() => {}}
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