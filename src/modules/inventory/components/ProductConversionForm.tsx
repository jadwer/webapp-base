'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { toast } from '@/lib/toast'
import { useProductConversionsMutations, useProductConversion } from '../hooks/useProductConversions'
import type { CreateProductConversionData, UpdateProductConversionData } from '../types/productConversion'

interface ProductConversionFormProps {
  conversionId?: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
}

export const ProductConversionForm = ({ conversionId }: ProductConversionFormProps) => {
  const router = useRouter()
  const isEditing = !!conversionId
  const { conversion, isLoading: isLoadingConversion } = useProductConversion(
    conversionId || null,
    ['sourceProduct', 'destinationProduct']
  )
  const { createConversion, updateConversion } = useProductConversionsMutations()

  const [formData, setFormData] = useState({
    sourceProductId: '',
    destinationProductId: '',
    conversionFactor: '',
    wastePercentage: '0',
    isActive: true,
    notes: '',
  })
  const [products, setProducts] = useState<ProductOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Load products list
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { default: axiosClient } = await import('@/lib/axiosClient')
        const response = await axiosClient.get('/api/v1/products', {
          params: { 'page[size]': 200, sort: 'name' }
        })
        const productList = (response.data?.data || []).map((p: { id: string; attributes?: { name?: string; sku?: string } }) => ({
          id: p.id,
          name: p.attributes?.name || '',
          sku: p.attributes?.sku || '',
        }))
        setProducts(productList)
      } catch {
        setError('Error al cargar los productos')
      } finally {
        setIsLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (conversion && isEditing) {
      setFormData({
        sourceProductId: String(conversion.sourceProductId || ''),
        destinationProductId: String(conversion.destinationProductId || ''),
        conversionFactor: String(conversion.conversionFactor || ''),
        wastePercentage: String(conversion.wastePercentage || '0'),
        isActive: conversion.isActive !== false,
        notes: conversion.notes || '',
      })
    }
  }, [conversion, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isEditing && conversionId) {
        const updateData: UpdateProductConversionData = {
          sourceProductId: Number(formData.sourceProductId),
          destinationProductId: Number(formData.destinationProductId),
          conversionFactor: Number(formData.conversionFactor),
          wastePercentage: Number(formData.wastePercentage),
          isActive: formData.isActive,
          notes: formData.notes || undefined,
        }
        await updateConversion(conversionId, updateData)
        toast.success('Conversion actualizada correctamente')
      } else {
        const createData: CreateProductConversionData = {
          sourceProductId: Number(formData.sourceProductId),
          destinationProductId: Number(formData.destinationProductId),
          conversionFactor: Number(formData.conversionFactor),
          wastePercentage: Number(formData.wastePercentage),
          isActive: formData.isActive,
          notes: formData.notes || undefined,
        }
        await createConversion(createData)
        toast.success('Conversion creada correctamente')
      }
      router.push('/dashboard/inventory/product-conversions')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la conversion'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing && isLoadingConversion) {
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
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={() => router.push('/dashboard/inventory/product-conversions')}
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0">{isEditing ? 'Editar Conversion' : 'Nueva Conversion'}</h1>
              <p className="text-muted mb-0">
                {isEditing ? 'Modificar la conversion entre productos' : 'Definir una nueva conversion entre productos'}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Producto Origen *</label>
                    <select
                      className="form-select"
                      value={formData.sourceProductId}
                      onChange={(e) => setFormData({ ...formData, sourceProductId: e.target.value })}
                      required
                      disabled={isLoadingProducts}
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Producto Destino *</label>
                    <select
                      className="form-select"
                      value={formData.destinationProductId}
                      onChange={(e) => setFormData({ ...formData, destinationProductId: e.target.value })}
                      required
                      disabled={isLoadingProducts}
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.filter((p) => p.id !== formData.sourceProductId).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Factor de Conversion *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.conversionFactor}
                      onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                      step="0.0001"
                      min="0.0001"
                      required
                      placeholder="Ej: 10"
                    />
                    <div className="form-text">
                      Cuantas unidades destino se obtienen por cada unidad origen
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Porcentaje de Merma</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        value={formData.wastePercentage}
                        onChange={(e) => setFormData({ ...formData, wastePercentage: e.target.value })}
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <div className="form-text">
                      Porcentaje de perdida esperado
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Estado</label>
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        id="isActiveSwitch"
                      />
                      <label className="form-check-label" htmlFor="isActiveSwitch">
                        {formData.isActive ? 'Activa' : 'Inactiva'}
                      </label>
                    </div>
                  </div>
                </div>

                {formData.conversionFactor && (
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-calculator me-2" />
                    <strong>Preview:</strong> 1 unidad origen = {Number(formData.conversionFactor)} unidades destino
                    {Number(formData.wastePercentage) > 0 && (
                      <>
                        {' '}(produccion neta: {(Number(formData.conversionFactor) * (1 - Number(formData.wastePercentage) / 100)).toFixed(4)},
                        merma: {(Number(formData.conversionFactor) * Number(formData.wastePercentage) / 100).toFixed(4)})
                      </>
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Notas</label>
                  <textarea
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Notas opcionales sobre esta conversion..."
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/dashboard/inventory/product-conversions')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isEditing ? 'Actualizar' : 'Crear Conversion'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
