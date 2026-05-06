/**
 * CREATE STOCK PAGE
 * Página para crear nuevos registros de stock
 */

import { CreateStockWrapper } from '@/modules/inventory'

export default function CreateStockPage() {
  return <CreateStockWrapper />
}

export const metadata = {
  title: 'Crear Stock - Gestión de Inventario',
  description: 'Crear un nuevo registro de stock en el sistema de inventario'
}