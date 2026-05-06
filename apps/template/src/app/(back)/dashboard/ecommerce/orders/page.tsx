/**
 * Ecommerce Orders Page
 *
 * Main page for managing ecommerce orders in the admin dashboard.
 * Route: /dashboard/ecommerce/orders
 */

import { OrdersAdminPage } from '@/modules/ecommerce'

export const metadata = {
  title: 'Gestión de Órdenes | Dashboard',
  description: 'Administración de órdenes de comercio electrónico',
}

export default function EcommerceOrdersPage() {
  return <OrdersAdminPage />
}
