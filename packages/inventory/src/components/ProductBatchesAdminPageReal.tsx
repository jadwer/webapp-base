/**
 * PRODUCT BATCHES ADMIN PAGE
 * Listado de lotes con alertas de vencimiento del backend (lot-traceability).
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Alert, KpiCard, ListToolbar, PageHeader } from '@lwm/ui'
import { useProductBatches, useWarehouses } from '../hooks'
import { useLotAlerts } from '../hooks/useInventoryCounts'
import { ProductBatchTableSimple } from './ProductBatchTableSimple'
import { PaginationSimple } from './PaginationSimple'
import { BATCH_STATUS } from '../utils/labels'
import type { ProductBatchStatus } from '../types'

const PAGE_SIZE = 20
const EXPIRING_DAYS = 30

export const ProductBatchesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductBatchStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { productBatches, meta, isLoading, error } = useProductBatches({
    filters: {
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      warehouseId: warehouseId || undefined,
    },
    page: currentPage,
    pageSize: PAGE_SIZE,
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const lotAlerts = useLotAlerts(EXPIRING_DAYS)

  const totalPages = meta?.lastPage || 1

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Lotes de productos"
        subtitle="Seguimiento de lotes por vencimiento, almacén y proveedor"
        actions={
          <Link href="/dashboard/inventory/product-batch/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" />
            Nuevo lote
          </Link>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <KpiCard
            label={`Lotes por vencer en ${EXPIRING_DAYS} días`}
            value={lotAlerts.expiringCount ?? '--'}
            icon="bi-clock-history"
            variant="warning"
            isLoading={lotAlerts.isLoading}
          />
        </div>
        <div className="col-md-6">
          <KpiCard
            label="Lotes vencidos con existencia"
            value={lotAlerts.expiredCount ?? '--'}
            icon="bi-x-octagon"
            variant="danger"
            isLoading={lotAlerts.isLoading}
          />
        </div>
      </div>

      <ListToolbar
        search={{
          value: searchTerm,
          onChange: withReset(setSearchTerm),
          placeholder: 'Buscar por lote, producto o proveedor',
        }}
      >
        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => withReset(setStatusFilter)(e.target.value as ProductBatchStatus | '')}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(BATCH_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
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
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar los lotes'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <ProductBatchTableSimple productBatches={productBatches} isLoading={isLoading} />
          {totalPages > 1 && (
            <PaginationSimple
              currentPage={meta?.currentPage || currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={meta?.total || 0}
              pageSize={meta?.perPage || PAGE_SIZE}
            />
          )}
        </div>
      </div>
    </div>
  )
}
