'use client'

/**
 * /productos/[id] (rediseno 2026-08): ficha de producto con la piel del
 * tenant (modules/catalog/ProductDetail) sobre los hooks de @lwm/ecommerce.
 * El ProductDetailPage clasico del package sigue disponible para otros
 * tenants.
 */

import React, { use } from 'react'
import { ProductDetail } from '@/modules/catalog'

interface ProductDetailRouteProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { id } = use(params)
  return <ProductDetail productId={id} />
}
