'use client'

/**
 * DASHBOARD DE INVENTARIO
 * Totales reales del backend (meta.page.total y lot-traceability), alertas
 * de stock filtradas en el servidor y actividad reciente.
 */

import React from 'react'
import Link from 'next/link'
import { PageHeader, KpiCard, EmptyState, DetailSection, StatusBadge } from '@lwm/ui'
import type { StatusBadgeMap } from '@lwm/ui'
import { useInventoryDashboardCounts, useStockAlerts, useLotAlerts } from '../hooks/useInventoryCounts'
import { useRecentActivity } from '../hooks/useDashboard'
import { formatDate, formatQty, toNumber } from '../utils/format'
import { MOVEMENT_TYPE } from '../utils/labels'

const BASE = '/dashboard/inventory'
const LOT_DAYS = 30

const STOCK_ALERT_TYPE: StatusBadgeMap = {
  out_of_stock: { label: 'Sin stock', variant: 'danger' },
  low_stock: { label: 'Stock bajo', variant: 'warning' },
}

const LOT_URGENCY: StatusBadgeMap = {
  critical: { label: 'Crítico', variant: 'danger' },
  high: { label: 'Alto', variant: 'warning' },
  medium: { label: 'Medio', variant: 'info' },
}

/** Conteo o '--' cuando el backend no lo dio (error o sin permiso) */
const show = (value: number | null) => (value == null ? '--' : value.toLocaleString('es-MX'))

const Loading = () => (
  <div className="text-center py-4">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
)

