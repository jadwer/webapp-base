/**
 * PUBLIC PRODUCT DETAIL PAGE
 * Route: /productos/[id]
 * Displays detailed product information with add to cart functionality
 */

'use client'

import React, { use } from 'react'
import { ProductDetailPage } from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'

interface ProductDetailRouteProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { id } = use(params)
  const toast = useToast()

  const handleAddToCart = (product: EnhancedPublicProduct) => {
    toast.success(`${product.displayName} agregado al carrito`)
  }

  return (
    <ProductDetailPage
      productId={id}
      onAddToCart={handleAddToCart}
      backUrl="/productos"
      backLabel="Volver al catalogo"
    />
  )
}
