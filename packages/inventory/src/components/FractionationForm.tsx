'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DetailSection, PageHeader, toast } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useConversionsBySourceProduct } from '../hooks/useProductConversions'
import { useFractionationMutations } from '../hooks/useFractionations'
import { useWarehouses } from '../hooks'
import { FractionationCalculator } from './FractionationCalculator'
import { apiErrorMessage } from '../utils/listing'
import { newIdempotencyKey, batchUnavailableReason } from '../utils/fractionation'
import { formatDate, formatQty } from '../utils/format'
import type { FractionationPreview, FractionationBatchOption } from '../types/fractionation'

const LIST_HREF = '/dashboard/inventory/fraccionamiento'

const batchLabel = (b: FractionationBatchOption): string => {
  const parts = [b.batch_number]
  if (b.lot_number) parts.push(`lote ${b.lot_number}`)
  parts.push(b.expiration_date ? `caduca ${formatDate(b.expiration_date)}` : 'sin caducidad')
  parts.push(`disponible ${formatQty(b.available_quantity)}`)
  // D10: el lote bloqueado dice por que (caducado el dd/mm/aaaa, cuarentena, ...)
  const reason = batchUnavailableReason(b)
  if (reason) parts.push(`NO DISPONIBLE: ${reason}`)
  return parts.join(' · ')
}

