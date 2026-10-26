import type { Metadata } from 'next'
import { ProductConversionForm } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar conversión - Inventario',
  description: 'Modificar la conversión entre productos',
}

export default async function EditProductConversionPage({ params }: PageProps) {
  const { id } = await params
  return <ProductConversionForm conversionId={id} />
}
