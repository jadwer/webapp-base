'use client'

/**
 * GESTION DE COMPRAS con la piel del rediseno (Figma "Diseno final - Compras", 2026-11-17).
 * Indicadores con totales reales del backend (meta.page.total por filtro) que filtran el
 * listado; paginado en el servidor (antes pintaba todas las ordenes). Conserva lo que el
 * diseno no dibuja: sucursal, fecha estimada de llegada con su aviso de atraso y el acceso
 * a "Por recibir".
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LwSurface, LwPageTitle, LwKpiCard, LwPagination, LwTableWrap, LwStatusPill, LwIconButton, formatCurrency, formatDateOnly, saveBlobAs, getBlobErrorMessage, toast } from '@lwm/ui'
import { BranchFilter, axiosClient } from '@lwm/auth'
import { usePurchaseOrders, usePurchaseOrdersCount, usePurchaseReports } from '../hooks'
import { PURCHASE_STATUS_OPTIONS, purchaseStatusLabel, purchaseStatusTone, isPurchaseOrderClosed, type PurchaseStatusKey } from '../utils/status'
import { etaStatus, localTodayYmd } from '../utils/eta'
import type { PurchaseOrder, PurchaseOrderFilters } from '../types'

const BASE = '/dashboard/purchase'
type Quick = '' | 'pending' | 'approved' | 'receipt'

const show = (v: number | null | undefined) => (v == null ? '--' : v.toLocaleString('es-MX'))

const ETA_TONE = { late: 'danger', today: 'warning', ok: 'info' } as const

export const PurchaseOrdersAdminPage: React.FC = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PurchaseStatusKey | ''>('')
  const [quick, setQuick] = useState<Quick>('')
  const [branchId, setBranchId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filters: PurchaseOrderFilters = {
    ...(search && { search }),
    ...(branchId && { branchId }),
    ...(status && { status }),
    ...(quick === 'pending' && { status: 'pending' }),
    ...(quick === 'approved' && { status: 'approved' }),
    ...(quick === 'receipt' && { pendingReceipt: true }),
  }
  const { purchaseOrders, meta, isLoading, error } = usePurchaseOrders(filters, { page, pageSize: perPage })

  // Exporta TODO lo que cumple los filtros del listado, no solo la pagina (COM-16).
  const [exporting, setExporting] = useState(false)
  const exportToExcel = async () => {
    setExporting(true)
    try {
      const params: Record<string, string> = {}
      if (filters.search) params['filter[search]'] = filters.search
      if (filters.status) params['filter[status]'] = String(filters.status)
      if (filters.branchId) params['filter[branch]'] = String(filters.branchId)
      if (filters.pendingReceipt) params['filter[pending_receipt]'] = 'true'
      const response = await axiosClient.get('/api/v1/purchase-orders/export', { params, responseType: 'blob' })
      saveBlobAs(response.data as Blob, `ordenes-de-compra-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (err) {
      toast.error(await getBlobErrorMessage(err, 'No se pudo exportar el listado'))
    } finally {
      setExporting(false)
    }
  }
  const pageMeta = (meta as { page?: { total?: number; lastPage?: number; currentPage?: number } })?.page

  const total = usePurchaseOrdersCount(branchId ? { branchId } : undefined)
  const pending = usePurchaseOrdersCount({ status: 'pending', ...(branchId && { branchId }) })
  const approved = usePurchaseOrdersCount({ status: 'approved', ...(branchId && { branchId }) })
  const receipt = usePurchaseOrdersCount({ pendingReceipt: true, ...(branchId && { branchId }) })
  const reports = usePurchaseReports('2000-01-01', localTodayYmd())
  const byStatus = ((reports.reports as { byStatus?: Array<{ status: string; total_amount: string | number }> } | undefined)?.byStatus) ?? []
  const value = reports.reports ? byStatus.filter((r) => r.status !== 'cancelled').reduce((sum, r) => sum + Number(r.total_amount || 0), 0) : null

  const hasFilters = Boolean(search || status || quick || branchId)
  const pick = (q: Quick) => { setQuick(quick === q ? '' : q); setStatus(''); setPage(1) }
  const clear = () => { setSearch(''); setSearchTerm(''); setStatus(''); setQuick(''); setBranchId(''); setPage(1) }
  const offset = (page - 1) * perPage

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Gestión de compras"
          subtitle="Administra las órdenes de compra y relaciones con proveedores"
          actions={
            <>
              <button type="button" className="btn btn-outline-primary" onClick={exportToExcel} disabled={exporting} data-testid="purchase-export">
                <i className="bi bi-file-earmark-excel me-1" aria-hidden="true" /> {exporting ? 'Exportando...' : 'Exportar a Excel'}
              </button>
              <Link href={`${BASE}/pending-receipt`} className="btn btn-outline-primary">
                <i className="bi bi-box-arrow-in-down me-1" aria-hidden="true" /> Por recibir
              </Link>
              <Link href={`${BASE}/create`} className="btn btn-primary">
                <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nueva orden de compra
              </Link>
            </>
          }
        />

        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3 mb-4">
          <div className="col"><LwKpiCard label="Total órdenes" value={show(total.count)} icon="bi-clipboard-data" highlight={!quick} isLoading={total.isLoading} onClick={clear} /></div>
          <div className="col"><LwKpiCard label="Pendientes" value={show(pending.count)} icon="bi-clock" highlight={quick === 'pending'} isLoading={pending.isLoading} onClick={() => pick('pending')} /></div>
          <div className="col"><LwKpiCard label="Aprobadas" value={show(approved.count)} icon="bi-check-circle" highlight={quick === 'approved'} isLoading={approved.isLoading} onClick={() => pick('approved')} /></div>
          <div className="col"><LwKpiCard label="Por recibir" value={show(receipt.count)} icon="bi-box-arrow-in-down" hint="Pendientes y aprobadas sin recibir completas" highlight={quick === 'receipt'} isLoading={receipt.isLoading} onClick={() => pick('receipt')} /></div>
          <div className="col"><LwKpiCard label="Valor total" value={value == null ? '--' : formatCurrency(value)} icon="bi-currency-dollar" hint="Sin canceladas, todas las sucursales" isLoading={reports.isLoading} /></div>
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-4">
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchTerm.trim()); setPage(1) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar orden de compra o proveedor..."
                  aria-label="Buscar orden de compra"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '' && search) { setSearch(''); setPage(1) } }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={status} onChange={(e) => { setStatus(e.target.value as PurchaseStatusKey | ''); setQuick(''); setPage(1) }}>
              <option value="">Todos los estatus</option>
              {PURCHASE_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1) }} />
          </div>
          <div className="col d-flex justify-content-end">
            {hasFilters ? <button type="button" className="btn btn-link btn-sm" onClick={clear}>Limpiar filtros</button> : null}
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">No se pudieron cargar las órdenes de compra. Intenta de nuevo.</div> : null}

        <LwTableWrap>
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th className="text-center">No</th>
                <th>No. Orden</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Llegada estimada</th>
                <th className="text-end">Valor total</th>
                <th>Estatus</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">Cargando órdenes…</td></tr>
              ) : purchaseOrders.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">{hasFilters ? 'No se encontraron órdenes con esos filtros' : 'Todavía no hay órdenes de compra'}</td></tr>
              ) : (
                (purchaseOrders as PurchaseOrder[]).map((o, i) => {
                  const eta = etaStatus(o.expectedArrivalDate, o.status)
                  const number = o.orderNumber || `#${o.id}`
                  return (
                    <tr key={o.id}>
                      <td className="text-center text-muted">{String(offset + i + 1).padStart(2, '0')}</td>
                      <td className="text-nowrap"><Link href={`${BASE}/${o.id}`}>{number}</Link></td>
                      <td>{o.contact?.name || 'Proveedor sin datos'}</td>
                      <td className="text-nowrap">{o.orderDate ? formatDateOnly(o.orderDate) : '—'}</td>
                      <td className="text-nowrap">
                        {o.expectedArrivalDate ? formatDateOnly(o.expectedArrivalDate) : <span className="text-muted">Sin fecha</span>}
                        {eta.tone === 'late' || eta.tone === 'today' || eta.tone === 'ok' ? (
                          <div><LwStatusPill tone={ETA_TONE[eta.tone]}>{eta.label}</LwStatusPill></div>
                        ) : null}
                      </td>
                      <td className="text-end text-nowrap">{formatCurrency(o.totalAmount)}</td>
                      <td>
                        <LwStatusPill tone={purchaseStatusTone(o.status)}>{purchaseStatusLabel(o.status)}</LwStatusPill>
                        {o.approvalStatus === 'pending' ? <div className="small text-muted">Por aprobar</div> : null}
                      </td>
                      <td className="text-center text-nowrap">
                        <LwIconButton icon="bi-eye" label={`Consultar orden ${number}`} onClick={() => router.push(`${BASE}/${o.id}`)} />
                        {!isPurchaseOrderClosed(o.status) ? (
                          <LwIconButton icon="bi-pencil" label={`Editar orden ${number}`} onClick={() => router.push(`${BASE}/${o.id}/edit`)} />
                        ) : null}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </LwTableWrap>

        <LwPagination
          page={pageMeta?.currentPage ?? page}
          lastPage={pageMeta?.lastPage ?? 1}
          perPage={perPage}
          total={pageMeta?.total}
          onPage={setPage}
          onPerPage={(n) => { setPerPage(n); setPage(1) }}
        />
      </LwSurface>
    </div>
  )
}

export default PurchaseOrdersAdminPage
