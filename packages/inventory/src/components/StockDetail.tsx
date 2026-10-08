/**
 * STOCK DETAIL
 * Detalle de un registro de stock con el esqueleto de detalle.
 * "Ajustar" abre el formulario de movimiento prellenado.
 */

'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ConfirmModal,
  DetailSection,
  PageHeader,
  StatusBadge,
  toast,
  useNavigationProgress,
  type ConfirmModalHandle,
} from '@lwm/ui'
import { useBranchName } from '@lwm/auth'
import { useStockItem, useStockMutations } from '../hooks'
import { STOCK_STATUS } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import { deleteErrorMessage } from '../utils/listing'

interface StockDetailProps {
  stockId: string
}

const LIST_HREF = '/dashboard/inventory/stock'

const LAST_MOVEMENT_LABELS: Record<string, string> = {
  in: 'Entrada',
  out: 'Salida',
  adjustment: 'Ajuste',
  transfer: 'Transferencia',
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="col-sm-5 text-muted fw-normal">{label}</dt>
    <dd className="col-sm-7">{children || <span className="text-muted">-</span>}</dd>
  </>
)

const hasKeys = (value: unknown) => Boolean(value && typeof value === 'object' && Object.keys(value).length > 0)

export const StockDetail = ({ stockId }: StockDetailProps) => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const branchName = useBranchName()
  const { stockItem: stock, isLoading, error } = useStockItem(stockId, ['product', 'warehouse', 'location'])
  const { deleteStock } = useStockMutations()

  const handleDelete = async () => {
    if (!stock) return
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el registro de stock de "${stock.product?.name || `#${stock.id}`}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar registro de stock', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteStock(stockId)
      toast.success('Registro de stock eliminado')
      navigation.push(LIST_HREF)
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'el registro de stock'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando stock...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Registro de stock" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'El registro de stock no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  const quantity = toNumber(stock.quantity)
  const reserved = toNumber(stock.reservedQuantity)
  const available = stock.availableQuantity != null ? toNumber(stock.availableQuantity) : Math.max(0, quantity - reserved)
  const minimum = toNumber(stock.minimumStock)
  const unitCost = toNumber(stock.unitCost)
  const totalValue = stock.totalValue != null ? toNumber(stock.totalValue) : quantity * unitCost
  const isOut = quantity <= 0
  const isLow = !isOut && minimum > 0 && quantity <= minimum

  const productId = stock.productId ?? stock.product?.id
  const warehouseId = stock.warehouseId ?? stock.warehouse?.id
  const locationId = stock.locationId ?? stock.warehouseLocationId ?? stock.location?.id
  const adjustParams = new URLSearchParams({ type: 'adjustment' })
  if (productId) adjustParams.set('productId', String(productId))
  if (warehouseId) adjustParams.set('warehouseId', String(warehouseId))
  if (locationId) adjustParams.set('locationId', String(locationId))

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={stock.product?.name || `Registro de stock #${stock.id}`}
        icon="bi-boxes"
        badges={
          <>
            <StatusBadge status={stock.status} map={STOCK_STATUS} />
            {isOut && <span className="badge bg-danger">Sin stock</span>}
            {isLow && <span className="badge bg-warning text-dark">Stock bajo</span>}
          </>
        }
        subtitle={[stock.warehouse?.name, stock.location?.name].filter(Boolean).join(' / ') || undefined}
        backHref={LIST_HREF}
        actions={
          <>
            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1" />
              Eliminar
            </button>
            <Link href={`${LIST_HREF}/${stockId}/edit`} className="btn btn-outline-primary">
              <i className="bi bi-pencil me-1" />
              Editar
            </Link>
            <Link href={`/dashboard/inventory/movements/create?${adjustParams.toString()}`} className="btn btn-primary">
              <i className="bi bi-sliders me-1" />
              Ajustar
            </Link>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
            <dl className="row mb-0">
              <Field label="Producto">
                {stock.product?.name}
                {stock.product?.sku && <small className="d-block text-muted">SKU: {stock.product.sku}</small>}
              </Field>
              <Field label="Almacén">
                {stock.warehouse?.name}
                {stock.warehouse?.code && <small className="d-block text-muted">Código: {stock.warehouse.code}</small>}
              </Field>
              {branchName.multi && (
                <Field label="Sucursal">{stock.warehouse ? branchName.name(stock.warehouse.branchId) : null}</Field>
              )}
              <Field label="Ubicación">
                {stock.location?.name}
                {stock.location?.code && <small className="d-block text-muted">Código: {stock.location.code}</small>}
              </Field>
            </dl>
          </DetailSection>

          <DetailSection title="Niveles de stock" icon="bi-bar-chart">
            <dl className="row mb-0">
              <Field label="Stock mínimo">{stock.minimumStock != null ? formatQty(stock.minimumStock) : null}</Field>
              <Field label="Stock máximo">{stock.maximumStock != null ? formatQty(stock.maximumStock) : null}</Field>
              <Field label="Punto de reorden">{stock.reorderPoint != null ? formatQty(stock.reorderPoint) : null}</Field>
            </dl>
          </DetailSection>

          <DetailSection title="Último movimiento" icon="bi-clock-history">
            <dl className="row mb-0">
              <Field label="Fecha">{stock.lastMovementDate ? formatDate(stock.lastMovementDate) : null}</Field>
              <Field label="Tipo">
                {stock.lastMovementType ? LAST_MOVEMENT_LABELS[stock.lastMovementType] || stock.lastMovementType : null}
              </Field>
            </dl>
          </DetailSection>

          {(hasKeys(stock.batchInfo) || hasKeys(stock.metadata)) && (
            <DetailSection title="Información adicional" icon="bi-clipboard-data">
              {hasKeys(stock.batchInfo) && (
                <div className="mb-3">
                  <h6 className="text-muted small text-uppercase">Información de lote</h6>
                  <pre className="bg-light p-3 rounded small mb-0">{JSON.stringify(stock.batchInfo, null, 2)}</pre>
                </div>
              )}
              {hasKeys(stock.metadata) && (
                <div>
                  <h6 className="text-muted small text-uppercase">Metadatos</h6>
                  <pre className="bg-light p-3 rounded small mb-0">{JSON.stringify(stock.metadata, null, 2)}</pre>
                </div>
              )}
            </DetailSection>
          )}
        </div>

        <div className="col-lg-4">
          <DetailSection title="Resumen" icon="bi-calculator">
            <dl className="row mb-0">
              <Field label="Cantidad total"><strong>{formatQty(quantity)}</strong></Field>
              <Field label="Reservada">{formatQty(reserved)}</Field>
              <Field label="Disponible">
                <strong className={isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-success'}>{formatQty(available)}</strong>
              </Field>
              <Field label="Costo unitario">{formatMoney(unitCost)}</Field>
              <Field label="Valor total"><strong>{formatMoney(totalValue)}</strong></Field>
              <Field label="Creado">{formatDate(stock.createdAt, { withTime: true })}</Field>
              <Field label="Actualizado">{formatDate(stock.updatedAt, { withTime: true })}</Field>
            </dl>
          </DetailSection>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
