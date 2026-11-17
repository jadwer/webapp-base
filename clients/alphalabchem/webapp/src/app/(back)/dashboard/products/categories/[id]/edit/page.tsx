'use client'

// Rediseno de Productos (2026-11-17): edicion con vista previa en @lwm/products
import { use } from 'react'
import { CatalogFormPage } from '@/modules/products'

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CatalogFormPage kind="category" id={id} />
}
