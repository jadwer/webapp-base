'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from '@lwm/ui'
import { useQuoteItems, useQuoteMutations } from '../hooks'
import { getQuoteItemStockStatus } from '../utils/stock'
import { salesService } from '../../services'
import { ACCEPTANCE_CHANNEL_LABELS, type AcceptanceChannel, type Quote, type StockShortageItem } from '../types'
import type { PaymentMethod } from '../../types'

const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024 // 10MB
const EVIDENCE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

interface GenerateOrderModalProps {
  quote: Quote
  isOpen: boolean
  onClose: () => void
  /** Recibe el id de la nueva orden para redirigir. */
  onConverted: (salesOrderId: string) => void
}

/**
 * GenerateOrderModal - "Generar pedido"
 *
 * Convierte la cotizacion en una orden de venta tipo order (proceso
 * completo: verificar existencias, compra de faltante, logistica; nace
 * pending). El faltante de stock NO bloquea: se muestra la lista informativa
 * de items que requeriran compra.
 *
 * Autorizacion del cliente (decision 2026-10-06): se registra por que canal
 * autorizo (orden de compra, correo, WhatsApp, telefono, mostrador). El
 * numero de OC solo es obligatorio cuando el canal es la orden de compra;
 * antes era obligatorio siempre y los vendedores inventaban folios para los
 * clientes que aceptan por WhatsApp. La constancia (PDF de la OC o captura
 * de pantalla) es opcional y se sube DESPUES de crear la orden.
 *
 * payment_method / credit_days se prellenan desde la cotizacion
 * (default PPD / 30 dias si la quote no los trae).
 */
