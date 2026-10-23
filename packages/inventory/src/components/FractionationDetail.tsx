'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader, StatusBadge, toast } from '@lwm/ui'
import { fractionationService } from '../services/fractionationService'
import { useFractionation } from '../hooks/useFractionations'
import { FRACTIONATION_STATUS } from '../utils/labels'
import { formatDate as formatDateOnly, formatMoney, toNumber } from '../utils/format'
import type { Fractionation } from '../types/fractionation'

const LIST_HREF = '/dashboard/inventory/fraccionamiento'
const BATCH_HREF = '/dashboard/inventory/product-batch'
const MOVEMENT_HREF = '/dashboard/inventory/movements'

export const FRACTIONATION_DETAIL_INCLUDE = [
  'sourceProduct',
  'destinationProduct',
  'warehouse',
  'warehouseLocation',
  'user',
  'sourceBatch',
  'destinationBatch',
  'exitMovement',
  'entryMovement',
]

type BatchRef = Fractionation['sourceBatch']
type MovementRef = Fractionation['exitMovement']

const BatchCard = ({ title, batch, batchId }: { title: string; batch: BatchRef; batchId?: number | null }) => (
  <div className="col-md-6">
    <div className="text-muted small">{title}</div>
    {batch ? (
      <div>
        <Link href={`${BATCH_HREF}/${batch.id}`} className="fw-bold">{batch.batchNumber}</Link>
        {batch.lotNumber && <span className="text-muted ms-2">lote {batch.lotNumber}</span>}
        <div className="small text-muted">
          Caducidad: {batch.expirationDate ? formatDateOnly(batch.expirationDate) : 'sin caducidad'}
        </div>
      </div>
    ) : batchId ? (
      <Link href={`${BATCH_HREF}/${batchId}`}>Lote {batchId}</Link>
    ) : (
      <span className="text-muted">Sin lote</span>
    )}
  </div>
)

const MovementRow = ({ label, movement, movementId }: { label: string; movement: MovementRef; movementId?: number }) => (
  <tr>
    <td>{label}</td>
    <td>
      {movement || movementId ? (
        <Link href={`${MOVEMENT_HREF}/${movement?.id ?? movementId}`}>#{movement?.id ?? movementId}</Link>
      ) : '-'}
    </td>
    <td className="text-end">{movement ? formatNumber(toNumber(movement.quantity)) : '-'}</td>
    <td className="text-end">{movement ? formatMoney(movement.unitCost) : '-'}</td>
    <td className="text-end">{movement ? formatMoney(movement.totalValue) : '-'}</td>
  </tr>
)

interface FractionationDetailProps {
  fractionationId: string
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)
}

