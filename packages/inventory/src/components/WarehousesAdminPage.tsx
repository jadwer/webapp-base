/**
 * WAREHOUSES ADMIN PAGE
 * Listado de almacenes con pestanas Almacenes | Ubicaciones.
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
import { BranchFilter } from '@lwm/auth'
import { useWarehouses, useWarehousesMutations } from '../hooks'
import { WarehousesTableSimple } from './WarehousesTableSimple'
import { WarehousesTabs } from './WarehousesTabs'
import { PaginationSimple } from './PaginationSimple'
import { WAREHOUSE_TYPE } from '../utils/labels'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'
import type { WarehouseParsed } from '../types'

const PAGE_SIZE = 20

export const WarehousesAdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [branchId, setBranchId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const { warehouses, meta, isLoading, error } = useWarehouses({
    filters: {
      search: searchTerm || undefined,
      warehouseType: typeFilter || undefined,
      isActive: activeFilter === '' ? undefined : activeFilter === 'true',
      branchId: branchId || undefined,
    },
    pagination: { page: currentPage, size: PAGE_SIZE },
  })
  const { deleteWarehouse } = useWarehousesMutations()

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

  // Cualquier filtro regresa a la pagina 1
  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleDelete = async (warehouse: WarehouseParsed) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el almacén "${warehouse.name}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar almacén', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteWarehouse(warehouse.id)
      toast.success('Almacén eliminado')
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'el almacén'))
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Almacenes"
        subtitle="Almacenes y centros de distribución por sucursal"
        actions={
          <Link href="/dashboard/inventory/warehouses/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" />
            Nuevo almacén
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
          value={typeFilter}
          onChange={(e) => withReset(setTypeFilter)(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(WAREHOUSE_TYPE).map(([value, { label }]) => (
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
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <BranchFilter className="form-select w-auto" value={branchId} onChange={withReset(setBranchId)} />
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar los almacenes'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <WarehousesTableSimple
            warehouses={warehouses}
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
