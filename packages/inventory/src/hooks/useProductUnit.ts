'use client'

/**
 * Unidad de medida de un producto (para mostrarla en conversiones y calcular
 * el factor por contenido). GET /api/v1/products/{id}?include=unit
 */

import useSWR from 'swr'
import axiosClient from '../lib/axiosClient'

export interface ProductUnitInfo {
  name: string
  code: string
}

interface ProductUnitResponse {
  data?: { relationships?: { unit?: { data?: { id: string; type: string } | null } } }
  included?: Array<{ id: string; type: string; attributes?: { name?: string; code?: string } }>
}

export const fetchProductUnit = async (productId: string): Promise<ProductUnitInfo | null> => {
  const response = await axiosClient.get<ProductUnitResponse>(`/api/v1/products/${productId}`, {
    params: { include: 'unit' },
  })
  const ref = response.data?.data?.relationships?.unit?.data
  if (!ref) return null
  const unit = response.data?.included?.find((item) => item.type === ref.type && item.id === ref.id)
  if (!unit?.attributes) return null
  return { name: unit.attributes.name || '', code: unit.attributes.code || '' }
}

export const useProductUnit = (productId: string | null | undefined) => {
  const { data, error, isLoading } = useSWR(
    productId ? ['product-unit', productId] : null,
    () => fetchProductUnit(productId as string),
    { revalidateOnFocus: false }
  )
  return { unit: data ?? null, error, isLoading }
}
