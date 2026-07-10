'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from '@lwm/ui'
import { useQuoteItems, useQuoteMutations } from '../hooks'
import { getQuoteItemStockStatus } from '../utils/stock'
import type { Quote, StockShortageItem } from '../types'
import type { PaymentMethod } from '../../types'

interface GenerateSaleModalProps {
  quote: Quote
  isOpen: boolean
  onClose: () => void
  /** Recibe el id de la nueva orden para redirigir. */
  onConverted: (salesOrderId: string) => void
}

/**
 * GenerateSaleModal - "Generar venta" (venta directa)
 *
 * Convierte la cotizacion en una orden de venta tipo direct_sale
 * (mostrador/inmediata, nace confirmed). PRESUPONE stock: muestra el
 * resumen de items con semaforo de stock (misma fuente que QuoteItemsTable,
 * item.product.stock sumado entre almacenes) y deshabilita el CTA si algun
 * item no alcanza. Si el backend detecta faltantes (carrera de stock),
 * renderiza el 422 con el detalle por item.
 *
 * payment_method / credit_days se prellenan desde la cotizacion
 * (default PUE / 30 dias si la quote no los trae).
 */
export function GenerateSaleModal({ quote, isOpen, onClose, onConverted }: GenerateSaleModalProps) {
  const { convert } = useQuoteMutations()
  // Items con product.stock resuelto (include product,product.stock)
  const { data: items = [], isLoading: itemsLoading } = useQuoteItems(quote.id, { enabled: isOpen })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PUE')
  const [creditDays, setCreditDays] = useState('30')
  const [shortages, setShortages] = useState<StockShortageItem[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  // Prefill al abrir: condiciones de pago de la quote (venta directa
  // default PUE, pago en una exhibicion)
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(quote.paymentMethod ?? 'PUE')
      setCreditDays(String(quote.creditDays ?? 30))
      setShortages([])
      setFormError(null)
    }
  }, [isOpen, quote.paymentMethod, quote.creditDays])

  const stockByItem = useMemo(
    () => items.map((item) => ({ item, status: getQuoteItemStockStatus(item) })),
    [items]
  )
  const allSufficient = stockByItem.length > 0 && stockByItem.every(({ status }) => status.sufficient)

  const handleSubmit = async () => {
    const parsedCreditDays = Number(creditDays)
    if (!Number.isFinite(parsedCreditDays) || parsedCreditDays < 0) {
      setFormError('Dias de credito invalidos')
      return
    }
    setFormError(null)
    setShortages([])

    try {
      const result = await convert.mutateAsync({
        id: quote.id,
        data: {
          order_type: 'direct_sale',
          payment_method: paymentMethod,
          credit_days: parsedCreditDays
        }
      })
      const salesOrderAttrs = result.data.salesOrder?.attributes
      const orderNumber =
        (salesOrderAttrs?.orderNumber as string | undefined) ||
        (salesOrderAttrs?.order_number as string | undefined) ||
        ''
      toast.success(orderNumber ? `Venta ${orderNumber} generada` : 'Venta generada')
      const salesOrderId = result.data.salesOrder?.id
      onClose()
      if (salesOrderId) {
        onConverted(salesOrderId)
      }
    } catch (err) {
      const error = err as {
        response?: {
          status?: number
          data?: { message?: string; error?: string; errors?: StockShortageItem[] }
        }
      }
      if (error.response?.status === 422) {
        const backendShortages = error.response.data?.errors
        if (Array.isArray(backendShortages) && backendShortages.length > 0 && backendShortages[0]?.product_id !== undefined) {
          setShortages(backendShortages)
        } else {
          toast.error(
            error.response.data?.message ||
              error.response.data?.error ||
              'La cotizacion no se puede convertir en venta directa'
          )
        }
      } else {
        toast.error('Error al generar la venta')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-cash-coin me-2"></i>
              Generar venta - {quote.quoteNumber}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={convert.isPending}></button>
          </div>

          <div className="modal-body">
            <p className="text-muted small">
              Venta directa (mostrador/inmediata). Requiere stock disponible de todos los
              items; la orden nace confirmada.
            </p>

            {/* 422 del backend: faltantes detectados al convertir */}
            {shortages.length > 0 && (
              <div className="alert alert-danger" role="alert">
                <strong>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Stock insuficiente, la venta directa no procede:
                </strong>
                <ul className="mb-0 mt-2">
                  {shortages.map((s) => (
                    <li key={s.product_id}>
                      {s.product_name}: se requieren {s.requested}, disponibles {s.available}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resumen de items con semaforo de stock */}
            {itemsLoading ? (
              <div className="text-center py-4">
                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
              </div>
            ) : items.length === 0 ? (
              <div className="alert alert-warning mb-3">La cotizacion no tiene items.</div>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-center">Stock disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockByItem.map(({ item, status }) => (
                      <tr key={item.id}>
                        <td>
                          {item.productName || `Producto #${item.productId}`}
                          {item.productSku && <small className="text-muted d-block">{item.productSku}</small>}
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-center">
                          {status.available === 0 ? (
                            <span className="text-danger" title="Sin stock disponible">
                              <i className="bi bi-x-circle me-1"></i>
                              {status.available}
                            </span>
                          ) : status.lowStock ? (
                            <span
                              className="text-warning"
                              title={`Stock insuficiente: ${status.available} disponibles, se requieren ${item.quantity}`}
                            >
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              {status.available}
                            </span>
                          ) : (
                            <span className="text-success" title="Stock suficiente">
                              <i className="bi bi-check-circle me-1"></i>
                              {status.available}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!itemsLoading && items.length > 0 && !allSufficient && shortages.length === 0 && (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Hay items sin stock suficiente. La venta directa no procede; usa
                &quot;Generar pedido&quot; para gestionar la compra del faltante.
              </div>
            )}

            {/* Condiciones de pago */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="sale-payment-method">Metodo de pago</label>
                <select
                  id="sale-payment-method"
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={convert.isPending}
                >
                  <option value="PUE">PUE - Pago en una exhibicion</option>
                  <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="sale-credit-days">Dias de credito</label>
                <input
                  id="sale-credit-days"
                  type="number"
                  className={`form-control${formError ? ' is-invalid' : ''}`}
                  min={0}
                  step={1}
                  value={creditDays}
                  onChange={(e) => setCreditDays(e.target.value)}
                  disabled={convert.isPending}
                />
                {formError && <div className="invalid-feedback d-block">{formError}</div>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={convert.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={convert.isPending || itemsLoading || !allSufficient}
              title={!allSufficient ? 'Hay items sin stock suficiente' : undefined}
            >
              {convert.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Generando...
                </>
              ) : (
                <>
                  <i className="bi bi-cash-coin me-2"></i>
                  Generar venta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
