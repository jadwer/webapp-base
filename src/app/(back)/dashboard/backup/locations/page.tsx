/**
 * LOCATIONS PAGE - REAL ROUTE
 * Ruta específica para gestión de ubicaciones
 */

import { LocationsAdminPageReal } from '@/modules/inventory-simple'

export default function LocationsPage() {
  return <LocationsAdminPageReal />
}

export const metadata = {
  title: 'Ubicaciones - Gestión de Inventario',
  description: 'Gestión de ubicaciones dentro de almacenes'
}