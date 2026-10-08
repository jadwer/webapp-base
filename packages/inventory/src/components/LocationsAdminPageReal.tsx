/**
 * LOCATIONS ADMIN PAGE
 * Listado de ubicaciones; vive como pestana de Almacenes.
 */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  Alert,
  ConfirmModal,
  ListToolbar,
  PageHeader,
  toast,
  type ConfirmModalHandle,
} from '@lwm/ui'
import { useLocations, useLocationsMutations, useWarehouses } from '../hooks'
import { LocationsTableSimple } from './LocationsTableSimple'
import { WarehousesTabs } from './WarehousesTabs'
import { PaginationSimple } from './PaginationSimple'
import { LOCATION_TYPE } from '../utils/labels'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'
import type { WarehouseLocationParsed } from '../types'

const PAGE_SIZE = 20

export const LocationsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const { locations, meta, isLoading, error } = useLocations({
    filters: {
      search: searchTerm || undefined,
      warehouseId: warehouseId || undefined,
      locationType: typeFilter || undefined,
      isActive: activeFilter === '' ? undefined : activeFilter === 'true',
    },
    pagination: { page: currentPage, size: PAGE_SIZE },
    include: ['warehouse'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const { deleteLocation } = useLocationsMutations()

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleDelete = async (location: WarehouseLocationParsed) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar la ubicación "${location.name}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar ubicación', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteLocation(location.id)
      toast.success('Ubicación eliminada')
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'la ubicación'))
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Almacenes"
        subtitle="Ubicaciones físicas dentro de cada almacén"
        actions={
          <Link
            href={
              warehouseId
                ? `/dashboard/inventory/locations/create?warehouseId=${warehouseId}`
                : '/dashboard/inventory/locations/create'
            }
            className="btn btn-primary"
          >
            <i className="bi bi-plus-lg me-2" />
            Nueva ubicación
          </Link>
        }
      />

      <WarehousesTabs />

      <ListToolbar
        search={{
          value: searchTerm,
          onChange: withReset(setSearchTerm),
          placeholder: 'Buscar por nombre',
        }}
      >
        <select
          className="form-select w-auto"
          value={warehouseId}
          onChange={(e) => withReset(setWarehouseId)(e.target.value)}
          aria-label="Filtrar por almacén"
        >
          <option value="">Todos los almacenes</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={typeFilter}
          onChange={(e) => withReset(setTypeFilter)(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(LOCATION_TYPE).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={activeFilter}
          onChange={(e) => withReset(setActiveFilter)(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar las ubicaciones'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <LocationsTableSimple
            locations={locations}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
          {page.lastPage > 1 && (
            <PaginationSimple
              currentPage={page.currentPage}
              totalPages={page.lastPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={page.total}
              pageSize={page.perPage}
            />
          )}
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
