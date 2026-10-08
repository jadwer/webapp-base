/**
 * PRODUCT BATCH DETAIL
 * Detalle de lote con el esqueleto de detalle (encabezado, secciones y resumen).
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
import { useProductBatch, useProductBatchMutations } from '../hooks'
import { BATCH_STATUS } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import { deleteErrorMessage } from '../utils/listing'

interface ProductBatchDetailProps {
  productBatchId: string
}

const LIST_HREF = '/dashboard/inventory/product-batch'
const DAY_MS = 1000 * 60 * 60 * 24

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="col-sm-5 text-muted fw-normal">{label}</dt>
    <dd className="col-sm-7">{children || <span className="text-muted">-</span>}</dd>
  </>
)

const expirationInfo = (expirationDate?: string | null) => {
  if (!expirationDate) return null
  const date = new Date(`${expirationDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((date.getTime() - today.getTime()) / DAY_MS)
  if (days < 0) return { variant: 'danger', text: `Vencido hace ${Math.abs(days)} días` }
  if (days <= 7) return { variant: 'danger', text: days === 0 ? 'Vence hoy' : `Vence en ${days} días` }
  if (days <= 30) return { variant: 'warning', text: `Vence en ${days} días` }
  return { variant: 'success', text: `${days} días restantes` }
}

const JsonBlock = ({ title, value }: { title: string; value: unknown }) => (
  <div className="mb-3">
    <h6 className="text-muted small text-uppercase">{title}</h6>
    <pre className="bg-light p-3 rounded small mb-0">{JSON.stringify(value, null, 2)}</pre>
  </div>
)

export const ProductBatchDetail = ({ productBatchId }: ProductBatchDetailProps) => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { productBatch, isLoading, error } = useProductBatch({ id: productBatchId })
  const { deleteProductBatch } = useProductBatchMutations()

  const handleDelete = async () => {
    if (!productBatch) return
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el lote "${productBatch.batchNumber}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar lote', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteProductBatch(productBatchId)
      toast.success('Lote eliminado')
      navigation.push(LIST_HREF)
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'el lote'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando lote...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !productBatch) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Lote" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'El lote no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  const expiration = expirationInfo(productBatch.expirationDate)
  const current = toNumber(productBatch.currentQuantity)
  const initial = toNumber(productBatch.initialQuantity)
  const percentage = initial > 0 ? Math.round((current / initial) * 100) : 0
  const barVariant = percentage <= 25 ? 'danger' : percentage <= 50 ? 'warning' : 'success'
  const hasExtra = Boolean(productBatch.testResults || productBatch.certifications || productBatch.metadata)

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={`Lote ${productBatch.batchNumber}`}
        icon="bi-box"
        badges={
          <>
            <StatusBadge status={productBatch.status} map={BATCH_STATUS} />
            {expiration && expiration.variant !== 'success' && (
              <span className={`badge bg-${expiration.variant}${expiration.variant === 'warning' ? ' text-dark' : ''}`}>
                {expiration.text}
              </span>
            )}
          </>
        }
        subtitle={productBatch.product?.name}
        backHref={LIST_HREF}
        actions={
          <>
            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1" />
              Eliminar
            </button>
            <Link href={`${LIST_HREF}/${productBatchId}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-1" />
              Editar
            </Link>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <DetailSection title="Información del lote" icon="bi-info-circle">
            <dl className="row mb-0">
              <Field label="Número de lote"><strong>{productBatch.batchNumber}</strong></Field>
              <Field label="Número LOT">{productBatch.lotNumber}</Field>
              <Field label="Fabricación">{formatDate(productBatch.manufacturingDate)}</Field>
              <Field label="Vencimiento">
                {formatDate(productBatch.expirationDate)}
                {expiration && <small className={`d-block text-${expiration.variant}`}>{expiration.text}</small>}
              </Field>
              {productBatch.bestBeforeDate && (
                <Field label="Consumir preferentemente antes de">{formatDate(productBatch.bestBeforeDate)}</Field>
              )}
            </dl>
          </DetailSection>

          <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
            <dl className="row mb-0">
              <Field label="Producto">
                {productBatch.product?.name}
                {productBatch.product?.sku && <small className="d-block text-muted">SKU: {productBatch.product.sku}</small>}
              </Field>
              <Field label="Almacén">
                {productBatch.warehouse?.name}
                {productBatch.warehouse?.code && <small className="d-block text-muted">Código: {productBatch.warehouse.code}</small>}
              </Field>
              <Field label="Ubicación">{productBatch.warehouseLocation?.name}</Field>
            </dl>
          </DetailSection>

          <DetailSection title="Proveedor y calidad" icon="bi-truck">
            <dl className="row mb-0">
              <Field label="Proveedor">{productBatch.supplierName}</Field>
              <Field label="Lote del proveedor">{productBatch.supplierBatch}</Field>
              <Field label="Notas de calidad">{productBatch.qualityNotes}</Field>
            </dl>
          </DetailSection>

          {hasExtra && (
            <DetailSection title="Información adicional" icon="bi-clipboard-data">
              {productBatch.testResults && <JsonBlock title="Resultados de pruebas" value={productBatch.testResults} />}
              {productBatch.certifications && <JsonBlock title="Certificaciones" value={productBatch.certifications} />}
              {productBatch.metadata && <JsonBlock title="Metadatos" value={productBatch.metadata} />}
            </DetailSection>
          )}
        </div>

        <div className="col-lg-4">
          <DetailSection title="Resumen" icon="bi-calculator">
            <dl className="row mb-0">
              <Field label="Cantidad inicial">{formatQty(initial)}</Field>
              <Field label="Cantidad actual">
                <strong>{formatQty(current)}</strong>
                <small className="text-muted ms-1">({percentage}%)</small>
                <div className="progress mt-1" style={{ height: '4px' }}>
                  <div className={`progress-bar bg-${barVariant}`} role="progressbar" style={{ width: `${percentage}%` }} />
                </div>
              </Field>
              <Field label="Reservada">{formatQty(productBatch.reservedQuantity)}</Field>
              <Field label="Costo unitario">{formatMoney(productBatch.unitCost)}</Field>
              <Field label="Valor actual">
                <strong>{formatMoney(current * toNumber(productBatch.unitCost))}</strong>
              </Field>
              <Field label="Creado">{formatDate(productBatch.createdAt, { withTime: true })}</Field>
              <Field label="Actualizado">{formatDate(productBatch.updatedAt, { withTime: true })}</Field>
            </dl>
          </DetailSection>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
