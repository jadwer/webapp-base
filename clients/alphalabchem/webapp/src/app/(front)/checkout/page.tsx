/**
 * Checkout Page
 *
 * Public page for checkout process.
 * Route: /checkout
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutPage } from '@/modules/ecommerce'
import { useAuth } from '@/modules/auth'

export default function CheckoutRoute() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [cartId, setCartId] = useState<string>('')
  const [isChecking, setIsChecking] = useState(true)

  // Retrieve cart ID and verify auth
  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return

    // User must be authenticated to checkout
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    const storedCartId = localStorage.getItem('ecommerce_session_id')

    if (!storedCartId) {
      // If no cart, redirect to cart page
      router.push('/cart')
      return
    }

    setCartId(storedCartId)
    setIsChecking(false)
  }, [isAuthenticated, authLoading, router])

  if (isChecking || authLoading || !cartId) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Preparando checkout...</p>
        </div>
      </div>
    )
  }

  return <CheckoutPage cartId={cartId} />
}
