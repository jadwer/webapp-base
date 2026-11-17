'use client'

// Rediseno de Productos (2026-11-17): consulta en solo lectura en @lwm/products
import { use } from 'react'
import { CatalogFormPage } from '@/modules/products'

export default function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CatalogFormPage kind="unit" id={id} readOnly />
}
