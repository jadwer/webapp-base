'use client'

import useSWR from 'swr'
import { productImageService } from '../services/productImageService'
import type { ProductImage } from '../types/productImage'

export function useProductImages(productId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<ProductImage[]>(
    productId ? ['product-images', productId] : null,
    () => productImageService.getByProduct(productId!),
  )

  return {
    images: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