export const FractionationDetail = ({ fractionationId }: FractionationDetailProps) => {
  const { fractionation, isLoading, error, mutate } = useFractionation(
    fractionationId,
    FRACTIONATION_DETAIL_INCLUDE
  )
  const [confirming, setConfirming] = useState(false)
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const handleCancel = async () => {
    setCancelling(true)
    setCancelError(null)
    try {
      await fractionationService.cancel(fractionationId, reason.trim())
      toast.success('Fraccionamiento cancelado: el producto origen regresó al inventario')
      setConfirming(false)
      await mutate()
    } catch (err) {
      // Regla 7: el motivo del rechazo (p. ej. lo producido ya se vendió) con detalle
      const data = (err as { response?: { data?: { message?: string; errors?: Array<{ detail?: string }> } } }).response?.data
      setCancelError(data?.errors?.[0]?.detail || data?.message || 'No se pudo cancelar el fraccionamiento')
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando fraccionamiento...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !fractionation) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Fraccionamiento" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'El fraccionamiento no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={fractionation.folioNumber}
        icon="bi-scissors"
        badges={<StatusBadge status={fractionation.status} map={FRACTIONATION_STATUS} />}
        subtitle="Detalle del fraccionamiento"
        backHref={LIST_HREF}
        actions={
          fractionation.status === 'completed' && !confirming ? (
            <button type="button" className="btn btn-outline-danger" onClick={() => setConfirming(true)}>
              <i className="bi bi-arrow-counterclockwise me-2" />
              Cancelar fraccionamiento
            </button>
          ) : undefined
        }
      />

      {confirming && (
        <div className="alert alert-warning">
          <h6 className="alert-heading">¿Cancelar {fractionation.folioNumber}?</h6>
          <p className="mb-2 small">
            Se retiran del inventario las piezas producidas y el producto origen regresa a su lote con su costo original.
            Solo es posible si lo producido sigue completo (no se ha vendido ni movido).
          </p>
          <label htmlFor="fractionation-cancel-reason" className="form-label small mb-1">Motivo (opcional)</label>
          <textarea
            id="fractionation-cancel-reason"
            className="form-control form-control-sm mb-2"
            rows={2}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {cancelError && <div className="text-danger small mb-2">{cancelError}</div>}
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling && <span className="spinner-border spinner-border-sm me-2" />}
              Confirmar cancelación
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirming(false)} disabled={cancelling}>
              No cancelar
            </button>
          </div>
        </div>
      )}

      {fractionation.status === 'cancelled' && (
        <div className="alert alert-secondary">
          <i className="bi bi-x-circle me-2" />
          Cancelado el {formatDate(fractionation.cancelledAt ?? undefined)}
          {fractionation.cancellationReason ? `: ${fractionation.cancellationReason}` : ''}
        </div>
      )}

      <div className="row g-4">
        {/* Products info */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">Producto origen</h6>
            </div>
            <div className="card-body">
              {fractionation.sourceProduct ? (
                <>
                  <div className="fw-bold fs-5">{fractionation.sourceProduct.name}</div>
                  <div className="text-muted">{fractionation.sourceProduct.sku}</div>
                </>
              ) : (
                <span className="text-muted">ID: {fractionation.sourceProductId}</span>
              )}
              <div className="mt-3">
                <div className="text-muted small">Cantidad fraccionada</div>
                <div className="fw-bold fs-4 text-primary">{formatNumber(toNumber(fractionation.sourceQuantity))}</div>
                {fractionation.requestedQuantity != null && toNumber(fractionation.requestedQuantity) > toNumber(fractionation.sourceQuantity) && (
                  <div className="small text-muted">
                    Se pidió {formatNumber(toNumber(fractionation.requestedQuantity))}; el sobrante se quedó en el granel (piezas completas).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">Producto destino</h6>
            </div>
            <div className="card-body">
              {fractionation.destinationProduct ? (
                <>
                  <div className="fw-bold fs-5">{fractionation.destinationProduct.name}</div>
                  <div className="text-muted">{fractionation.destinationProduct.sku}</div>
                </>
              ) : (
                <span className="text-muted">ID: {fractionation.destinationProductId}</span>
              )}
              <div className="mt-3">
                <div className="text-muted small">Cantidad Producida</div>
                <div className="fw-bold fs-4 text-success">{formatNumber(toNumber(fractionation.producedQuantity))}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion details */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Detalles de la conversión</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted small">Factor de conversión</div>
                  <div className="fw-bold fs-5">{fractionation.conversionFactorUsed}x</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Porcentaje de Merma</div>
                  <div className="fw-bold fs-5">{fractionation.wastePercentage}%</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Cantidad Desperdicio</div>
                  <div className="fw-bold fs-5 text-warning">{formatNumber(toNumber(fractionation.wasteQuantity))}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Almacén</div>
                  <div className="fw-bold fs-5">
                    {fractionation.warehouse?.name || `ID: ${fractionation.warehouseId}`}
                  </div>
                  {fractionation.warehouseLocation && (
                    <div className="small text-muted">Ubicación: {fractionation.warehouseLocation.name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Costos */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Costo</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted small">Costo unitario origen</div>
                  <div className="fw-bold fs-5">{formatMoney(fractionation.sourceUnitCost)}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Costo unitario destino (merma incluida)</div>
                  <div className="fw-bold fs-5">{formatMoney(fractionation.destinationUnitCost)}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Valor transformado</div>
                  <div className="fw-bold fs-5">{formatMoney(fractionation.totalCost)}</div>
                </div>
              </div>
              {toNumber(fractionation.sourceUnitCost) <= 0 && (
                <div className="alert alert-warning mt-3 mb-0">
                  El origen no tenía costo al fraccionar: las presentaciones entraron con costo 0.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lotes */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Trazabilidad de lote</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <BatchCard title="Lote origen" batch={fractionation.sourceBatch} batchId={fractionation.sourceBatchId} />
                <BatchCard title="Lote destino" batch={fractionation.destinationBatch} batchId={fractionation.destinationBatchId} />
              </div>
            </div>
          </div>
        </div>

        {/* Movimientos */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Movimientos de inventario</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Tipo</th>
                      <th scope="col">Movimiento</th>
                      <th scope="col" className="text-end">Cantidad</th>
                      <th scope="col" className="text-end">Costo unitario</th>
                      <th scope="col" className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <MovementRow label="Salida (origen)" movement={fractionation.exitMovement} movementId={fractionation.exitMovementId} />
                    <MovementRow label="Entrada (destino)" movement={fractionation.entryMovement} movementId={fractionation.entryMovementId} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Información adicional</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted small">Ejecutado por</div>
                  <div>{fractionation.user?.name || `ID: ${fractionation.userId}`}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Fecha de ejecución</div>
                  <div>{formatDate(fractionation.executedAt)}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Fecha de Registro</div>
                  <div>{formatDate(fractionation.createdAt)}</div>
                </div>
                {fractionation.notes && (
                  <div className="col-12">
                    <div className="text-muted small">Notas</div>
                    <div>{fractionation.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
