'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useFractionation } from '../hooks/useFractionations'

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

const statusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="badge bg-success fs-6">Completado</span>
    case 'pending':
      return <span className="badge bg-warning text-dark fs-6">Pendiente</span>
    case 'cancelled':
      return <span className="badge bg-danger fs-6">Cancelado</span>
    default:
      return <span className="badge bg-secondary fs-6">{status}</span>
  }
}

export const FractionationDetail = ({ fractionationId }: FractionationDetailProps) => {
  const router = useRouter()
  const { fractionation, isLoading, error } = useFractionation(
    fractionationId,
    ['sourceProduct', 'destinationProduct', 'warehouse', 'user']
  )

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error || !fractionation) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          {error?.message || 'Fraccionamiento no encontrado'}
        </div>
        <Button variant="secondary" onClick={() => router.push('/dashboard/inventory/fraccionamiento')}>
          Volver al historial
        </Button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-link text-decoration-none p-0 me-3"
          onClick={() => router.push('/dashboard/inventory/fraccionamiento')}
        >
          <i className="bi bi-arrow-left fs-4" />
        </button>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3">
            <h1 className="h3 mb-0">{fractionation.folioNumber}</h1>
            {statusBadge(fractionation.status)}
          </div>
          <p className="text-muted mb-0">Detalle del fraccionamiento</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Products info */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">Producto Origen</h6>
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
              <h6 className="mb-0">Producto Destino</h6>
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
              <h6 className="mb-0">Detalles de la Conversion</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted small">Factor de Conversion</div>
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
                  <div className="text-muted small">Almacen</div>
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
              <h6 className="mb-0">Informacion Adicional</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted small">Ejecutado por</div>
                  <div>{fractionation.user?.name || `ID: ${fractionation.userId}`}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Fecha de Ejecucion</div>
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
