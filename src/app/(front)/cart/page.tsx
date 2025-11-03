/**
 * Shopping Cart Page
 *
 * Public page for viewing and managing shopping cart.
 * Route: /cart
 */

'use client'

import { useEffect, useState } from 'react'
import { CartPage } from '@/modules/ecommerce'

export default function ShoppingCartRoute() {
  const [sessionId, setSessionId] = useState<string>('')

  // Generate or retrieve session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('ecommerce_session_id')

    if (!storedSessionId) {
      // Generate new session ID
      storedSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('ecommerce_session_id', storedSessionId)
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

  return <CartPage sessionId={sessionId} />
}
