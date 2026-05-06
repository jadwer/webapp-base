/**
 * CREATE LOCATION PAGE
 * Página para crear nuevas ubicaciones
 */

import { CreateLocationWrapper } from '@/modules/inventory'

export default function CreateLocationPage() {
  return <CreateLocationWrapper />
}

export const metadata = {
  title: 'Crear Ubicación - Gestión de Inventario',
  description: 'Crear una nueva ubicación en el sistema de inventario'
}