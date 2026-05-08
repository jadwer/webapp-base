/**
 * CREATE MOVEMENT PAGE
 * Página para crear nuevos movimientos de inventario
 */

import { CreateMovementWrapper } from '@/modules/inventory'

export default function CreateMovementPage() {
  return <CreateMovementWrapper />
}

export const metadata = {
  title: 'Crear Movimiento - Gestión de Inventario',
  description: 'Crear un nuevo movimiento de inventario en el sistema'
}