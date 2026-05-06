/**
 * Checkout Sessions Service
 *
 * Service layer for checkout session operations.
 */

import axiosClient from '@/lib/axiosClient';

export interface CheckoutSession {
  id: string;
  shoppingCartId: number;
  contactId: number | null;
  status: 'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled';
  shippingAddressId: number | null;
  billingAddressId: number | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  salesOrderId: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateCheckoutSessionRequest {
  shoppingCartId: number;
  shippingAddressId?: number;
  billingAddressId?: number;
}

export interface UpdateCheckoutSessionRequest {
  shippingMethod?: string;
  shippingAmount?: number;
  shippingAddressId?: number;
  billingAddressId?: number;
}

interface JsonApiCheckoutSession {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

export const checkoutSessionsService = {
  /**
   * Create a new checkout session
   */
  async create(data: CreateCheckoutSessionRequest): Promise<CheckoutSession> {
    const response = await axiosClient.post('/api/v1/checkout-sessions', {
      data: {
        type: 'checkout-sessions',
        attributes: {
          shoppingCartId: data.shoppingCartId,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId
        }
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Get checkout session by ID
   */
  async getById(id: string): Promise<CheckoutSession> {
    const response = await axiosClient.get(`/api/v1/checkout-sessions/${id}`, {
      params: { include: 'shoppingCart,shippingAddress,billingAddress' }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Update checkout session
   */
  async update(id: string, data: UpdateCheckoutSessionRequest): Promise<CheckoutSession> {
    const response = await axiosClient.patch(`/api/v1/checkout-sessions/${id}`, {
      data: {
        type: 'checkout-sessions',
        id,
        attributes: {
          shippingMethod: data.shippingMethod,
          shippingAmount: data.shippingAmount,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId
        }
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Transform API response to CheckoutSession
   */
  transformFromAPI(item: JsonApiCheckoutSession): CheckoutSession {
    const attrs = item.attributes;
    return {
      id: item.id,
      shoppingCartId: (attrs.shoppingCartId || attrs.shopping_cart_id) as number,
      contactId: (attrs.contactId || attrs.contact_id) as number | null,
      status: attrs.status as CheckoutSession['status'],
      shippingAddressId: (attrs.shippingAddressId || attrs.shipping_address_id) as number | null,
      billingAddressId: (attrs.billingAddressId || attrs.billing_address_id) as number | null,
      subtotal: attrs.subtotal as number,
      shippingAmount: (attrs.shippingAmount || attrs.shipping_amount || 0) as number,
      taxAmount: (attrs.taxAmount || attrs.tax_amount || 0) as number,
      discountAmount: (attrs.discountAmount || attrs.discount_amount || 0) as number,
      total: attrs.total as number,
      paymentMethod: (attrs.paymentMethod || attrs.payment_method) as string | null,
      paymentIntentId: (attrs.paymentIntentId || attrs.payment_intent_id) as string | null,
      salesOrderId: (attrs.salesOrderId || attrs.sales_order_id) as number | null,
      completedAt: (attrs.completedAt || attrs.completed_at) as string | null,
      createdAt: (attrs.createdAt || attrs.created_at) as string
    };
  }
};
