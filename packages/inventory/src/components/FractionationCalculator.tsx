'use client'

import type { FractionationPreview } from '../types/fractionation'
import { formatMoney, formatQty } from '../utils/format'

interface FractionationCalculatorProps {
  preview: FractionationPreview | null
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

  const sourceUnit = preview.source_product.unit?.name || ''
  const destUnit = preview.destination_product.unit?.name || 'unidades destino'
  const requested = preview.requested_quantity ?? preview.source_quantity
  const consumed = preview.consumed_quantity ?? preview.source_quantity
  const leftover = preview.leftover_quantity ?? 0
  const hasCost = preview.has_cost ?? (preview.source_unit_cost ?? 0) > 0
  const selectedBatch = preview.batches?.find((b) => b.id === preview.product_batch_id)
  const batchShort = preview.batch_available != null && preview.batch_available < consumed

  return (
    <div className="card mb-3">
      <div className="card-header bg-light">
        <h6 className="mb-0">
          <i className="bi bi-calculator me-2" />
          Vista previa del fraccionamiento
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Producto origen</div>
              <div className="fw-bold">{preview.source_product.name}</div>
              <div className="text-muted small">{preview.source_product.sku}</div>
              {preview.source_product.unit && (
                <div className="text-muted small">Unidad: {preview.source_product.unit.name}</div>
              )}
              <div className="mt-2">
                <span className="badge bg-primary fs-6" data-testid="consumed-quantity">
                  {formatQty(consumed)} {sourceUnit}
                </span>
                <span className="text-muted ms-1">salen del origen</span>
              </div>
              {leftover > 0 && (
                <div className="small text-muted mt-1">
                  Pediste {formatQty(requested)} {sourceUnit}; {formatQty(leftover)} {sourceUnit} se quedan en el granel.
                </div>
              )}
              {selectedBatch && (
                <div className="small mt-1">
                  Lote {selectedBatch.batch_number}
                  {selectedBatch.lot_number ? ` (${selectedBatch.lot_number})` : ''}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-1">Producto destino</div>
              <div className="fw-bold">{preview.destination_product.name}</div>
              <div className="text-muted small">{preview.destination_product.sku}</div>
              {preview.destination_product.unit && (
                <div className="text-muted small">Unidad: {preview.destination_product.unit.name}</div>
              )}
              <div className="mt-2">
                <span className="badge bg-success fs-6" data-testid="produced-quantity">
                  {formatQty(preview.produced_quantity)} {destUnit}
                </span>
                <span className="text-muted ms-1">producidas</span>
              </div>
              {preview.whole_units && (
                <div className="small text-muted mt-1">Solo piezas completas</div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="text-muted small">Factor</div>
              <div className="fw-bold fs-5">{preview.conversion_factor}x</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="text-muted small">Merma</div>
              <div className="fw-bold fs-5">{preview.waste_percentage}%</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="text-muted small">Desperdicio</div>
              <div className="fw-bold fs-5 text-warning">
                {formatQty(preview.waste_quantity)} <span className="fs-6">{destUnit}</span>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <div className="text-muted small">Disponible</div>
              <div className={`fw-bold fs-5 ${preview.has_enough_stock ? 'text-success' : 'text-danger'}`}>
                {formatQty(preview.available_stock)} <span className="fs-6">{sourceUnit}</span>
              </div>
              {(preview.reserved_stock ?? 0) > 0 && (
                <div className="small text-muted">
                  Existencia {formatQty(preview.on_hand_stock)}, reservado {formatQty(preview.reserved_stock)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-1 border-top pt-3">
          <div className="col-md-4">
            <div className="text-muted small">Costo unitario origen</div>
            <div className="fw-bold" data-testid="source-unit-cost">
              {formatMoney(preview.source_unit_cost)}{sourceUnit ? ` / ${sourceUnit}` : ''}
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-muted small">Costo unitario destino (merma incluida)</div>
            <div className="fw-bold" data-testid="destination-unit-cost">
              {formatMoney(preview.destination_unit_cost)} / {destUnit}
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-muted small">Valor que se transforma</div>
            <div className="fw-bold">{formatMoney(preview.total_cost)}</div>
          </div>
        </div>

        {!hasCost && (
          <div className="alert alert-warning mt-3 mb-0">
            <i className="bi bi-exclamation-circle me-2" />
            El producto origen no tiene costo: las presentaciones entrarán con costo 0. Puedes continuar, pero conviene capturar el costo del granel.
          </div>
        )}

        {(preview.warnings ?? []).filter((w) => hasCost || !w.includes('no tiene costo')).map((w) => (
          <div key={w} className="alert alert-info mt-3 mb-0">
            <i className="bi bi-info-circle me-2" />
            {w}
          </div>
        ))}

        {!preview.has_enough_stock && (
          <div className="alert alert-danger mt-3 mb-0">
            <i className="bi bi-exclamation-triangle me-2" />
            {batchShort
              ? `El lote no alcanza. Disponible en el lote: ${formatQty(preview.batch_available)} ${sourceUnit}, requerido: ${formatQty(consumed)} ${sourceUnit}`
              : `Stock insuficiente. Disponible: ${formatQty(preview.available_stock)} ${sourceUnit}, requerido: ${formatQty(consumed)} ${sourceUnit}`}
          </div>
        )}
      </div>
    </div>
  )
}
