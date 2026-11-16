'use client'

/**
 * DASHBOARD DE INVENTARIO con la piel del rediseno (2026-11-16). No hay pantalla en
 * Figma para el dashboard: se arma con las piezas Lw de las secciones ya disenadas
 * (decision de Gabino, 2026-11-15). Conserva lo de antes: totales reales del backend
 * (meta.page.total y lot-traceability), alertas de stock filtradas en el servidor,
 * actividad reciente y lotes por vencer. Cada indicador lleva a su listado ya filtrado.
 */

import React from 'react'
import Link from 'next/link'
import { LwSurface, LwPageTitle, LwKpiCard, LwTableWrap, LwStatusPill, type LwTone } from '@lwm/ui'
import { useInventoryDashboardCounts, useStockAlerts, useLotAlerts } from '../hooks/useInventoryCounts'
import { useRecentActivity } from '../hooks/useDashboard'
import { formatDate, formatQty, toNumber } from '../utils/format'
import { MOVEMENT_TYPE } from '../utils/labels'
import { MOVEMENT_TYPE_TONE } from './MovementsListPage'

const BASE = '/dashboard/inventory'
const LOT_DAYS = 30

const STOCK_ALERT: Record<'out_of_stock' | 'low_stock', { label: string; tone: LwTone }> = {
  out_of_stock: { label: 'Sin stock', tone: 'danger' },
  low_stock: { label: 'Stock bajo', tone: 'warning' },
}

const LOT_URGENCY: Record<string, { label: string; tone: LwTone }> = {
  critical: { label: 'Crítico', tone: 'danger' },
  high: { label: 'Alto', tone: 'warning' },
  medium: { label: 'Medio', tone: 'info' },
}

/** Conteo o '--' cuando el backend no lo dio (error o sin permiso) */
const show = (value: number | null) => (value == null ? '--' : value.toLocaleString('es-MX'))

function Panel({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h6 fw-semibold mb-0">{title}</h2>
        <Link href={href} className="small">{linkLabel}</Link>
      </div>
      <div className="flex-grow-1">{children}</div>
    </section>
  )
}

const Row = ({ cols, children }: { cols: number; children: React.ReactNode }) => (
  <tr><td colSpan={cols} className="text-center text-muted py-4">{children}</td></tr>
)

