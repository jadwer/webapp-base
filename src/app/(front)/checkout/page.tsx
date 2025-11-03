/**
 * Checkout Page
 *
 * Public page for checkout process.
 * Route: /checkout
 */

'use client'

import { useEffect, useState } from 'react'
import { CheckoutPage } from '@/modules/ecommerce'

export default function CheckoutRoute() {
  const [sessionId, setSessionId] = useState<string>('')

  // Retrieve session ID
  useEffect(() => {
    const storedSessionId = localStorage.getItem('ecommerce_session_id')

    if (!storedSessionId) {
      // If no session, redirect to cart
      window.location.href = '/cart'
      return
    }

    setSessionId(storedSessionId)
  }, [])

  if (!sessionId) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return <CheckoutPage sessionId={sessionId} />
}
