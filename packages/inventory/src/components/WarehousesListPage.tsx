'use client'

/**
 * Almacenes con la piel del rediseno (Figma "Rediseño Labor wasser",
 * Inventario, 2026-11-15). Conserva lo de antes: filtros por clasificacion,
 * estatus y sucursal, pestana Ubicaciones y eliminar con el motivo del rechazo.
 * Nuevo: busqueda por nombre, codigo o ciudad, columna de ubicaciones.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LwSurface,
  LwPageTitle,
  LwTableWrap,
  LwStatusPill,
  LwCountPill,
  LwIconButton,
  LwPagination,
  LwResultModal,
  toast,
  type LwTone,
} from '@lwm/ui'
import { BranchFilter, useBranchName } from '@lwm/auth'
import { useWarehouses, useWarehousesMutations } from '../hooks'
import { WarehousesTabs } from './WarehousesTabs'
import { WAREHOUSE_TYPE } from '../utils/labels'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'
import type { WarehouseParsed } from '../types'

/** Tono de la clasificacion, como en el diseno (principal azul, secundario verde...). */
export const WAREHOUSE_TYPE_TONE: Record<string, LwTone> = {
  main: 'info',
  secondary: 'success',
  distribution: 'navy',
  returns: 'neutral',
}

interface Filters {
  search?: string
  warehouseType?: string
  isActive?: string
  branchId?: string
}

export function WarehousesListPage() {
  const router = useRouter()
  const branchName = useBranchName()
  const [filters, setFilters] = useState<Filters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [toDelete, setToDelete] = useState<WarehouseParsed | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { warehouses, meta, isLoading, error } = useWarehouses({
    filters: {
      search: filters.search,
      warehouseType: filters.warehouseType,
      isActive: filters.isActive === undefined ? undefined : filters.isActive === 'true',
      branchId: filters.branchId,
    },
    pagination: { page, size: perPage },
  })
  const { deleteWarehouse } = useWarehousesMutations()
  const pageInfo = readPageMeta(meta, page, perPage)
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  const setFilter = (next: Filters) => {
    setFilters(next)
    setPage(1)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteWarehouse(toDelete.id)
      toast.success(`Almacén ${toDelete.name} eliminado`)
      setToDelete(null)
    } catch (err) {
      // El backend explica por que no se puede (tiene existencias, movimientos...): se muestra tal cual.
      toast.error(deleteErrorMessage(err, 'el almacén'))
    } finally {
      setDeleting(false)
    }
  }

  const place = (w: WarehouseParsed) => [w.city, w.state].filter(Boolean).join(', ') || '—'

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Gestión de almacenes" subtitle="Administra almacenes y centros de distribución por sucursal" />

        <WarehousesTabs />

        <div className="row g-2 align-items-center mb-3 mt-1">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); setFilter({ ...filters, search: searchTerm.trim() || undefined }) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por nombre, código o ciudad..."
                  aria-label="Buscar almacén"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    if (e.target.value === '' && filters.search) setFilter({ ...filters, search: undefined })
                  }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Clasificación" value={filters.warehouseType ?? ''} onChange={(e) => setFilter({ ...filters, warehouseType: e.target.value || undefined })}>
              <option value="">Todas las clasificaciones</option>
              {Object.entries(WAREHOUSE_TYPE).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={filters.isActive ?? ''} onChange={(e) => setFilter({ ...filters, isActive: e.target.value || undefined })}>
              <option value="">Todos los estatus</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          {branchName.multi ? (
            <div className="col-md-auto">
              <BranchFilter className="form-select" value={filters.branchId ?? ''} onChange={(branchId) => setFilter({ ...filters, branchId: branchId || undefined })} />
            </div>
          ) : null}
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? (
              <button type="button" className="btn btn-link btn-sm" onClick={() => { setFilter({}); setSearchTerm('') }}>Limpiar filtros</button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={() => router.push('/dashboard/inventory/warehouses/create')}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo almacén
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudieron cargar los almacenes.'}</div> : null}

        <LwTableWrap>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>No</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                {branchName.multi ? <th>Sucursal</th> : null}
                <th>Clasificación</th>
                <th>Ubicaciones</th>
                <th>Estatus</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">Cargando almacenes…</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">{hasFilters ? 'Almacén no encontrado' : 'Todavía no hay almacenes'}</td></tr>
              ) : (
                warehouses.map((w, i) => (
                  <tr key={w.id}>
                    <td>{String((pageInfo.currentPage - 1) * pageInfo.perPage + i + 1).padStart(2, '0')}</td>
                    <td>{w.code}</td>
                    <td>{w.name}</td>
                    <td>{place(w)}</td>
                    {branchName.multi ? <td>{branchName.name(w.branchId)}</td> : null}
                    <td>
                      <LwStatusPill tone={WAREHOUSE_TYPE_TONE[w.warehouseType] ?? 'neutral'}>{WAREHOUSE_TYPE[w.warehouseType]?.label ?? w.warehouseType}</LwStatusPill>
                    </td>
                    <td><LwCountPill>{w.locationsCount ?? 0}</LwCountPill></td>
                    <td><LwStatusPill tone={w.isActive ? 'success' : 'neutral'}>{w.isActive ? 'Activo' : 'Inactivo'}</LwStatusPill></td>
                    <td className="text-end text-nowrap">
                      <LwIconButton icon="bi-eye" label={`Ver ${w.name}`} onClick={() => router.push(`/dashboard/inventory/warehouses/${w.id}`)} />
                      <LwIconButton icon="bi-pencil" label={`Editar ${w.name}`} onClick={() => router.push(`/dashboard/inventory/warehouses/${w.id}/edit`)} />
                      <LwIconButton icon="bi-trash" label={`Eliminar ${w.name}`} onClick={() => setToDelete(w)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </LwTableWrap>

        <LwPagination page={pageInfo.currentPage} lastPage={pageInfo.lastPage} perPage={pageInfo.perPage} total={pageInfo.total} onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }} />
      </LwSurface>

      <LwResultModal
        open={toDelete !== null}
        tone="danger"
        title="Eliminar almacén"
        message={`Estás a punto de eliminar ${toDelete?.name ?? 'el almacén'}. No se podrá recuperar. ¿Deseas continuar?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