export const InventoryDashboardPage: React.FC = () => {
  const counts = useInventoryDashboardCounts()
  const stockAlerts = useStockAlerts(5)
  const lots = useLotAlerts(LOT_DAYS)
  const { recentMovements, isLoading: activityLoading } = useRecentActivity(5)

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Inventario"
          subtitle="Almacenes, existencias, movimientos y lotes"
          actions={
            <>
              <Link href={`${BASE}/movements/create`} className="btn btn-primary">
                <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo movimiento
              </Link>
              <Link href={`${BASE}/product-batch/create`} className="btn btn-outline-primary">
                <i className="bi bi-calendar-plus me-1" aria-hidden="true" /> Nuevo lote
              </Link>
            </>
          }
        />

        {/* Operacion */}
        <div className="row g-3 mb-3">
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Almacenes activos" value={show(counts.warehouses.count)} icon="bi-building" highlight hint={counts.locations.count == null ? undefined : `${show(counts.locations.count)} ubicaciones activas`} isLoading={counts.warehouses.isLoading} href={`${BASE}/warehouses`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Registros de stock" value={show(counts.stock.total)} icon="bi-boxes" isLoading={counts.stock.isLoading} href={`${BASE}/stock`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Movimientos de hoy" value={show(counts.movements.today)} icon="bi-arrow-left-right" hint={counts.movements.total == null ? undefined : `${show(counts.movements.total)} en total`} isLoading={counts.movements.isLoading} href={`${BASE}/movements`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Ajustes del mes" value={show(counts.movements.adjustmentsMonth)} icon="bi-sliders" isLoading={counts.movements.isLoading} href={`${BASE}/movements`} />
          </div>
        </div>

        {/* Alertas */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Stock bajo" value={show(counts.stock.low)} icon="bi-exclamation-triangle" hint="En o bajo el mínimo" isLoading={counts.stock.isLoading} href={`${BASE}/stock?level=low`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Sin stock" value={show(counts.stock.out)} icon="bi-x-octagon" hint="Existencia en cero" isLoading={counts.stock.isLoading} href={`${BASE}/stock?level=out`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label={`Lotes por vencer en ${LOT_DAYS} días`} value={show(lots.expiringCount)} icon="bi-clock-history" isLoading={lots.isLoading} href={`${BASE}/product-batch`} />
          </div>
          <div className="col-lg-3 col-md-6">
            <LwKpiCard label="Lotes vencidos con existencias" value={show(lots.expiredCount)} icon="bi-calendar-x" isLoading={lots.isLoading} href={`${BASE}/product-batch`} />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <Panel title="Actividad reciente" href={`${BASE}/movements`} linkLabel="Ver movimientos">
              <LwTableWrap>
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr><th>Producto</th><th>Tipo</th><th className="text-end">Cantidad</th><th>Fecha</th></tr>
                  </thead>
                  <tbody>
                    {activityLoading ? (
                      <Row cols={4}>Cargando movimientos…</Row>
                    ) : recentMovements.length === 0 ? (
                      <Row cols={4}>Todavía no hay movimientos</Row>
                    ) : (
                      recentMovements.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <Link href={`${BASE}/movements/${m.id}`} className="text-reset">{m.product?.name || 'Producto sin datos'}</Link>
                            <div className="small text-muted">{m.warehouse?.name || 'Sin almacén'}</div>
                          </td>
                          <td><LwStatusPill tone={MOVEMENT_TYPE_TONE[m.movementType] ?? 'neutral'}>{MOVEMENT_TYPE[m.movementType]?.label ?? m.movementType}</LwStatusPill></td>
                          <td className="text-end">{formatQty(m.quantity)}</td>
                          <td className="text-nowrap small">{formatDate(m.movementDate, { withTime: true })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </LwTableWrap>
            </Panel>
          </div>

          <div className="col-lg-6">
            <Panel title="Alertas de stock" href={`${BASE}/stock?level=low`} linkLabel="Ver stock bajo">
              <LwTableWrap>
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr><th>Producto</th><th className="text-end">Actual</th><th className="text-end">Mínimo</th><th>Nivel</th></tr>
                  </thead>
                  <tbody>
                    {stockAlerts.isLoading ? (
                      <Row cols={4}>Cargando alertas…</Row>
                    ) : stockAlerts.error ? (
                      <Row cols={4}>No se pudieron cargar las alertas. Intenta de nuevo más tarde.</Row>
                    ) : stockAlerts.alerts.length === 0 ? (
                      <Row cols={4}>Ningún producto está en o bajo su mínimo</Row>
                    ) : (
                      stockAlerts.alerts.map(({ id, type, stock }) => (
                        <tr key={`${type}-${id}`}>
                          <td>
                            <Link href={`${BASE}/stock/${stock.id}`} className="text-reset">{stock.product?.name || 'Producto sin datos'}</Link>
                            <div className="small text-muted">{stock.warehouse?.name || 'Sin almacén'}</div>
                          </td>
                          <td className="text-end">{formatQty(stock.quantity)}</td>
                          <td className="text-end">{formatQty(stock.minimumStock)}</td>
                          <td><LwStatusPill tone={STOCK_ALERT[type].tone}>{STOCK_ALERT[type].label}</LwStatusPill></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </LwTableWrap>
              {stockAlerts.total != null && stockAlerts.total > stockAlerts.alerts.length ? (
                <div className="small text-muted text-center mt-2">Y {show(stockAlerts.total - stockAlerts.alerts.length)} alertas más</div>
              ) : null}
            </Panel>
          </div>

          <div className="col-12">
            <Panel title="Lotes próximos a vencer" href={`${BASE}/product-batch`} linkLabel="Ver lotes">
              <LwTableWrap>
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Lote</th><th>Producto</th><th>Almacén</th><th>Vence</th>
                      <th className="text-end">Días</th><th className="text-end">Cantidad</th><th>Urgencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.isLoading ? (
                      <Row cols={7}>Cargando lotes…</Row>
                    ) : lots.error && lots.expiringCount == null ? (
                      <Row cols={7}>No se pudieron cargar los lotes. Intenta de nuevo más tarde.</Row>
                    ) : lots.expiring.length === 0 ? (
                      <Row cols={7}>Ningún lote activo vence en los próximos {LOT_DAYS} días</Row>
                    ) : (
                      lots.expiring.slice(0, 5).map((lot) => (
                        <tr key={lot.batch_id}>
                          <td><Link href={`${BASE}/product-batch/${lot.batch_id}`}>{lot.batch_number}</Link></td>
                          <td>{lot.product?.name || '—'}</td>
                          <td>{lot.warehouse?.name || '—'}</td>
                          <td className="text-nowrap">{formatDate(lot.expiration_date)}</td>
                          <td className="text-end">{Math.max(0, Math.ceil(toNumber(lot.days_until_expiry)))}</td>
                          <td className="text-end">{formatQty(lot.current_quantity)}</td>
                          <td>
                            <LwStatusPill tone={LOT_URGENCY[lot.urgency]?.tone ?? 'neutral'}>{LOT_URGENCY[lot.urgency]?.label ?? lot.urgency}</LwStatusPill>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </LwTableWrap>
            </Panel>
          </div>
        </div>
      </LwSurface>
    </div>
  )
}

export default InventoryDashboardPage
