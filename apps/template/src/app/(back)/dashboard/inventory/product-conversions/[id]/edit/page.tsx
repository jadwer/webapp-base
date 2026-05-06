'use client'

import { use } from 'react'
import { ProductConversionForm } from '@/modules/inventory'

export default function EditProductConversionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ProductConversionForm conversionId={id} />
}
