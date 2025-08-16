/**
 * MOVEMENTS PAGE - REAL ROUTE
 * Ruta específica para gestión de movimientos de inventario
 */

import { MovementsAdminPageReal } from '@/modules/inventory-simple'

export default function MovementsPage() {
  return <MovementsAdminPageReal />
}

export const metadata = {
  title: 'Movimientos - Gestión de Inventario',
  description: 'Historial y trazabilidad de movimientos de inventario'
}