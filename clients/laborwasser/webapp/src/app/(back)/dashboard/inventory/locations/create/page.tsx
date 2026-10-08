import type { Metadata } from 'next'
import { CreateLocationWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nueva ubicación - Inventario',
  description: 'Agregar una ubicación dentro de un almacén',
}

export default function CreateLocationPage() {
  return <CreateLocationWrapper />
}
