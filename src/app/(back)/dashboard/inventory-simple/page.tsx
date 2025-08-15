/**
 * INVENTORY SIMPLE - MAIN PAGE
 * Redirige a la gestión de almacenes por defecto
 */

import { redirect } from 'next/navigation'

export default function InventorySimplePage() {
  redirect('/dashboard/inventory-simple/warehouses')
}

export const metadata = {
  title: 'Gestión de Inventario - Simple',
  description: 'Sistema simple y profesional de gestión de inventario'
}