/**
 * FRACCIONAMIENTO, pestana Historial, con la piel del rediseno (2026-11-16).
 * Conserva lo de antes: folio exacto, filtro por estatus y por almacen.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LwSurface, LwPagination } from '@lwm/ui'
import { useFractionations } from '../hooks/useFractionations'
import { useWarehouses } from '../hooks'
import { FractionationHistory } from './FractionationHistory'
import { FractionationHeader } from './FractionationTabs'
import { FRACTIONATION_STATUS } from '../utils/labels'
import { readPageMeta } from '../utils/listing'

export const FractionationsAdminPage = () => {
  const [folioTerm, setFolioTerm] = useState('')
  const [folio, setFolio] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { fractionations, meta, isLoading, error } = useFractionations({
    filters: {
      folioNumber: folio || undefined,
      status: statusFilter || undefined,
      warehouse: warehouseId || undefined,
    },
    pagination: { page: currentPage, size: perPage },
    include: ['sourceProduct', 'destinationProduct', 'warehouse'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })

  const page = readPageMeta(meta, currentPage, perPage)
  const hasFilters = Boolean(folio || statusFilter || warehouseId)

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <FractionationHeader subtitle="Conversión de productos a presentaciones menores" />

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); withReset(setFolio)(folioTerm.trim()) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Folio exacto..."
                  aria-label="Buscar por folio"
                  value={folioTerm}
                  onChange={(e) => { setFolioTerm(e.target.value); if (e.target.value === '' && folio) withReset(setFolio)('') }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={statusFilter} onChange={(e) => withReset(setStatusFilter)(e.target.value)} aria-label="Estatus">
              <option value="">Todos los estatus</option>
              {Object.entries(FRACTIONATION_STATUS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={warehouseId} onChange={(e) => withReset(setWarehouseId)(e.target.value)} aria-label="Almacén">
              <option value="">Todos los almacenes</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? (
              <button type="button" className="btn btn-link btn-sm" onClick={() => { setFolio(''); setFolioTerm(''); setStatusFilter(''); setWarehouseId(''); setCurrentPage(1) }}>Limpiar filtros</button>
            ) : null}
            <Link href="/dashboard/inventory/fraccionamiento/create" className="btn btn-primary">
              <i className="bi bi-scissors me-1" aria-hidden="true" /> Nuevo fraccionamiento
            </Link>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudo cargar el historial.'}</div> : null}

        <FractionationHistory fractionations={fractionations} isLoading={isLoading} hasFilters={hasFilters} offset={(page.currentPage - 1) * page.perPage} />

        <LwPagination page={page.currentPage} lastPage={page.lastPage} perPage={perPage} total={page.total} onPage={setCurrentPage} onPerPage={(n) => { setPerPage(n); setCurrentPage(1) }} />
      </LwSurface>
    </div>
  )
}