export function GenerateOrderModal({ quote, isOpen, onClose, onConverted }: GenerateOrderModalProps) {
  const { convert } = useQuoteMutations()
  const { data: items = [], isLoading: itemsLoading } = useQuoteItems(quote.id, { enabled: isOpen })

  const [channel, setChannel] = useState<AcceptanceChannel>('purchase_order')
  const [customerPoNumber, setCustomerPoNumber] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PPD')
  const [creditDays, setCreditDays] = useState('30')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setChannel('purchase_order')
      setCustomerPoNumber('')
      setEvidenceFile(null)
      setPaymentMethod(quote.paymentMethod ?? 'PPD')
      setCreditDays(String(quote.creditDays ?? 30))
      setErrors({})
    }
  }, [isOpen, quote.paymentMethod, quote.creditDays])

  // Informativo (no bloquea): items sin stock suficiente requeriran compra
  const itemsRequiringPurchase = useMemo(
    () =>
      items
        .map((item) => ({ item, status: getQuoteItemStockStatus(item) }))
        .filter(({ status }) => !status.sufficient),
    [items]
  )

  const requiresPoNumber = channel === 'purchase_order'

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setEvidenceFile(null)
      setErrors((prev) => ({ ...prev, file: '' }))
      return
    }
    if (!EVIDENCE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: 'La constancia debe ser PDF o imagen (JPG, PNG, WEBP)' }))
      setEvidenceFile(null)
      return
    }
    if (file.size > MAX_EVIDENCE_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'La constancia no debe exceder 10MB' }))
      setEvidenceFile(null)
      return
    }
    setErrors((prev) => ({ ...prev, file: '' }))
    setEvidenceFile(file)
  }

  const handleSubmit = async () => {
    const validation: Record<string, string> = {}
    if (requiresPoNumber && !customerPoNumber.trim()) {
      validation.customerPoNumber = 'Captura el número de la orden de compra del cliente, o elige otro canal de autorización'
    }
    const parsedCreditDays = Number(creditDays)
    if (!Number.isFinite(parsedCreditDays) || parsedCreditDays < 0) {
      validation.creditDays = 'Dias de credito invalidos'
    }
    if (validation.customerPoNumber || validation.creditDays) {
      setErrors((prev) => ({ ...prev, ...validation }))
      return
    }
    setErrors({})

    try {
      const result = await convert.mutateAsync({
        id: quote.id,
        data: {
          order_type: 'order',
          acceptance_channel: channel,
          ...(customerPoNumber.trim() ? { customer_po_number: customerPoNumber.trim() } : {}),
          payment_method: paymentMethod,
          credit_days: parsedCreditDays
        }
      })

      const salesOrderAttrs = result.data.salesOrder?.attributes
      const orderNumber =
        (salesOrderAttrs?.orderNumber as string | undefined) ||
        (salesOrderAttrs?.order_number as string | undefined) ||
        ''
      const salesOrderId = result.data.salesOrder?.id

      toast.success(orderNumber ? `Pedido ${orderNumber} generado` : 'Pedido generado')

      const requiringPurchase = (result as { items_requiring_purchase?: StockShortageItem[] })
        .items_requiring_purchase
      if (requiringPurchase && requiringPurchase.length > 0) {
        toast.info(
          `${requiringPurchase.length} item(s) requeriran compra de material: ${requiringPurchase
            .map((i) => i.product_name)
            .join(', ')}`
        )
      }

      // La constancia se sube una vez creada la orden
      if (evidenceFile && salesOrderId) {
        setIsUploading(true)
        try {
          await salesService.orders.uploadCustomerPo(salesOrderId, evidenceFile)
          toast.success('Constancia de autorización adjuntada')
        } catch {
          toast.error('El pedido se creó, pero falló la subida de la constancia. Súbela desde el detalle de la orden.')
        } finally {
          setIsUploading(false)
        }
      }

      onClose()
      if (salesOrderId) {
        onConverted(salesOrderId)
      }
    } catch (err) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; error?: string; errors?: Record<string, string[]> } }
      }
      if (error.response?.status === 422) {
        const details = error.response.data?.errors ? Object.values(error.response.data.errors).flat() : []
        toast.error(
          details.length > 0
            ? details.join(' ')
            : error.response.data?.message || error.response.data?.error || 'La cotizacion no se puede convertir en pedido'
        )
      } else {
        toast.error('Error al generar el pedido')
      }
    }
  }

  if (!isOpen) return null

  const isBusy = convert.isPending || isUploading

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-clipboard-check me-2"></i>
              Generar pedido - {quote.quoteNumber}
            </h5>
            <button aria-label="Cerrar" type="button" className="btn-close" onClick={onClose} disabled={isBusy}></button>
          </div>

          <div className="modal-body">
            <p className="text-muted small">
              Pedido con proceso completo (verificación de existencias, compra de material
              faltante, logística). La orden nace pendiente. Registra cómo autorizó el cliente
              para dejar constancia.
            </p>

            {/* Lista informativa: faltantes que requeriran compra (no bloquea) */}
            {!itemsLoading && itemsRequiringPurchase.length > 0 && (
              <div className="alert alert-info" role="alert">
                <strong>
                  <i className="bi bi-info-circle me-2"></i>
                  Items que requeriran compra de material:
                </strong>
                <ul className="mb-0 mt-2">
                  {itemsRequiringPurchase.map(({ item, status }) => (
                    <li key={item.id}>
                      {item.productName || `Producto #${item.productId}`}: se requieren {item.quantity},
                      disponibles {status.available}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h6 className="mb-2">
              <i className="bi bi-patch-check me-2"></i>
              Autorización del cliente
            </h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="order-acceptance-channel">
                  ¿Cómo autorizó el cliente? <span className="text-danger">*</span>
                </label>
                <select
                  id="order-acceptance-channel"
                  className="form-select"
                  value={channel}
                  onChange={(e) => {
                    setChannel(e.target.value as AcceptanceChannel)
                    setErrors((prev) => ({ ...prev, customerPoNumber: '' }))
                  }}
                  disabled={isBusy}
                >
                  {(Object.keys(ACCEPTANCE_CHANNEL_LABELS) as AcceptanceChannel[]).map((key) => (
                    <option key={key} value={key}>
                      {ACCEPTANCE_CHANNEL_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="order-po-number">
                  Orden de compra que emitió el cliente{' '}
                  {requiresPoNumber ? <span className="text-danger">*</span> : <span className="text-muted">(opcional)</span>}
                </label>
                <input
                  id="order-po-number"
                  type="text"
                  className={`form-control${errors.customerPoNumber ? ' is-invalid' : ''}`}
                  value={customerPoNumber}
                  onChange={(e) => setCustomerPoNumber(e.target.value)}
                  placeholder="Ej. OC-2026-0157"
                  maxLength={100}
                  disabled={isBusy}
                />
                <div className="form-text">Es el folio del documento del cliente, no un folio interno.</div>
                {errors.customerPoNumber && (
                  <div className="invalid-feedback d-block">{errors.customerPoNumber}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="order-po-file">
                  Constancia (opcional): PDF de la OC o captura del WhatsApp o correo, máx. 10MB
                </label>
                <input
                  id="order-po-file"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className={`form-control${errors.file ? ' is-invalid' : ''}`}
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  disabled={isBusy}
                />
                {errors.file && <div className="invalid-feedback d-block">{errors.file}</div>}
                <div className="form-text">Se adjunta a la orden después de crearla.</div>
              </div>
            </div>

            <h6 className="mb-2">
              <i className="bi bi-cash-coin me-2"></i>
              Condiciones de pago
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="order-payment-method">Metodo de pago</label>
                <select
                  id="order-payment-method"
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={isBusy}
                >
                  <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                  <option value="PUE">PUE - Pago en una exhibicion</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="order-credit-days">Dias de credito</label>
                <input
                  id="order-credit-days"
                  type="number"
                  className={`form-control${errors.creditDays ? ' is-invalid' : ''}`}
                  min={0}
                  step={1}
                  value={creditDays}
                  onChange={(e) => setCreditDays(e.target.value)}
                  disabled={isBusy}
                />
                {errors.creditDays && <div className="invalid-feedback d-block">{errors.creditDays}</div>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={isBusy}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isBusy || itemsLoading}
            >
              {isBusy ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {isUploading ? 'Adjuntando constancia...' : 'Generando...'}
                </>
              ) : (
                <>
                  <i className="bi bi-clipboard-check me-2"></i>
                  Generar pedido
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
