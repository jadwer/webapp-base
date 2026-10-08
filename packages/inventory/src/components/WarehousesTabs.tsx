'use client'

import { TabNav } from '@lwm/ui'

const TABS = [
  { key: 'warehouses', label: 'Almacenes', href: '/dashboard/inventory/warehouses', icon: 'bi-building' },
  { key: 'locations', label: 'Ubicaciones', href: '/dashboard/inventory/locations', icon: 'bi-geo-alt' },
]

/** Pestanas Almacenes | Ubicaciones (modo enlace, activa por ruta) */
export const WarehousesTabs = () => <TabNav tabs={TABS} />

export default WarehousesTabs
