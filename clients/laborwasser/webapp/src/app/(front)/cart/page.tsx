/**
 * /cart (rediseno 2026-08): carrito con la piel del tenant
 * (modules/catalog/CartPage) sobre useLocalCartPageController de
 * @lwm/ecommerce (misma logica de sync/cotizacion/checkout de siempre).
 * El LocalCartPage clasico del package sigue disponible para otros tenants.
 */

'use client'

import { CartPage } from '@/modules/catalog'

export default function ShoppingCartRoute() {
  return <CartPage />
}
