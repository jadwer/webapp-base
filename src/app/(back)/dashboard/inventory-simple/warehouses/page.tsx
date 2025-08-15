/**
 * WAREHOUSES PAGE - REAL ROUTE
 * Ruta específica para gestión de almacenes
 */

import { WarehousesAdminPage } from '@/modules/inventory-simple'

export default function WarehousesPage() {
  return <WarehousesAdminPage />
}

export const metadata = {
  title: 'Almacenes - Gestión de Inventario',
  description: 'Gestión de almacenes y ubicaciones de inventario'
}