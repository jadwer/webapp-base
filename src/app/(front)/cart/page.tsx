/**
 * Shopping Cart Page
 *
 * Public page for viewing and managing shopping cart.
 * Uses localStorage for guest users (no backend required).
 * Route: /cart
 */

'use client'

import { LocalCartPage } from '@/modules/public-catalog/components/LocalCartPage'

export default function ShoppingCartRoute() {
  return (
    <LocalCartPage
      checkoutUrl="/checkout"
      continueShoppingUrl="/productos"
    />
  )
}
