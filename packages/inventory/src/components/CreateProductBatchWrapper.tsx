'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { ProductBatchForm } from './ProductBatchForm'
import { FormStateCard } from './FormStateCard'
import { useProductBatchMutations, useWarehouses } from '../hooks'
import type { CreateProductBatchRequest, UpdateProductBatchRequest } from '../types'

const LIST_HREF = '/dashboard/inventory/product-batch'

export const CreateProductBatchWrapper = () => {
  const navigation = useNavigationProgress()
  const { createProductBatch } = useProductBatchMutations()
  const { warehouses, isLoading } = useWarehouses({
    filters: { isActive: true },
    pagination: { size: 100 },
  })

  const handleSubmit = async (data: CreateProductBatchRequest | UpdateProductBatchRequest) => {
    await createProductBatch(data as CreateProductBatchRequest)
    toast.success('Lote creado')
    navigation.push(LIST_HREF)
  }

  if (isLoading && warehouses.length === 0) {
    return <FormStateCard state="loading" title="Nuevo lote" backHref={LIST_HREF} message="Cargando almacenes..." />
  }

  return (
    <ProductBatchForm
      onSubmit={handleSubmit}
      onCancel={() => navigation.push(LIST_HREF)}
      warehouses={warehouses}
      backHref={LIST_HREF}
    />
  )
}
