'use client'

import type { FractionationCalculateResponse } from '../types/fractionation'

interface FractionationCalculatorProps {
  preview: FractionationCalculateResponse['data'] | null
  isLoading: boolean
}

export const FractionationCalculator = ({ preview, isLoading }: FractionationCalculatorProps) => {
  if (isLoading) {
    return (
      <div className="card mb-3">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          Calculando...
        </div>
      </div>
    )
  }

  if (!preview) return null

  return (
    <div className="card mb-3">
      <div className="card-header bg-light">
        <h6 className="mb-0">
          <i className="bi bi-calculator me-2" />
          Preview del Fraccionamiento
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Producto Origen</div>
              <div className="fw-bold">{preview.source_product.name}</div>
              <div className="text-muted small">{preview.source_product.sku}</div>
              {preview.source_product.unit && (
                <div className="text-muted small">Unidad: {preview.source_product.unit.name}</div>
              )}
              <div className="mt-2">
                <span className="badge bg-primary fs-6">{preview.source_quantity}</span>
                <span className="text-muted ms-1">a fraccionar</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Producto Destino</div>
              <div className="fw-bold">{preview.destination_product.name}</div>
              <div className="text-muted small">{preview.destination_product.sku}</div>
              {preview.destination_product.unit && (
                <div className="text-muted small">Unidad: {preview.destination_product.unit.name}</div>
              )}
              <div className="mt-2">
                <span className="badge bg-success fs-6">{preview.produced_quantity}</span>
                <span className="text-muted ms-1">producidas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-3">
            <div className="text-center">
              <div className="text-muted small">Factor</div>
              <div className="fw-bold fs-5">{preview.conversion_factor}x</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <div className="text-muted small">Merma</div>
              <div className="fw-bold fs-5">{preview.waste_percentage}%</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <div className="text-muted small">Desperdicio</div>
              <div className="fw-bold fs-5 text-warning">{preview.waste_quantity}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <div className="text-muted small">Stock Disponible</div>
              <div className={`fw-bold fs-5 ${preview.has_enough_stock ? 'text-success' : 'text-danger'}`}>
                {preview.available_stock}
              </div>
            </div>
          </div>
        </div>

        {!preview.has_enough_stock && (
          <div className="alert alert-danger mt-3 mb-0">
            <i className="bi bi-exclamation-triangle me-2" />
            Stock insuficiente. Disponible: {preview.available_stock}, Requerido: {preview.source_quantity}
          </div>
        )}
      </div>
    </div>
  )
}
