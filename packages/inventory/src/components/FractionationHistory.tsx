'use client'

import Link from 'next/link'
import { EmptyState, StatusBadge } from '@lwm/ui'
import { FRACTIONATION_STATUS } from '../utils/labels'
import { formatDate, formatQty, toNumber } from '../utils/format'
import type { Fractionation } from '../types/fractionation'

interface FractionationHistoryProps {
  fractionations: Fractionation[]
  isLoading: boolean
}

const ProductCell = ({ product }: { product?: { name: string; sku: string } }) =>
  product ? (
    <>
      <div>{product.name}</div>
      <small className="text-muted">{product.sku}</small>
    </>
  ) : (
    <span className="text-muted">-</span>
  )

export const FractionationHistory = ({ fractionations, isLoading }: FractionationHistoryProps) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando historial...</span>
        </div>
      </div>
    )
  }

  if (fractionations.length === 0) {
    return (
      <EmptyState
        title="No hay fraccionamientos"
        description="No se encontraron fraccionamientos con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Folio</th>
            <th>Producto origen</th>
            <th>Producto destino</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Producido</th>
            <th className="text-end">Merma</th>
            <th>Almacén</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th style={{ width: '70px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fractionations.map((frac) => (
            <tr key={frac.id}>
              <td>
                <Link
                  href={`/dashboard/inventory/fraccionamiento/${frac.id}`}
                  className="fw-semibold text-decoration-none"
                >
                  {frac.folioNumber}
                </Link>
              </td>
              <td><ProductCell product={frac.sourceProduct} /></td>
              <td><ProductCell product={frac.destinationProduct} /></td>
              <td className="text-end">{formatQty(frac.sourceQuantity)}</td>
              <td className="text-end fw-semibold text-success">{formatQty(frac.producedQuantity)}</td>
              <td className="text-end">
                {toNumber(frac.wasteQuantity) > 0 ? (
                  <span className="text-warning">
                    {formatQty(frac.wasteQuantity)} ({toNumber(frac.wastePercentage)}%)
                  </span>
                ) : (
                  <span className="text-muted">0</span>
                )}
              </td>
              <td>{frac.warehouse?.name || <span className="text-muted">-</span>}</td>
              <td>
                <StatusBadge status={frac.status} map={FRACTIONATION_STATUS} />
              </td>
              <td className="text-nowrap">
                <small>{formatDate(frac.executedAt, { withTime: true })}</small>
              </td>
              <td>
                <Link
                  href={`/dashboard/inventory/fraccionamiento/${frac.id}`}
                  className="btn btn-sm btn-outline-primary"
                  title="Ver detalle"
                >
                  <i className="bi bi-eye" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
