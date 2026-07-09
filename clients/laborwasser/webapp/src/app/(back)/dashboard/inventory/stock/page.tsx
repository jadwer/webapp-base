/**
 * STOCK PAGE
 * Gestión completa de stock
 */

import { StockAdminPageReal } from '@/modules/inventory'

export default function StockPage() {
  return <StockAdminPageReal />
}

export const metadata = {
  title: 'Stock - Gestión de Inventario',
  description: 'Control completo de stock y niveles de inventario'
}