/**
 * STOCK PAGE - REAL ROUTE
 * Ruta específica para gestión de stock/inventario
 */

import { StockAdminPageReal } from '@/modules/inventory-simple'

export default function StockPage() {
  return <StockAdminPageReal />
}

export const metadata = {
  title: 'Stock - Gestión de Inventario',
  description: 'Control de stock y niveles de inventario'
}