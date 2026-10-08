'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { ProductBatchForm } from './ProductBatchForm'
import { FormStateCard } from './FormStateCard'
import { useProductBatch, useProductBatchMutations, useWarehouses } from '../hooks'
import type { CreateProductBatchRequest, UpdateProductBatchRequest, WarehouseParsed } from '../types'

interface EditProductBatchWrapperProps {
  productBatchId: string
}

const LIST_HREF = '/dashboard/inventory/product-batch'

export const EditProductBatchWrapper = ({ productBatchId }: EditProductBatchWrapperProps) => {
  const navigation = useNavigationProgress()
  const detailHref = `${LIST_HREF}/${productBatchId}`
  const { productBatch, isLoading: isLoadingBatch, error } = useProductBatch({ id: productBatchId })
  const { updateProductBatch } = useProductBatchMutations()
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({
    filters: { isActive: true },
    pagination: { size: 100 },
  })

  const handleSubmit = async (data: CreateProductBatchRequest | UpdateProductBatchRequest) => {
    await updateProductBatch(productBatchId, data as UpdateProductBatchRequest)
    toast.success('Lote actualizado')
    navigation.push(detailHref)
  }

  if (isLoadingBatch || (isLoadingWarehouses && warehouses.length === 0)) {
    return <FormStateCard state="loading" title="Editar lote" backHref={detailHref} message="Cargando lote..." />
  }
  if (error) {
    return <FormStateCard state="error" title="Editar lote" backHref={LIST_HREF} message={error.message || 'No se pudo cargar el lote.'} />
  }
  if (!productBatch) {
    return <FormStateCard state="not-found" title="Editar lote" backHref={LIST_HREF} icon="bi-box" message="El lote no existe o no está disponible." />
  }

  // Un almacen inactivo del lote sigue disponible en la edicion
  const current = productBatch.warehouse as WarehouseParsed | undefined
  const options = current && !warehouses.some((w) => w.id === String(current.id))
    ? [current, ...warehouses]
    : warehouses

  return (
    <ProductBatchForm
      productBatch={productBatch}
      onSubmit={handleSubmit}
      onCancel={() => navigation.push(detailHref)}
      warehouses={options}
      backHref={detailHref}
    />
  )
}
