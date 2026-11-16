/**
 * CONTEOS CICLICOS con la piel del rediseno (2026-11-16). Indicadores con totales reales
 * del backend (meta.page.total por filtro; antes se contaba solo la pagina visible) que
 * filtran el listado. Iniciar y cancelar piden confirmacion y muestran el motivo si el
 * backend lo rechaza.
 */

'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { ConfirmModal, LwSurface, LwPageTitle, LwKpiCard, LwPagination, toast, type ConfirmModalHandle } from '@lwm/ui'
import { useCycleCounts } from '../hooks/useCycleCounts'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { useWarehouses } from '../hooks'
import { CycleCountsTableSimple } from './CycleCountsTableSimple'
import { CYCLE_COUNT_STATUS_OPTIONS } from '../types/cycleCount'
import { apiErrorMessage } from '../utils/listing'
import type { CycleCountFilters, CycleCountStatus } from '../types'

type Quick = '' | 'scheduled' | 'in_progress' | 'overdue' | 'variance'

const show = (v?: number) => (v == null ? '--' : v.toLocaleString('es-MX'))

export const CycleCountsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CycleCountStatus | ''>('')
  const [quick, setQuick] = useState<Quick>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const { startCount, cancelCount, isLoading: isMutating } = useCycleCountMutations()
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })

  const filters: CycleCountFilters = {
    ...(search && { search }),
    ...(warehouseId && { warehouseId }),
    ...(status && { status: [status] }),
    ...(quick === 'scheduled' && { status: ['scheduled'] as CycleCountStatus[] }),
    ...(quick === 'in_progress' && { status: ['in_progress'] as CycleCountStatus[] }),
    ...(quick === 'overdue' && { overdue: true }),
    ...(quick === 'variance' && { hasVariance: true }),
  }
  const { cycleCounts, meta, isLoading, error } = useCycleCounts({ filters, page, pageSize: perPage })

  // Totales reales por indicador
  const total = useCycleCounts({ pageSize: 1 })
  const scheduled = useCycleCounts({ filters: { status: ['scheduled'] }, pageSize: 1 })
  const inProgress = useCycleCounts({ filters: { status: ['in_progress'] }, pageSize: 1 })
  const overdue = useCycleCounts({ filters: { overdue: true }, pageSize: 1 })
  const variance = useCycleCounts({ filters: { hasVariance: true }, pageSize: 1 })
  const kpiLoading = [total, scheduled, inProgress, overdue, variance].some((k) => k.isLoading)

  const hasFilters = Boolean(search || status || quick || warehouseId)
  const pick = (q: Quick) => { setQuick(quick === q ? '' : q); setStatus(''); setPage(1) }
  const clear = () => { setSearch(''); setSearchTerm(''); setStatus(''); setQuick(''); setWarehouseId(''); setPage(1) }

  const handleStart = async (id: string) => {
    const c = cycleCounts.find((x) => x.id === id)
    const ok = await confirmRef.current?.confirm(`¿Iniciar el conteo ${c?.countNumber ?? id}? Quedará en proceso para registrar lo contado.`, { title: 'Iniciar conteo', confirmText: 'Iniciar', cancelText: 'Volver', confirmVariant: 'primary' })
    if (!ok) return
    try {
      await startCount(id)
      toast.success(`Conteo ${c?.countNumber ?? ''} en proceso`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo iniciar el conteo.'))
    }
  }

  const handleCancel = async (id: string) => {
    const c = cycleCounts.find((x) => x.id === id)
    const ok = await confirmRef.current?.confirm(`¿Cancelar el conteo ${c?.countNumber ?? id}? No se puede deshacer.`, { title: 'Cancelar conteo', confirmText: 'Cancelar conteo', cancelText: 'Volver', confirmVariant: 'danger' })
    if (!ok) return
    try {
      await cancelCount(id)
      toast.success(`Conteo ${c?.countNumber ?? ''} cancelado`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo cancelar el conteo.'))
    }
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Conteos cíclicos" subtitle="Conteos físicos por producto y almacén; la diferencia se ajusta en Movimientos" />

        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3 mb-4">
          <div className="col"><LwKpiCard label="Total de conteos" value={show(total.meta?.total)} icon="bi-clipboard-check" highlight isLoading={kpiLoading} onClick={clear} /></div>
          <div className="col"><LwKpiCard label="Programados" value={show(scheduled.meta?.total)} icon="bi-calendar-event" isLoading={kpiLoading} onClick={() => pick('scheduled')} /></div>
          <div className="col"><LwKpiCard label="En proceso" value={show(inProgress.meta?.total)} icon="bi-hourglass-split" isLoading={kpiLoading} onClick={() => pick('in_progress')} /></div>
          <div className="col"><LwKpiCard label="Vencidos" value={show(overdue.meta?.total)} icon="bi-exclamation-triangle" hint="Programados con fecha pasada" isLoading={kpiLoading} onClick={() => pick('overdue')} /></div>
          <div className="col"><LwKpiCard label="Con diferencia" value={show(variance.meta?.total)} icon="bi-arrow-left-right" isLoading={kpiLoading} onClick={() => pick('variance')} /></div>
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchTerm.trim()); setPage(1) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por conteo, producto o almacén..."
                  aria-label="Buscar conteo"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '' && search) { setSearch(''); setPage(1) } }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={status} onChange={(e) => { setStatus(e.target.value as CycleCountStatus | ''); setQuick(''); setPage(1) }}>
              <option value="">Todos los estatus</option>
              {CYCLE_COUNT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Almacén" value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setPage(1) }}>
              <option value="">Todos los almacenes</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? <button type="button" className="btn btn-link btn-sm" onClick={clear}>Limpiar filtros</button> : null}
            <Link href="/dashboard/inventory/cycle-counts/create" className="btn btn-primary">
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo conteo
            </Link>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudieron cargar los conteos.'}</div> : null}

        <CycleCountsTableSimple
          cycleCounts={cycleCounts}
          isLoading={isLoading || isMutating}
          hasFilters={hasFilters}
          offset={(page - 1) * perPage}
          onStartCount={handleStart}
          onCancelCount={handleCancel}
        />

        <LwPagination page={meta?.currentPage ?? page} lastPage={meta?.lastPage ?? 1} perPage={perPage} total={meta?.total} onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }} />
      </LwSurface>
      <ConfirmModal ref={confirmRef} />
    </div>
  )
}
