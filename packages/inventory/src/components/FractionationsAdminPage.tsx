/**
 * FRACTIONATIONS ADMIN PAGE
 * Historial de fraccionamiento con pestanas Historial | Conversiones.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Alert, ListToolbar, PageHeader } from '@lwm/ui'
import { useFractionations } from '../hooks/useFractionations'
import { useWarehouses } from '../hooks'
import { FractionationHistory } from './FractionationHistory'
import { FractionationTabs } from './FractionationTabs'
import { PaginationSimple } from './PaginationSimple'
import { FRACTIONATION_STATUS } from '../utils/labels'
import { readPageMeta } from '../utils/listing'

const PAGE_SIZE = 20

export const FractionationsAdminPage = () => {
  const [folio, setFolio] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { fractionations, meta, isLoading, error } = useFractionations({
    filters: {
      folioNumber: folio.trim() || undefined,
      status: statusFilter || undefined,
      warehouse: warehouseId || undefined,
    },
    pagination: { page: currentPage, size: PAGE_SIZE },
    include: ['sourceProduct', 'destinationProduct', 'warehouse'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Fraccionamiento"
        subtitle="Conversión de productos a presentaciones menores"
        actions={
          <Link href="/dashboard/inventory/fraccionamiento/create" className="btn btn-primary">
            <i className="bi bi-scissors me-2" />
            Nuevo fraccionamiento
          </Link>
        }
      />

      <FractionationTabs />

      <ListToolbar
        search={{
          value: folio,
          onChange: withReset(setFolio),
          placeholder: 'Folio exacto',
        }}
      >
        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => withReset(setStatusFilter)(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(FRACTIONATION_STATUS).map(([value, { label }]) => (
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
          {error.message || 'Error al cargar el historial'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <FractionationHistory fractionations={fractionations} isLoading={isLoading} />
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
    </div>
  )
}
