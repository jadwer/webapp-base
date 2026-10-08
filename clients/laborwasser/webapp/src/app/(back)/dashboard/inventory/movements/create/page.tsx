import type { Metadata } from 'next'
import { CreateMovementWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo movimiento - Inventario',
  description: 'Registrar una entrada, salida, transferencia o ajuste de inventario',
}

export default function CreateMovementPage() {
  return <CreateMovementWrapper />
}
