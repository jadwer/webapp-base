'use client'

/**
 * Piel clasica de la ficha (ProductDetailPage del package) con el producto
 * prerenderizado en servidor como initialProduct (SEO Bloque 1).
 */

import React from 'react'
import { ProductDetailPage } from '@/modules/public-catalog'
import { toast } from '@/lib/toast'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'

export interface ProductDetailClientProps {
  productId: string
  initialProduct?: EnhancedPublicProduct | null
}

export default function ProductDetailClient({ productId, initialProduct }: ProductDetailClientProps) {
  const handleAddToCart = (product: EnhancedPublicProduct) => {
    toast.success(`${product.displayName} agregado al carrito`)
  }

  return (
    <ProductDetailPage
      productId={productId}
      initialProduct={initialProduct}
      onAddToCart={handleAddToCart}
      backUrl="/productos"
      backLabel="Volver al catálogo"
    />
  )
}
