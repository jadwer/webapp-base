'use client'

import { PageHeader, StatusBadge } from '@lwm/ui'
import { useFractionation } from '../hooks/useFractionations'
import { FRACTIONATION_STATUS } from '../utils/labels'

const LIST_HREF = '/dashboard/inventory/fraccionamiento'

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
  const { fractionation, isLoading, error } = useFractionation(
    fractionationId,
    ['sourceProduct', 'destinationProduct', 'warehouse', 'user']
  )

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
      />

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
                <div className="text-muted small">Cantidad Fraccionada</div>
                <div className="fw-bold fs-4 text-primary">{formatNumber(fractionation.sourceQuantity)}</div>
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
                <div className="fw-bold fs-4 text-success">{formatNumber(fractionation.producedQuantity)}</div>
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
                  <div className="fw-bold fs-5 text-warning">{formatNumber(fractionation.wasteQuantity)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Almacén</div>
                  <div className="fw-bold fs-5">
                    {fractionation.warehouse?.name || `ID: ${fractionation.warehouseId}`}
                  </div>
                </div>
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
