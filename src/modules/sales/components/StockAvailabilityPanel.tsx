'use client'

import { useState, useEffect, useCallback } from 'react'
import { salesService } from '../services'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

interface StockItem {
  product_id: number
  product_name: string
  sku: string
  required_quantity: number
  available_quantity: number
  is_sufficient: boolean
  deficit: number
}

interface StockAvailabilityPanelProps {
  salesOrderId: string
}

export default function StockAvailabilityPanel({ salesOrderId }: StockAvailabilityPanelProps) {
  const navigation = useNavigationProgress()
  const [items, setItems] = useState<StockItem[]>([])
  const [allSufficient, setAllSufficient] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStock = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await salesService.orders.getStockAvailability(salesOrderId)
      setItems(data.items)
      setAllSufficient(data.all_sufficient)
    } catch {
      setError('Error al verificar disponibilidad de stock')
    } finally {
      setLoading(false)
    }
  }, [salesOrderId])

  useEffect(() => {
    loadStock()
  }, [loadStock])

  if (loading) {
    return (
      <div className="card mt-3">
        <div className="card-header">
          <i className="bi bi-box-seam me-2" />
          Disponibilidad de Stock
        </div>
        <div className="card-body text-center py-3">
          <span className="spinner-border spinner-border-sm text-primary" />
          <span className="ms-2 text-muted">Verificando stock...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card mt-3">
        <div className="card-header">
          <i className="bi bi-box-seam me-2" />
          Disponibilidad de Stock
        </div>
        <div className="card-body">
          <div className="alert alert-warning mb-0">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mt-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>
          <i className="bi bi-box-seam me-2" />
          Disponibilidad de Stock
        </span>
        {allSufficient ? (
          <span className="badge bg-success">Todo disponible</span>
        ) : (
          <span className="badge bg-danger">Stock insuficiente</span>
        )}
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th className="text-center" style={{ width: '90px' }}>Requerido</th>
                <th className="text-center" style={{ width: '90px' }}>Disponible</th>
                <th className="text-center" style={{ width: '80px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.product_id}>
                  <td>
                    <div className="fw-medium">{item.product_name}</div>
                    {item.sku && <small className="text-muted">{item.sku}</small>}
                  </td>
                  <td className="text-center">{item.required_quantity}</td>
                  <td className="text-center">
                    <span className={item.is_sufficient ? 'text-success' : 'text-danger fw-bold'}>
                      {item.available_quantity}
                    </span>
                  </td>
                  <td className="text-center">
                    {item.is_sufficient ? (
                      <i className="bi bi-check-circle-fill text-success" />
                    ) : (
                      <span className="badge bg-danger">-{item.deficit}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!allSufficient && (
        <div className="card-footer">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-danger">
              <i className="bi bi-exclamation-triangle me-1" />
              Algunos productos no tienen stock suficiente
            </small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigation.push('/dashboard/purchase/create')}
            >
              <i className="bi bi-cart-plus me-1" />
              Crear Orden de Compra
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
