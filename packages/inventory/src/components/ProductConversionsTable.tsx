'use client'

import Link from 'next/link'
import { EmptyState } from '@lwm/ui'
import { toNumber } from '../utils/format'
import type { ProductConversion } from '../types/productConversion'

interface ProductConversionsTableProps {
  conversions: ProductConversion[]
  isLoading: boolean
  onDelete?: (conversion: ProductConversion) => void
}

export const ProductConversionsTable = ({
  conversions,
  isLoading,
  onDelete,
}: ProductConversionsTableProps) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando conversiones...</span>
        </div>
      </div>
    )
  }

  if (conversions.length === 0) {
    return (
      <EmptyState
        title="No hay conversiones"
        description="Configura un par de productos para poder fraccionar."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Producto origen</th>
            <th>Producto destino</th>
            <th className="text-end">Factor</th>
            <th className="text-end">Merma</th>
            <th>Estado</th>
            <th style={{ width: '110px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((conversion) => (
            <tr key={conversion.id}>
              <td>
                {conversion.sourceProduct ? (
                  <>
                    <div className="fw-semibold">{conversion.sourceProduct.name}</div>
                    <small className="text-muted">{conversion.sourceProduct.sku}</small>
                  </>
                ) : (
                  <span className="text-muted">ID: {conversion.sourceProductId}</span>
                )}
              </td>
              <td>
                {conversion.destinationProduct ? (
                  <>
                    <div className="fw-semibold">{conversion.destinationProduct.name}</div>
                    <small className="text-muted">{conversion.destinationProduct.sku}</small>
                  </>
                ) : (
                  <span className="text-muted">ID: {conversion.destinationProductId}</span>
                )}
              </td>
              <td className="text-end">{toNumber(conversion.conversionFactor)}</td>
              <td className="text-end">
                {toNumber(conversion.wastePercentage) > 0 ? (
                  <span className="text-warning">{toNumber(conversion.wastePercentage)}%</span>
                ) : (
                  <span className="text-muted">0%</span>
                )}
              </td>
              <td>
                <span className={`badge bg-${conversion.isActive ? 'success' : 'secondary'}`}>
                  {conversion.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/product-conversions/${conversion.id}/edit`}
                    className="btn btn-outline-secondary"
                    title="Editar"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => onDelete(conversion)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