export const InventoryDashboardPage: React.FC = () => {
  const counts = useInventoryDashboardCounts()
  const stockAlerts = useStockAlerts(5)
  const lots = useLotAlerts(LOT_DAYS)
  const { recentMovements, isLoading: activityLoading } = useRecentActivity(5)

  const todayMovements = counts.movements.today

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Inventario"
        subtitle="Almacenes, existencias, movimientos y lotes"
        actions={
          <>
            <Link href={`${BASE}/movements/create`} className="btn btn-primary">
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />
              Nuevo movimiento
            </Link>
            <Link href={`${BASE}/product-batch/create`} className="btn btn-outline-primary">
              <i className="bi bi-calendar-plus me-1" aria-hidden="true" />
              Nuevo lote
            </Link>
          </>
        }
      />

      {/* Totales */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <KpiCard
            label="Almacenes activos"
            value={show(counts.warehouses.count)}
            icon="bi-building"
            variant="primary"
            isLoading={counts.warehouses.isLoading}
            href={`${BASE}/warehouses`}
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <KpiCard
            label="Ubicaciones activas"
            value={show(counts.locations.count)}
            icon="bi-geo-alt"
            variant="info"
            isLoading={counts.locations.isLoading}
            href={`${BASE}/locations`}
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <KpiCard
            label="Registros de stock"
            value={show(counts.stock.total)}
            icon="bi-boxes"
            variant="success"
            isLoading={counts.stock.isLoading}
            href={`${BASE}/stock`}
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <KpiCard
            label="Movimientos"
            value={show(counts.movements.total)}
            icon="bi-arrow-left-right"
            variant="secondary"
            hint={todayMovements == null ? undefined : `${show(todayMovements)} hoy`}
            isLoading={counts.movements.isLoading}
            href={`${BASE}/movements`}
          />
        </div>
      </div>

      {/* Alertas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <KpiCard
            label="Stock bajo"
            value={show(counts.stock.low)}
            icon="bi-exclamation-triangle"
            variant="warning"
            hint="En o bajo el mínimo"
            isLoading={counts.stock.isLoading}
            href={`${BASE}/stock`}
          />
        </div>
        <div className="col-md-4">
          <KpiCard
            label="Sin stock"
            value={show(counts.stock.out)}
            icon="bi-x-octagon"
            variant="danger"
            hint="Existencia en cero"
            isLoading={counts.stock.isLoading}
            href={`${BASE}/stock`}
          />
        </div>
        <div className="col-md-4">
          <KpiCard
            label={`Lotes por vencer en ${LOT_DAYS} días`}
            value={show(lots.expiringCount)}
            icon="bi-calendar-x"
            variant="warning"
            hint={lots.expiredCount == null ? undefined : `${show(lots.expiredCount)} vencidos`}
            isLoading={lots.isLoading}
            href={`${BASE}/product-batch`}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Actividad reciente */}
        <div className="col-lg-6">
          <DetailSection
            title="Actividad reciente"
            icon="bi-activity"
            className="card h-100"
            headerActions={
              <Link href={`${BASE}/movements`} className="btn btn-sm btn-outline-secondary">
                Ver movimientos
              </Link>
            }
          >
            {activityLoading ? (
              <Loading />
            ) : recentMovements.length === 0 ? (
              <EmptyState
                icon="bi-clock-history"
                title="Sin actividad reciente"
                description="No hay movimientos registrados."
                className="text-center py-4"
              />
            ) : (
              <ul className="list-group list-group-flush">
                {recentMovements.map((movement) => (
                  <li key={movement.id} className="list-group-item px-0">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="flex-grow-1">
                        <div className="fw-semibold small">{movement.product?.name || 'Producto sin nombre'}</div>
                        <small className="text-muted">
                          {formatQty(movement.quantity)} · {movement.warehouse?.name || 'Sin almacén'}
                        </small>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={movement.movementType} map={MOVEMENT_TYPE} />
                        <div>
                          <small className="text-muted">{formatDate(movement.movementDate, { withTime: true })}</small>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        </div>

        {/* Alertas de stock */}
        <div className="col-lg-6">
          <DetailSection
            title="Alertas de stock"
            icon="bi-bell"
            className="card h-100"
            headerActions={
              <Link href={`${BASE}/stock`} className="btn btn-sm btn-outline-secondary">
                Ver stock
              </Link>
            }
          >
            {stockAlerts.isLoading ? (
              <Loading />
            ) : stockAlerts.error ? (
              <EmptyState
                icon="bi-exclamation-circle"
                title="No se pudieron cargar las alertas"
                description="Intenta de nuevo más tarde."
                className="text-center py-4"
              />
            ) : stockAlerts.alerts.length === 0 ? (
              <EmptyState
                icon="bi-shield-check"
                title="Sin alertas de stock"
                description="Ningún producto está en o bajo su mínimo."
                className="text-center py-4"
              />
            ) : (
              <>
                <ul className="list-group list-group-flush">
                  {stockAlerts.alerts.map(({ id, type, stock }) => (
                    <li key={`${type}-${id}`} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{stock.product?.name || 'Producto sin nombre'}</div>
                          <small className="text-muted">
                            Actual: {formatQty(stock.quantity)} · Mínimo: {formatQty(stock.minimumStock)} ·{' '}
                            {stock.warehouse?.name || 'Sin almacén'}
                          </small>
                        </div>
                        <StatusBadge status={type} map={STOCK_ALERT_TYPE} />
                      </div>
                    </li>
                  ))}
                </ul>
                {stockAlerts.total != null && stockAlerts.total > stockAlerts.alerts.length && (
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Y {show(stockAlerts.total - stockAlerts.alerts.length)} alertas más
                    </small>
                  </div>
                )}
              </>
            )}
          </DetailSection>
        </div>

        {/* Lotes proximos a vencer */}
        <div className="col-12">
          <DetailSection
            title="Lotes próximos a vencer"
            icon="bi-calendar-check"
            className="card"
            bodyClassName="p-0"
            headerActions={
              <Link href={`${BASE}/product-batch`} className="btn btn-sm btn-outline-secondary">
                Ver lotes
              </Link>
            }
          >
            {lots.isLoading ? (
              <Loading />
            ) : lots.error && lots.expiringCount == null ? (
              <EmptyState
                icon="bi-exclamation-circle"
                title="No se pudieron cargar los lotes"
                description="Intenta de nuevo más tarde."
                className="text-center py-4"
              />
            ) : lots.expiring.length === 0 ? (
              <EmptyState
                icon="bi-calendar-check"
                title="Sin lotes por vencer"
                description={`Ningún lote activo vence en los próximos ${LOT_DAYS} días.`}
                className="text-center py-4"
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Lote</th>
                      <th>Producto</th>
                      <th>Almacén</th>
                      <th>Vence</th>
                      <th className="text-end">Días</th>
                      <th className="text-end">Cantidad</th>
                      <th>Urgencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.expiring.slice(0, 5).map((lot) => (
                      <tr key={lot.batch_id}>
                        <td>
                          <Link href={`${BASE}/product-batch/${lot.batch_id}`}>{lot.batch_number}</Link>
                        </td>
                        <td>{lot.product?.name || '-'}</td>
                        <td>{lot.warehouse?.name || '-'}</td>
                        <td>{formatDate(lot.expiration_date)}</td>
                        <td className="text-end">{Math.max(0, Math.ceil(toNumber(lot.days_until_expiry)))}</td>
                        <td className="text-end">{formatQty(lot.current_quantity)}</td>
                        <td>
                          <StatusBadge status={lot.urgency} map={LOT_URGENCY} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  )
}

export default InventoryDashboardPage
