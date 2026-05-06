/**
 * CREATE WAREHOUSE PAGE
 * Página para crear nuevos almacenes
 */

import { CreateWarehouseWrapper } from '@/modules/inventory'

export default function CreateWarehousePage() {
  return <CreateWarehouseWrapper />
}

export const metadata = {
  title: 'Crear Almacén - Gestión de Inventario',
  description: 'Crear un nuevo almacén en el sistema de inventario'
}