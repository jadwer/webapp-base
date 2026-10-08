import type { Metadata } from 'next'
import { ProductConversionForm } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nueva conversión - Inventario',
  description: 'Definir una conversión entre productos para fraccionamiento',
}

export default function CreateProductConversionPage() {
  return <ProductConversionForm />
}
