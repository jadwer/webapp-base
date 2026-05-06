'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { toast } from '@/lib/toast'
import { useConversionsBySourceProduct } from '../hooks/useProductConversions'
import { useFractionationMutations } from '../hooks/useFractionations'
import { FractionationCalculator } from './FractionationCalculator'
import type { FractionationCalculateResponse } from '../types/fractionation'

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface WarehouseOption {
  id: string
  name: string
}

export const FractionationForm = () => {
  const router = useRouter()
  const { calculate, execute } = useFractionationMutations()

  const [sourceProductId, setSourceProductId] = useState('')
  const [destinationProductId, setDestinationProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [sourceQuantity, setSourceQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const [products, setProducts] = useState<ProductOption[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [preview, setPreview] = useState<FractionationCalculateResponse['data'] | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available conversions for selected source product
  const { conversions } = useConversionsBySourceProduct(
    sourceProductId || null,
    ['destinationProduct']
  )

  // Load products and warehouses
  useEffect(() => {
    const loadData = async () => {
      try {
        const { default: axiosClient } = await import('@/lib/axiosClient')
        const [productsRes, warehousesRes] = await Promise.all([
          axiosClient.get('/api/v1/products', { params: { 'page[size]': 200, sort: 'name' } }),
          axiosClient.get('/api/v1/warehouses', { params: { 'page[size]': 50, sort: 'name' } }),
        ])

        setProducts((productsRes.data?.data || []).map((p: { id: string; attributes?: { name?: string; sku?: string } }) => ({
          id: p.id,
          name: p.attributes?.name || '',
          sku: p.attributes?.sku || '',
        })))

        setWarehouses((warehousesRes.data?.data || []).map((w: { id: string; attributes?: { name?: string } }) => ({
          id: w.id,
          name: w.attributes?.name || '',
        })))
      } catch {
        setError('Error al cargar datos')
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

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
      const message = err instanceof Error ? err.message : 'Error al calcular'
      setError(message)
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
      router.push(`/dashboard/inventory/fraccionamiento/${result.data.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al ejecutar el fraccionamiento'
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

  if (isLoadingData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={() => router.push('/dashboard/inventory/fraccionamiento')}
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0">Nuevo Fraccionamiento</h1>
              <p className="text-muted mb-0">Fraccionar producto a granel en presentaciones menores</p>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div className="card mb-3">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Producto Origen *</label>
                  <select
                    className="form-select"
                    value={sourceProductId}
                    onChange={(e) => setSourceProductId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto origen...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Almacen *</label>
                  <select
                    className="form-select"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar almacen...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Producto Destino *</label>
                  <select
                    className="form-select"
                    value={destinationProductId}
                    onChange={(e) => setDestinationProductId(e.target.value)}
                    required
                    disabled={!sourceProductId || destinationOptions.length === 0}
                  >
                    <option value="">
                      {!sourceProductId
                        ? 'Selecciona un producto origen primero...'
                        : destinationOptions.length === 0
                          ? 'No hay conversiones configuradas'
                          : 'Seleccionar producto destino...'}
                    </option>
                    {destinationOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sku} - {d.name} (Factor: {d.factor}x, Merma: {d.waste}%)
                      </option>
                    ))}
                  </select>
                  {sourceProductId && destinationOptions.length === 0 && (
                    <div className="form-text text-warning">
                      <i className="bi bi-exclamation-triangle me-1" />
                      No hay conversiones activas para este producto.
                      <a href="/dashboard/inventory/product-conversions/create" className="ms-1">
                        Crear una
                      </a>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cantidad a Fraccionar *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={sourceQuantity}
                    onChange={(e) => setSourceQuantity(e.target.value)}
                    min="0.0001"
                    step="0.0001"
                    required
                    placeholder="Cantidad del producto origen"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas opcionales..."
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <FractionationCalculator preview={preview} isLoading={isCalculating} />

          {/* Action buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/inventory/fraccionamiento')}
              disabled={isExecuting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExecute}
              disabled={!preview?.has_enough_stock || isExecuting || isCalculating}
              isLoading={isExecuting}
            >
              <i className="bi bi-scissors me-2" />
              Ejecutar Fraccionamiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
