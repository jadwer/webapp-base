import type { Metadata } from 'next'
import { FractionationForm } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo fraccionamiento - Inventario',
  description: 'Fraccionar un producto a granel en presentaciones menores',
}

export default function CreateFractionationPage() {
  return <FractionationForm />
}
