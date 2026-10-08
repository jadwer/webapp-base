'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DetailSection, PageHeader, toast } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useConversionsBySourceProduct } from '../hooks/useProductConversions'
import { useFractionationMutations } from '../hooks/useFractionations'
import { useWarehouses } from '../hooks'
import { FractionationCalculator } from './FractionationCalculator'
import { apiErrorMessage } from '../utils/listing'
import type { FractionationCalculateResponse } from '../types/fractionation'

const LIST_HREF = '/dashboard/inventory/fraccionamiento'

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
  const [sourceQuantity, setSourceQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const [preview, setPreview] = useState<FractionationCalculateResponse['data'] | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available conversions for selected source product
  const { conversions } = useConversionsBySourceProduct(
    sourceProductId || null,
    ['destinationProduct']
  )

  // Reset destination when source changes
  useEffect(() => {
    setDestinationProductId('')
    setPreview(null)
  }, [sourceProductId])

  // Auto-calculate preview
  const handleCalculate = useCallback(async () => {
    if (!sourceProductId || !destinationProductId || !warehouseId || !sourceQuantity) return

    setIsCalculating(true)
    setError(null)
    setPreview(null)

    try {
      const result = await calculate({
        source_product_id: Number(sourceProductId),
        destination_product_id: Number(destinationProductId),
        source_quantity: Number(sourceQuantity),
        warehouse_id: Number(warehouseId),
      })
      setPreview(result.data)
    } catch (err) {
      setError(apiErrorMessage(err, 'Error al calcular el fraccionamiento'))
    } finally {
      setIsCalculating(false)
    }
  }, [sourceProductId, destinationProductId, warehouseId, sourceQuantity, calculate])

  // Trigger calculation when all fields are filled
  useEffect(() => {
    if (sourceProductId && destinationProductId && warehouseId && sourceQuantity && Number(sourceQuantity) > 0) {
      const timer = setTimeout(handleCalculate, 500)
      return () => clearTimeout(timer)
    } else {
      setPreview(null)
    }
  }, [sourceProductId, destinationProductId, warehouseId, sourceQuantity, handleCalculate])

  const handleExecute = async () => {
    if (!preview?.has_enough_stock) return

    setIsExecuting(true)
    setError(null)

    try {
      const result = await execute({
        source_product_id: Number(sourceProductId),
        destination_product_id: Number(destinationProductId),
        source_quantity: Number(sourceQuantity),
        warehouse_id: Number(warehouseId),
        notes: notes || undefined,
      })
      toast.success(result.message)
      router.push(`${LIST_HREF}/${result.data.id}`)
    } catch (err) {
      const message = apiErrorMessage(err, 'Error al ejecutar el fraccionamiento')
      setError(message)
      toast.error(message)
    } finally {
      setIsExecuting(false)
    }
  }

  // Destination products from available conversions
  const destinationOptions = conversions.map((c) => ({
    id: String(c.destinationProductId),
    name: c.destinationProduct?.name || `Producto ${c.destinationProductId}`,
    sku: c.destinationProduct?.sku || '',
    factor: c.conversionFactor,
    waste: c.wastePercentage,
  }))

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
                      {d.sku ? `${d.sku} - ` : ''}{d.name} (factor {d.factor}x, merma {d.waste}%)
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
              disabled={!preview?.has_enough_stock || isExecuting || isCalculating}
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
