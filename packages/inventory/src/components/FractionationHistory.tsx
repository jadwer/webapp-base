'use client'

import Link from 'next/link'
import type { Fractionation } from '../types/fractionation'

interface FractionationHistoryProps {
  fractionations: Fractionation[]
  isLoading: boolean
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="badge bg-success">Completado</span>
    case 'pending':
      return <span className="badge bg-warning text-dark">Pendiente</span>
    case 'cancelled':
      return <span className="badge bg-danger">Cancelado</span>
    default:
      return <span className="badge bg-secondary">{status}</span>
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)
}

export const FractionationHistory = ({ fractionations, isLoading }: FractionationHistoryProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (fractionations.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-scissors fs-1 d-block mb-2" />
        No se encontraron fraccionamientos
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Folio</th>
            <th>Producto Origen</th>
            <th>Producto Destino</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Producido</th>
            <th className="text-end">Merma</th>
            <th className="text-center">Estado</th>
            <th>Fecha</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fractionations.map((frac) => (
            <tr key={frac.id}>
              <td>
                <Link
                  href={`/dashboard/inventory/fraccionamiento/${frac.id}`}
                  className="text-decoration-none fw-bold"
                >
                  {frac.folioNumber}
                </Link>
              </td>
              <td>
                {frac.sourceProduct ? (
                  <div>
                    <div>{frac.sourceProduct.name}</div>
                    <div className="text-muted small">{frac.sourceProduct.sku}</div>
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                {frac.destinationProduct ? (
                  <div>
                    <div>{frac.destinationProduct.name}</div>
                    <div className="text-muted small">{frac.destinationProduct.sku}</div>
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="text-end">{formatNumber(frac.sourceQuantity)}</td>
              <td className="text-end text-success fw-bold">{formatNumber(frac.producedQuantity)}</td>
              <td className="text-end">
                {frac.wasteQuantity > 0 ? (
                  <span className="text-warning">{formatNumber(frac.wasteQuantity)} ({frac.wastePercentage}%)</span>
                ) : (
                  <span className="text-muted">0</span>
                )}
              </td>
              <td className="text-center">{statusBadge(frac.status)}</td>
              <td className="text-nowrap">{formatDate(frac.executedAt)}</td>
              <td className="text-end">
                <Link
                  href={`/dashboard/inventory/fraccionamiento/${frac.id}`}
                  className="btn btn-outline-primary btn-sm"
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
