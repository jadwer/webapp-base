'use client'

/**
 * LOCAL CART PAGE CONTROLLER (headless)
 *
 * Motor de la pagina de carrito: items/totales del carrito local, modal de
 * cotizacion (con login diferido via /cart?action=quote), generacion de
 * cotizacion (sync a API + POST /quotes/from-cart) y paso a checkout (sync
 * + redireccion), incluyendo el auto-proceso de action=quote/checkout al
 * volver del login.
 *
 * Extraido de LocalCartPage (rediseno 2026-08) con el mismo criterio
 * motor/piel del catalogo: el LocalCartPage clasico lo consume tal cual y
 * las pieles por tenant construyen su presentacion encima. Es el camino del
 * dinero: la logica vive UNA sola vez.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocalCart } from './useLocalCart'
import { useAuth } from '@lwm/auth'
import { toast } from '@lwm/ui'
import { quoteServices as quoteServiceModule } from '@lwm/sales'
// Auto-import del package (mismo patron que el LocalCartPage original):
// permite a los tests mockear '@lwm/ecommerce' completo.
import { shoppingCartService, CartSyncAuthError } from '@lwm/ecommerce'

export interface LocalCartPageControllerOptions {
  checkoutUrl?: string
  onCheckout?: () => void
}

export function useLocalCartPageController({
  checkoutUrl = '/checkout',
  onCheckout,
}: LocalCartPageControllerOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isRequestingQuote, setIsRequestingQuote] = useState(false)
  const [isSyncingToCheckout, setIsSyncingToCheckout] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteNote, setQuoteNote] = useState('')
  const hasProcessedPendingQuote = useRef(false)
  const hasProcessedCheckout = useRef(false)

  const cart = useLocalCart()
  const { items, isInitialized, clearCart } = cart

  // Reabrir el modal de cotizacion al volver del login (action=quote)
  useEffect(() => {
    const action = searchParams.get('action')
    if (
      action === 'quote' &&
      isAuthenticated &&
      !authLoading &&
      isInitialized &&
      items.length > 0 &&
      !hasProcessedPendingQuote.current &&
      !isRequestingQuote
    ) {
      hasProcessedPendingQuote.current = true
      const timer = setTimeout(() => {
        setShowQuoteModal(true)
        router.replace('/cart')
      }, 500)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, authLoading, isInitialized, items.length, isRequestingQuote])

  const handleOpenQuoteModal = useCallback(() => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingQuoteCart', JSON.stringify(items))
      toast.info('Inicia sesión para generar una cotización')
      router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=quote'))
      return
    }
    setShowQuoteModal(true)
  }, [items, isAuthenticated, router])

  // POST /quotes/from-cart (sync previo del carrito local a la API)
  const handleRequestQuote = useCallback(async () => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingQuoteCart', JSON.stringify(items))
      toast.info('Inicia sesión para generar una cotización')
      router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=quote'))
      return
    }

    setIsRequestingQuote(true)
    try {
      const apiCart = await shoppingCartService.localSync.syncLocalCartToAPI(items)
      const response = await quoteServiceModule.quotes.createFromCart({
        shopping_cart_id: parseInt(apiCart.id),
        notes: quoteNote.trim() || undefined
      })
      clearCart()
      setShowQuoteModal(false)
      setQuoteNote('')
      toast.success('Cotizacion generada')
      router.push(`/dashboard/my-quotes/${response.data.id}`)
    } catch (error) {
      console.error('Error requesting quote:', error)
      toast.error('Error al procesar la solicitud de cotización')
    } finally {
      setIsRequestingQuote(false)
    }
  }, [items, isAuthenticated, quoteNote, clearCart, router])

  const handleProceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }
    setIsSyncingToCheckout(true)
    try {
      if (!isAuthenticated) {
        toast.info('Inicia sesion para proceder al pago')
        router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=checkout'))
        return
      }
      toast.info('Preparando tu carrito...')
      const apiCart = await shoppingCartService.localSync.syncLocalCartToAPI(items)
      shoppingCartService.localSync.saveCartIdForCheckout(apiCart.id)
      toast.success('Carrito listo!')
      // NO limpiar el carrito local aqui: se limpia al confirmar la orden.
      if (onCheckout) onCheckout()
      else router.push(checkoutUrl)
    } catch (error) {
      if (error instanceof CartSyncAuthError) {
        toast.error('Tu sesion expiro. Inicia sesion de nuevo para continuar.')
        router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=checkout'))
        return
      }
      toast.error('Error al preparar el carrito. Por favor intenta de nuevo.')
      setIsSyncingToCheckout(false)
    }
  }, [items, isAuthenticated, onCheckout, checkoutUrl, router])

  // Auto-checkout al volver del login (action=checkout)
  useEffect(() => {
    const action = searchParams.get('action')
    if (
      action === 'checkout' &&
      isAuthenticated &&
      !authLoading &&
      isInitialized &&
      items.length > 0 &&
      !hasProcessedCheckout.current &&
      !isSyncingToCheckout
    ) {
      hasProcessedCheckout.current = true
      router.replace('/cart')
      handleProceedToCheckout()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, authLoading, isInitialized, items.length])

  return {
    // Carrito local completo (items, totals, updateQuantity, removeFromCart...)
    ...cart,
    // Sesion
    isAuthenticated,
    authLoading,
    // Estado del flujo
    isRequestingQuote,
    isSyncingToCheckout,
    showQuoteModal,
    setShowQuoteModal,
    quoteNote,
    setQuoteNote,
    // Acciones
    handleOpenQuoteModal,
    handleRequestQuote,
    handleProceedToCheckout,
  }
}

export type LocalCartPageController = ReturnType<typeof useLocalCartPageController>
