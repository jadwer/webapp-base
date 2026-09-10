'use client'

import Link from 'next/link'
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (conversions.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-arrow-repeat fs-1 d-block mb-2" />
        No se encontraron conversiones de productos
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Producto Origen</th>
            <th>Producto Destino</th>
            <th className="text-center">Factor</th>
            <th className="text-center">Merma %</th>
            <th className="text-center">Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((conversion) => (
            <tr key={conversion.id}>
              <td>
                {conversion.sourceProduct ? (
                  <div>
                    <strong>{conversion.sourceProduct.name}</strong>
                    <div className="text-muted small">{conversion.sourceProduct.sku}</div>
                  </div>
                ) : (
                  <span className="text-muted">ID: {conversion.sourceProductId}</span>
                )}
              </td>
              <td>
                {conversion.destinationProduct ? (
                  <div>
                    <strong>{conversion.destinationProduct.name}</strong>
                    <div className="text-muted small">{conversion.destinationProduct.sku}</div>
                  </div>
                ) : (
                  <span className="text-muted">ID: {conversion.destinationProductId}</span>
                )}
              </td>
              <td className="text-center">
                <span className="badge bg-info">{conversion.conversionFactor}</span>
              </td>
              <td className="text-center">
                {conversion.wastePercentage > 0 ? (
                  <span className="badge bg-warning text-dark">{conversion.wastePercentage}%</span>
                ) : (
                  <span className="text-muted">0%</span>
                )}
              </td>
              <td className="text-center">
                <span className={`badge ${conversion.isActive ? 'bg-success' : 'bg-secondary'}`}>
                  {conversion.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <Link
                    href={`/dashboard/inventory/product-conversions/${conversion.id}/edit`}
                    className="btn btn-outline-primary"
                    title="Editar"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                  {onDelete && (
                    <button
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
