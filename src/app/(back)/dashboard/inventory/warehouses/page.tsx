/**
 * 📦 WAREHOUSES LIST PAGE - INVENTORY MODULE
 * Página principal de gestión de almacenes
 */

import { WarehousesAdminPagePro } from '@/modules/inventory'

export default function WarehousesPage() {
  return (
    <WarehousesAdminPagePro 
      title="Gestión de Almacenes"
      showCreateButton={true}
      showBulkActions={true}
      enableSelection={true}
    />
  )
}

export const metadata = {
  title: 'Almacenes - Sistema de Inventario',
  description: 'Gestión enterprise de almacenes con 5 vistas virtualizadas y performance optimizada',
}