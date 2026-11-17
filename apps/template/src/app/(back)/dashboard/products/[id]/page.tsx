'use client'

// Rediseno de Productos (2026-11-17): la consulta vive en @lwm/products
import { use } from 'react'
import { ProductDetailView } from '@/modules/products'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ProductDetailView productId={id} />
}
