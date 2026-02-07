/**
 * Shopping Cart Page
 *
 * Public page for viewing and managing shopping cart.
 * Uses localStorage for guest users (no backend required).
 * Route: /cart
 */

'use client'

import { Suspense } from 'react'
import { LocalCartPage } from '@/modules/public-catalog/components/LocalCartPage'

function CartPageContent() {
  return (
    <LocalCartPage
      checkoutUrl="/checkout"
      continueShoppingUrl="/productos"
    />
  )
}

export default function ShoppingCartRoute() {
  return (
    <Suspense fallback={
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando carrito...</span>
          </div>
        </div>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  )
}
