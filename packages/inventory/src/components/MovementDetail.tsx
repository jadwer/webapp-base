/**
 * MOVEMENT DETAIL
 * Detalle de movimiento con el esqueleto de detalle (encabezado, secciones y resumen).
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
import { useInventoryMovement, useInventoryMovementsMutations } from '../hooks'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import { deleteErrorMessage } from '../utils/listing'

interface MovementDetailProps {
  movementId: string
}

const LIST_HREF = '/dashboard/inventory/movements'

const REFERENCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  purchase: 'Compra',
  sale: 'Venta',
  transfer: 'Transferencia',
  adjustment: 'Ajuste',
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="col-sm-5 text-muted fw-normal">{label}</dt>
    <dd className="col-sm-7">{children || <span className="text-muted">-</span>}</dd>
  </>
)

const JsonBlock = ({ title, value }: { title: string; value: unknown }) => (
  <div className="mb-3">
    <h6 className="text-muted small text-uppercase">{title}</h6>
    <pre className="bg-light p-3 rounded small mb-0">{JSON.stringify(value, null, 2)}</pre>
  </div>
)

const hasKeys = (value: unknown) => Boolean(value && typeof value === 'object' && Object.keys(value).length > 0)

export const MovementDetail = ({ movementId }: MovementDetailProps) => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const branchName = useBranchName()
  const { movement, isLoading, error } = useInventoryMovement(movementId, [
    'product',
    'warehouse',
    'location',
    'destinationWarehouse',
    'destinationLocation',
    'user',
  ])
  const { deleteMovement } = useInventoryMovementsMutations()

  const handleDelete = async () => {
    if (!movement) return
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el movimiento #${movement.id}?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar movimiento', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteMovement(movementId)
      toast.success('Movimiento eliminado')
      navigation.push(LIST_HREF)
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'el movimiento'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando movimiento...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movement) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Movimiento" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'El movimiento no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  const quantity = toNumber(movement.quantity)
  const unitCost = toNumber(movement.unitCost)
  const totalValue = movement.totalValue != null ? toNumber(movement.totalValue) : quantity * unitCost
  const isTransfer = movement.movementType === 'transfer'
  const typeInfo = MOVEMENT_TYPE[movement.movementType]

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={`Movimiento #${movement.id}`}
        icon={typeInfo?.icon || 'bi-arrow-left-right'}
        badges={
          <>
            <StatusBadge status={movement.movementType} map={MOVEMENT_TYPE} />
            <StatusBadge status={movement.status} map={MOVEMENT_STATUS} />
          </>
        }
        subtitle={movement.product?.name}
        backHref={LIST_HREF}
        actions={
          <>
            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1" />
              Eliminar
            </button>
            <Link href={`${LIST_HREF}/${movementId}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-1" />
              Editar
            </Link>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <DetailSection title="Información del movimiento" icon="bi-info-circle">
            <dl className="row mb-0">
              <Field label="Tipo"><StatusBadge status={movement.movementType} map={MOVEMENT_TYPE} /></Field>
              <Field label="Fecha">{formatDate(movement.movementDate, { withTime: true })}</Field>
              <Field label="Referencia">
                {movement.referenceType ? REFERENCE_LABELS[movement.referenceType] || movement.referenceType : null}
                {movement.referenceId ? <span className="text-muted ms-1">#{movement.referenceId}</span> : null}
              </Field>
              <Field label="Descripción">{movement.description || movement.metadata?.notes || movement.metadata?.reason}</Field>
              <Field label="Registró">
                {movement.user?.name}
                {movement.user?.email && <small className="d-block text-muted">{movement.user.email}</small>}
              </Field>
            </dl>
          </DetailSection>

          <DetailSection title="Producto" icon="bi-box">
            <dl className="row mb-0">
              <Field label="Producto">
                {movement.product?.name}
                {movement.product?.sku && <small className="d-block text-muted">SKU: {movement.product.sku}</small>}
              </Field>
              <Field label="Cantidad"><strong>{formatQty(quantity)}</strong></Field>
              {movement.previousStock != null && <Field label="Existencia anterior">{formatQty(movement.previousStock)}</Field>}
              {movement.newStock != null && <Field label="Existencia nueva">{formatQty(movement.newStock)}</Field>}
            </dl>
          </DetailSection>

          <DetailSection title={isTransfer ? 'Origen y destino' : 'Ubicación'} icon="bi-geo-alt">
            <dl className="row mb-0">
              <Field label={isTransfer ? 'Almacén origen' : 'Almacén'}>
                {movement.warehouse?.name}
                {movement.warehouse?.code && <small className="d-block text-muted">Código: {movement.warehouse.code}</small>}
              </Field>
              {branchName.multi && (
                <Field label="Sucursal">{movement.warehouse ? branchName.name(movement.warehouse.branchId) : null}</Field>
              )}
              <Field label={isTransfer ? 'Ubicación origen' : 'Ubicación'}>{movement.location?.name}</Field>
              {isTransfer && (
                <>
                  <Field label="Almacén destino">
                    {movement.destinationWarehouse?.name}
                    {movement.destinationWarehouse?.code && (
                      <small className="d-block text-muted">Código: {movement.destinationWarehouse.code}</small>
                    )}
                  </Field>
                  {branchName.multi && movement.destinationWarehouse && (
                    <Field label="Sucursal destino">{branchName.name(movement.destinationWarehouse.branchId)}</Field>
                  )}
                  <Field label="Ubicación destino">{movement.destinationLocation?.name}</Field>
                </>
              )}
            </dl>
          </DetailSection>

          {(hasKeys(movement.batchInfo) || hasKeys(movement.metadata)) && (
            <DetailSection title="Información adicional" icon="bi-clipboard-data">
              {hasKeys(movement.batchInfo) && <JsonBlock title="Información de lote" value={movement.batchInfo} />}
              {hasKeys(movement.metadata) && <JsonBlock title="Metadatos" value={movement.metadata} />}
            </DetailSection>
          )}
        </div>

        <div className="col-lg-4">
          <DetailSection title="Resumen" icon="bi-calculator">
            <dl className="row mb-0">
              <Field label="Cantidad">{formatQty(quantity)}</Field>
              <Field label="Costo unitario">{formatMoney(unitCost)}</Field>
              <Field label="Valor total"><strong>{formatMoney(totalValue)}</strong></Field>
              <Field label="Creado">{formatDate(movement.createdAt, { withTime: true })}</Field>
              <Field label="Actualizado">{formatDate(movement.updatedAt, { withTime: true })}</Field>
            </dl>
          </DetailSection>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