export const FractionationForm = () => {
  const router = useRouter()
  const { calculate, execute } = useFractionationMutations()
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({
    filters: { isActive: true },
    pagination: { size: 100 },
  })

  const [sourceProductId, setSourceProductId] = useState('')
  const [destinationProductId, setDestinationProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [warehouseLocationId, setWarehouseLocationId] = useState('')
  const [productBatchId, setProductBatchId] = useState('')
  const [sourceQuantity, setSourceQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const [preview, setPreview] = useState<FractionationPreview | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Una clave por formulario abierto: cada reintento (doble clic, red caida)
  // manda la misma y el backend no fracciona dos veces.
  const idempotencyKeyRef = useRef<string>(newIdempotencyKey())
  // El lote lo elige FEFO hasta que el usuario lo cambie a mano
  const batchTouchedRef = useRef(false)

  const { conversions } = useConversionsBySourceProduct(
    sourceProductId || null,
    ['destinationProduct']
  )

  // Origen distinto = destino, ubicacion y lote se reinician
  useEffect(() => {
    setDestinationProductId('')
    setWarehouseLocationId('')
    setProductBatchId('')
    batchTouchedRef.current = false
    setPreview(null)
  }, [sourceProductId])

  useEffect(() => {
    setWarehouseLocationId('')
    setProductBatchId('')
    batchTouchedRef.current = false
  }, [warehouseId])

  const handleCalculate = useCallback(async () => {
    if (!sourceProductId || !destinationProductId || !warehouseId || !sourceQuantity) return

    setIsCalculating(true)
    setError(null)

    try {
      const result = await calculate({
        source_product_id: Number(sourceProductId),
        destination_product_id: Number(destinationProductId),
        source_quantity: Number(sourceQuantity),
        warehouse_id: Number(warehouseId),
        ...(warehouseLocationId && { warehouse_location_id: Number(warehouseLocationId) }),
        ...(productBatchId && { product_batch_id: Number(productBatchId) }),
      })
      const data = result.data
      setPreview(data)
      // FEFO preseleccionado: el lote sugerido mientras el usuario no elija otro
      if (!batchTouchedRef.current && !productBatchId && data.suggested_batch_id) {
        setProductBatchId(String(data.suggested_batch_id))
      }
    } catch (err) {
      setPreview(null)
      setError(apiErrorMessage(err, 'Error al calcular el fraccionamiento'))
    } finally {
      setIsCalculating(false)
    }
  }, [sourceProductId, destinationProductId, warehouseId, warehouseLocationId, productBatchId, sourceQuantity, calculate])

  useEffect(() => {
    if (sourceProductId && destinationProductId && warehouseId && sourceQuantity && Number(sourceQuantity) > 0) {
      const timer = setTimeout(handleCalculate, 500)
      return () => clearTimeout(timer)
    }
    setPreview(null)
    return undefined
  }, [sourceProductId, destinationProductId, warehouseId, sourceQuantity, handleCalculate])

  const canExecute = Boolean(preview && (preview.can_execute ?? preview.has_enough_stock))
  const batchMissing = Boolean(preview?.batch_required && !productBatchId)
  const locationMissing = Boolean(preview?.location_required && !warehouseLocationId)

  const handleExecute = async () => {
    if (!canExecute || batchMissing || locationMissing || selectedBatchReason) return

    setIsExecuting(true)
    setError(null)

    try {
      const result = await execute({
        source_product_id: Number(sourceProductId),
        destination_product_id: Number(destinationProductId),
        source_quantity: Number(sourceQuantity),
        warehouse_id: Number(warehouseId),
        ...(warehouseLocationId && { warehouse_location_id: Number(warehouseLocationId) }),
        ...(productBatchId && { product_batch_id: Number(productBatchId) }),
        notes: notes || undefined,
        idempotency_key: idempotencyKeyRef.current,
      })
      if (result.meta?.replayed) {
        toast.info(result.message)
      } else {
        toast.success(result.message)
      }
      result.meta?.warnings?.forEach((w) => toast.warning(w))
      router.push(`${LIST_HREF}/${result.data.id}`)
    } catch (err) {
      const message = apiErrorMessage(err, 'Error al ejecutar el fraccionamiento')
      setError(message)
      toast.error(message)
    } finally {
      setIsExecuting(false)
    }
  }

  const destinationOptions = conversions.map((c) => ({
    id: String(c.destinationProductId),
    name: c.destinationProduct?.name || `Producto ${c.destinationProductId}`,
    sku: c.destinationProduct?.sku || '',
    factor: c.conversionFactor,
    waste: c.wastePercentage,
    wholeUnits: c.wholeUnits === true,
  }))

  const batches = preview?.batches ?? []
  const blockedBatches = batches
    .map((batch) => ({ batch, reason: batchUnavailableReason(batch) }))
    .filter((entry): entry is { batch: FractionationBatchOption; reason: string } => entry.reason !== null)
  const selectedBatchReason = productBatchId
    ? blockedBatches.find((entry) => String(entry.batch.id) === productBatchId)?.reason ?? null
    : null
  const locations = preview?.locations ?? []
  const showLocations = locations.length > 1 || Boolean(warehouseLocationId)

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title="Nuevo fraccionamiento"
            subtitle="Fracciona un producto a granel en presentaciones menores"
            backHref={LIST_HREF}
          />

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </div>
          )}

          <DetailSection title="Origen y destino" icon="bi-scissors">
            <div className="row g-3">
              <div className="col-12">
                <ProductSearchSelect
                  id="fractionation-source"
                  className=""
                  label="Producto origen"
                  value={sourceProductId}
                  onChange={(id) => setSourceProductId(id)}
                  required
                  disabled={isExecuting}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="fractionation-warehouse" className="form-label">
                  Almacén <span className="text-danger">*</span>
                </label>
                <select
                  id="fractionation-warehouse"
                  className="form-select"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  disabled={isExecuting || (isLoadingWarehouses && warehouses.length === 0)}
                >
                  <option value="">{isLoadingWarehouses && warehouses.length === 0 ? 'Cargando almacenes...' : 'Seleccionar almacén...'}</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}{w.code ? ` (${w.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="fractionation-quantity" className="form-label">
                  Cantidad a fraccionar <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="fractionation-quantity"
                    type="number"
                    className="form-control"
                    value={sourceQuantity}
                    onChange={(e) => setSourceQuantity(e.target.value)}
                    min="0.0001"
                    step="0.0001"
                    placeholder="Cantidad del producto origen"
                    disabled={isExecuting}
                  />
                  {preview?.source_product.unit && (
                    <span className="input-group-text">{preview.source_product.unit.name}</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="fractionation-destination" className="form-label">
                  Producto destino <span className="text-danger">*</span>
                </label>
                <select
                  id="fractionation-destination"
                  className="form-select"
                  value={destinationProductId}
                  onChange={(e) => setDestinationProductId(e.target.value)}
                  disabled={isExecuting || !sourceProductId || destinationOptions.length === 0}
                >
                  <option value="">
                    {!sourceProductId
                      ? 'Elige primero el producto origen'
                      : destinationOptions.length === 0
                        ? 'No hay conversiones configuradas'
                        : 'Seleccionar producto destino...'}
                  </option>
                  {destinationOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.sku ? `${d.sku} - ` : ''}{d.name} (factor {d.factor}x, merma {d.waste}%{d.wholeUnits ? ', piezas completas' : ''})
                    </option>
                  ))}
                </select>
                {sourceProductId && destinationOptions.length === 0 && (
                  <div className="form-text text-warning">
                    <i className="bi bi-exclamation-triangle me-1" />
                    No hay conversiones activas para este producto.
                    <Link href="/dashboard/inventory/product-conversions/create" className="ms-1">
                      Crear una
                    </Link>
                  </div>
                )}
              </div>

              {showLocations && (
                <div className="col-md-6">
                  <label htmlFor="fractionation-location" className="form-label">
                    Ubicación {preview?.location_required && <span className="text-danger">*</span>}
                  </label>
                  <select
                    id="fractionation-location"
                    className={`form-select ${locationMissing ? 'is-invalid' : ''}`}
                    value={warehouseLocationId}
                    onChange={(e) => setWarehouseLocationId(e.target.value)}
                    disabled={isExecuting}
                  >
                    <option value="">Elegir ubicación...</option>
                    {locations
                      .filter((l) => l.warehouse_location_id !== null)
                      .map((l) => (
                        <option key={String(l.warehouse_location_id)} value={String(l.warehouse_location_id)}>
                          {l.name || `Ubicación ${l.warehouse_location_id}`}{l.code ? ` (${l.code})` : ''} · disponible {formatQty(l.available)}
                        </option>
                      ))}
                  </select>
                  {locationMissing && (
                    <div className="invalid-feedback d-block">
                      El producto origen está en varias ubicaciones de este almacén: elige de cuál se fracciona.
                    </div>
                  )}
                </div>
              )}

              {(batches.length > 0 || preview?.batch_required) && (
                <div className={showLocations ? 'col-md-6' : 'col-12'}>
                  <label htmlFor="fractionation-batch" className="form-label">
                    Lote de origen {preview?.batch_required && <span className="text-danger">*</span>}
                  </label>
                  <select
                    id="fractionation-batch"
                    className={`form-select ${batchMissing ? 'is-invalid' : ''}`}
                    value={productBatchId}
                    onChange={(e) => {
                      batchTouchedRef.current = true
                      setProductBatchId(e.target.value)
                    }}
                    disabled={isExecuting}
                  >
                    <option value="">Elegir lote...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={String(b.id)} disabled={batchUnavailableReason(b) !== null}>
                        {batchLabel(b)}{preview?.suggested_batch_id === b.id ? ' (sugerido FEFO)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Se sugiere el lote que caduca primero (FEFO). El lote destino hereda el lote y la caducidad.
                  </div>
                  {blockedBatches.length > 0 && (
                    <div className="form-text text-warning-emphasis" data-testid="fractionation-blocked-batches">
                      <i className="bi bi-slash-circle me-1" aria-hidden="true"></i>
                      No se pueden fraccionar:{' '}
                      {blockedBatches.map(({ batch, reason }) => `${batch.batch_number} (${reason})`).join('; ')}.
                    </div>
                  )}
                  {selectedBatchReason && (
                    <div className="invalid-feedback d-block" data-testid="fractionation-selected-batch-blocked">
                      El lote elegido no se puede fraccionar: {selectedBatchReason}. Elige otro lote.
                    </div>
                  )}
                  {batchMissing && (
                    <div className="invalid-feedback d-block">
                      El producto origen maneja lotes: elige el lote que se fracciona.
                    </div>
                  )}
                </div>
              )}

              <div className="col-12">
                <label htmlFor="fractionation-notes" className="form-label">Notas</label>
                <textarea
                  id="fractionation-notes"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  disabled={isExecuting}
                />
              </div>
            </div>
          </DetailSection>

          <FractionationCalculator preview={preview} isLoading={isCalculating} />

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => router.push(LIST_HREF)}
              disabled={isExecuting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExecute}
              disabled={!canExecute || batchMissing || locationMissing || Boolean(selectedBatchReason) || isExecuting || isCalculating}
            >
              {isExecuting ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" />
              ) : (
                <i className="bi bi-scissors me-1" />
              )}
              Ejecutar fraccionamiento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
