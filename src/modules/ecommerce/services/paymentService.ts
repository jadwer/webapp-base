/**
 * Payment Service
 * EC-M003: Stripe PaymentIntent Integration
 *
 * Service layer for payment operations using Stripe PaymentIntent.
 * Handles API communication for payment processing, refunds, and transaction management.
 */

import axiosClient from '@/lib/axiosClient';
import type {
  EcommercePaymentTransaction,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ConfirmPaymentIntentRequest,
  ConfirmPaymentIntentResponse,
  CapturePaymentIntentRequest,
  CancelPaymentIntentRequest,
  RefundPaymentRequest,
  RefundPaymentResponse,
  PaymentProcessingResult,
  PaymentTransactionStatus,
} from '../types';
import { paymentTransactionFromAPI } from '../utils/transformers';

// ============================================
// Payment Transaction Service
// ============================================

const transactionsService = {
  /**
   * Get all payment transactions with optional filters
   */
  async getAll(filters?: {
    checkoutSessionId?: number;
    salesOrderId?: number;
    status?: PaymentTransactionStatus;
    gateway?: string;
  }): Promise<EcommercePaymentTransaction[]> {
    const params: Record<string, string | number> = {};

    if (filters?.checkoutSessionId) {
      params['filter[checkout_session_id]'] = filters.checkoutSessionId;
    }
    if (filters?.salesOrderId) {
      params['filter[sales_order_id]'] = filters.salesOrderId;
    }
    if (filters?.status) {
      params['filter[status]'] = filters.status;
    }
    if (filters?.gateway) {
      params['filter[gateway]'] = filters.gateway;
    }

    const response = await axiosClient.get<{ data: Record<string, unknown>[] }>(
      '/api/v1/payment-transactions',
      { params }
    );

    return response.data.data.map(item => paymentTransactionFromAPI(item));
  },

  /**
   * Get a single payment transaction by ID
   */
  async getById(id: string): Promise<EcommercePaymentTransaction> {
    const response = await axiosClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/payment-transactions/${id}`,
      {
        params: {
          include: 'checkoutSession,salesOrder',
        },
      }
    );

    return paymentTransactionFromAPI(response.data.data);
  },

  /**
   * Get transactions for a checkout session
   */
  async getByCheckoutSession(checkoutSessionId: number): Promise<EcommercePaymentTransaction[]> {
    return this.getAll({ checkoutSessionId });
  },

  /**
   * Get transactions for a sales order
   */
  async getBySalesOrder(salesOrderId: number): Promise<EcommercePaymentTransaction[]> {
    return this.getAll({ salesOrderId });
  },
};

// ============================================
// Stripe PaymentIntent Service
// EC-M003: PaymentIntent lifecycle management
// ============================================

const stripeService = {
  /**
   * Create a new PaymentIntent for a checkout session
   * This prepares Stripe to accept a payment
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    const payload = {
      data: {
        type: 'payment-intents',
        attributes: {
          checkoutSessionId: request.checkoutSessionId,
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
          captureMethod: request.captureMethod || 'automatic',
          metadata: request.metadata,
        },
      },
    };

    const response = await axiosClient.post<{
      data: {
        payment_intent_id: string;
        client_secret: string;
        status: string;
        amount: number;
        currency: string;
      };
    }>('/api/v1/stripe/payment-intents', payload);

    const data = response.data.data;

    return {
      paymentIntentId: data.payment_intent_id,
      clientSecret: data.client_secret,
      status: data.status as CreatePaymentIntentResponse['status'],
      amount: data.amount,
      currency: data.currency,
    };
  },

  /**
   * Retrieve an existing PaymentIntent status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<{
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    const response = await axiosClient.get<{
      data: {
        payment_intent_id: string;
        status: string;
        amount: number;
        currency: string;
      };
    }>(`/api/v1/stripe/payment-intents/${paymentIntentId}`);

    const data = response.data.data;

    return {
      paymentIntentId: data.payment_intent_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  },

  /**
   * Confirm a PaymentIntent (server-side confirmation)
   * Use this when payment method is already attached
   */
  async confirmPaymentIntent(request: ConfirmPaymentIntentRequest): Promise<ConfirmPaymentIntentResponse> {
    const payload = {
      data: {
        type: 'payment-intents',
        attributes: {
          paymentMethodId: request.paymentMethodId,
          returnUrl: request.returnUrl,
        },
      },
    };

    const response = await axiosClient.post<{
      data: {
        payment_intent_id: string;
        status: string;
        requires_action: boolean;
        next_action_url?: string;
      };
    }>(`/api/v1/stripe/payment-intents/${request.paymentIntentId}/confirm`, payload);

    const data = response.data.data;

    return {
      paymentIntentId: data.payment_intent_id,
      status: data.status as ConfirmPaymentIntentResponse['status'],
      requiresAction: data.requires_action,
      nextActionUrl: data.next_action_url,
    };
  },

  /**
   * Capture a PaymentIntent (for manual capture mode)
   * Use this after authorization to actually charge the card
   */
  async capturePaymentIntent(request: CapturePaymentIntentRequest): Promise<EcommercePaymentTransaction> {
    const payload = {
      data: {
        type: 'payment-intents',
        attributes: {
          amountToCapture: request.amountToCapture,
        },
      },
    };

    const response = await axiosClient.post<{ data: Record<string, unknown> }>(
      `/api/v1/stripe/payment-intents/${request.paymentIntentId}/capture`,
      payload
    );

    return paymentTransactionFromAPI(response.data.data);
  },

  /**
   * Cancel a PaymentIntent
   * Use this to cancel a payment that hasn't been captured
   */
  async cancelPaymentIntent(request: CancelPaymentIntentRequest): Promise<void> {
    const payload = {
      data: {
        type: 'payment-intents',
        attributes: {
          cancellationReason: request.cancellationReason,
        },
      },
    };

    await axiosClient.post(
      `/api/v1/stripe/payment-intents/${request.paymentIntentId}/cancel`,
      payload
    );
  },

  /**
   * Create a refund for a captured payment
   */
  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const payload = {
      data: {
        type: 'refunds',
        attributes: {
          paymentIntentId: request.paymentIntentId,
          amount: request.amount,
          reason: request.reason,
        },
      },
    };

    const response = await axiosClient.post<{
      data: {
        refund_id: string;
        status: string;
        amount: number;
        currency: string;
      };
    }>('/api/v1/stripe/refunds', payload);

    const data = response.data.data;

    return {
      refundId: data.refund_id,
      status: data.status as RefundPaymentResponse['status'],
      amount: data.amount,
      currency: data.currency,
    };
  },
};

// ============================================
// High-Level Payment Processing
// EC-M003: Simplified payment flow
// ============================================

const paymentProcessor = {
  /**
   * Process a payment for a checkout session
   * This is the main entry point for the checkout flow
   *
   * Flow:
   * 1. Create PaymentIntent on backend
   * 2. Return clientSecret for Stripe Elements
   * 3. Frontend uses Stripe.js to collect card details
   * 4. Frontend confirms payment with Stripe
   * 5. Webhook updates transaction status
   */
  async initiatePayment(
    checkoutSessionId: number,
    amount: number,
    currency: string = 'MXN'
  ): Promise<PaymentProcessingResult> {
    try {
      const response = await stripeService.createPaymentIntent({
        checkoutSessionId,
        amount,
        currency,
      });

      return {
        success: true,
        clientSecret: response.clientSecret,
        requiresAction: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar el pago';

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Verify payment status after Stripe Elements confirmation
   */
  async verifyPayment(paymentIntentId: string): Promise<PaymentProcessingResult> {
    try {
      const status = await stripeService.getPaymentIntent(paymentIntentId);

      const isSuccessful = status.status === 'succeeded' || status.status === 'requires_capture';

      return {
        success: isSuccessful,
        requiresAction: status.status === 'requires_action',
        error: isSuccessful ? undefined : `Estado del pago: ${status.status}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar el pago';

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Process a refund
   */
  async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentProcessingResult> {
    try {
      const response = await stripeService.refundPayment({
        paymentIntentId,
        amount,
        reason,
      });

      return {
        success: response.status === 'succeeded' || response.status === 'pending',
        error: response.status === 'failed' ? 'El reembolso falló' : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el reembolso';

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentIntentId: string): Promise<PaymentProcessingResult> {
    try {
      await stripeService.cancelPaymentIntent({
        paymentIntentId,
        cancellationReason: 'requested_by_customer',
      });

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cancelar el pago';

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

// ============================================
// Export Combined Service
// ============================================

export const paymentService = {
  transactions: transactionsService,
  stripe: stripeService,
  processor: paymentProcessor,
};
