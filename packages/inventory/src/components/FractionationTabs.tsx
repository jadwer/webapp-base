'use client'

import { TabNav } from '@lwm/ui'

const TABS = [
  { key: 'history', label: 'Historial', href: '/dashboard/inventory/fraccionamiento', icon: 'bi-scissors' },
  { key: 'conversions', label: 'Conversiones', href: '/dashboard/inventory/product-conversions', icon: 'bi-arrow-repeat' },
]

/** Pestanas Historial | Conversiones (modo enlace, activa por ruta) */
export const FractionationTabs = () => <TabNav tabs={TABS} />

export default FractionationTabs
