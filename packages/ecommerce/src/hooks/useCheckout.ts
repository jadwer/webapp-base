/**
 * useCheckout Hooks
 *
 * SWR-based hooks for checkout session management.
 */

'use client'

import useSWR from 'swr'
import { useState, useCallback } from 'react'
import { checkoutSessionsService, CheckoutSession, CreateCheckoutSessionRequest, UpdateCheckoutSessionRequest } from '../services/checkoutSessionsService'

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch a checkout session
 */
export function useCheckoutSession(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<CheckoutSession>(
    id ? `checkout-sessions/${id}` : null,
    () => checkoutSessionsService.getById(id!)
  )

  return {
    session: data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for checkout session mutations
 */
export function useCheckoutMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const createSession = useCallback(async (data: CreateCheckoutSessionRequest) => {
    setIsCreating(true)
    try {
      const result = await checkoutSessionsService.create(data)
      return result
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateSession = useCallback(async (id: string, data: UpdateCheckoutSessionRequest) => {
    setIsUpdating(true)
    try {
      const result = await checkoutSessionsService.update(id, data)
      return result
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return {
    createSession,
    updateSession,
    isCreating,
    isUpdating,
    isProcessing: isCreating || isUpdating,
  }
}

// ============================================
// Checkout Flow Hook
// ============================================

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

/**
 * Comprehensive checkout flow hook
 */
export function useCheckoutFlow(cartId?: number) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { session, isLoading: isLoadingSession, mutate: mutateSession } = useCheckoutSession(sessionId || undefined)
  const mutations = useCheckoutMutations()

  const startCheckout = useCallback(async (shippingAddressId?: number) => {
    if (!cartId) {
      setError('No cart available')
      return null
    }

    setError(null)
    try {
      const newSession = await mutations.createSession({
        shoppingCartId: cartId,
        shippingAddressId,
      })
      setSessionId(newSession.id)
      setCurrentStep('payment')
      return newSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      return null
    }
  }, [cartId, mutations])

  const updateShippingAddress = useCallback(async (shippingAddressId: number) => {
    if (!sessionId) {
      setError('No checkout session')
      return null
    }

    setError(null)
    try {
      const updated = await mutations.updateSession(sessionId, { shippingAddressId })
      await mutateSession()
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shipping')
      return null
    }
  }, [sessionId, mutations, mutateSession])

  const updateBillingAddress = useCallback(async (billingAddressId: number) => {
    if (!sessionId) {
      setError('No checkout session')
      return null
    }

    setError(null)
    try {
      const updated = await mutations.updateSession(sessionId, { billingAddressId })
      await mutateSession()
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update billing')
      return null
    }
  }, [sessionId, mutations, mutateSession])

  const setShippingMethod = useCallback(async (shippingMethod: string, shippingAmount: number) => {
    if (!sessionId) {
      setError('No checkout session')
      return null
    }

    setError(null)
    try {
      const updated = await mutations.updateSession(sessionId, { shippingMethod, shippingAmount })
      await mutateSession()
      setCurrentStep('review')
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set shipping method')
      return null
    }
  }, [sessionId, mutations, mutateSession])

  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step)
  }, [])

  const resetCheckout = useCallback(() => {
    setSessionId(null)
    setCurrentStep('shipping')
    setError(null)
  }, [])

  return {
    // Session data
    session,
    sessionId,
    isLoadingSession,

    // Flow state
    currentStep,
    error,

    // Actions
    startCheckout,
    updateShippingAddress,
    updateBillingAddress,
    setShippingMethod,
    goToStep,
    resetCheckout,

    // Loading states
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isProcessing: mutations.isProcessing,
  }
}
