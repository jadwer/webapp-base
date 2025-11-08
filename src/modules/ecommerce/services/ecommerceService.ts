/**
 * Ecommerce Service
 *
 * Service layer for Ecommerce module operations.
 * Handles API communication for orders and order items using JSON:API format.
 */

import axiosClient from '@/lib/axiosClient';
import type {
  EcommerceOrder,
  EcommerceOrderItem,
  EcommerceOrdersResponse,
  EcommerceOrderResponse,
  EcommerceOrderItemsResponse,
  EcommerceOrderFilters,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '../types';
import {
  ecommerceOrderFromAPI,
  ecommerceOrderToAPI,
  ecommerceOrderItemFromAPI,
  ecommerceOrderItemToAPI,
} from '../utils/transformers';

// ============================================
// Ecommerce Orders Service
// ============================================

const ordersService = {
  /**
   * Get all ecommerce orders with optional filters
   */
  async getAll(filters?: EcommerceOrderFilters): Promise<EcommerceOrder[]> {
    const params: Record<string, string | number> = {};

    if (filters?.search) {
      params['filter[search]'] = filters.search;
    }
    if (filters?.status) {
      params['filter[status]'] = filters.status;
    }
    if (filters?.paymentStatus) {
      params['filter[payment_status]'] = filters.paymentStatus;
    }
    if (filters?.shippingStatus) {
      params['filter[shipping_status]'] = filters.shippingStatus;
    }
    if (filters?.customerId) {
      params['filter[customer_id]'] = filters.customerId;
    }
    if (filters?.startDate) {
      params['filter[start_date]'] = filters.startDate;
    }
    if (filters?.endDate) {
      params['filter[end_date]'] = filters.endDate;
    }

    const response = await axiosClient.get<EcommerceOrdersResponse>(
      '/api/v1/ecommerce-orders',
      { params }
    );

    return response.data.data.map(item => ecommerceOrderFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single ecommerce order by ID
   */
  async getById(id: string): Promise<EcommerceOrder> {
    const response = await axiosClient.get<EcommerceOrderResponse>(
      `/api/v1/ecommerce-orders/${id}`,
      {
        params: {
          include: 'items,items.product,customer,paymentMethod',
        },
      }
    );

    return ecommerceOrderFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Create a new ecommerce order
   */
  async create(order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    const payload = {
      data: {
        type: 'ecommerce-orders',
        attributes: ecommerceOrderToAPI(order),
      },
    };

    const response = await axiosClient.post<EcommerceOrderResponse>(
      '/api/v1/ecommerce-orders',
      payload
    );

    return ecommerceOrderFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update an existing ecommerce order
   */
  async update(id: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    const payload = {
      data: {
        type: 'ecommerce-orders',
        id,
        attributes: ecommerceOrderToAPI(order),
      },
    };

    const response = await axiosClient.patch<EcommerceOrderResponse>(
      `/api/v1/ecommerce-orders/${id}`,
      payload
    );

    return ecommerceOrderFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update order status
   */
  async updateStatus(
    id: string,
    status: OrderStatus
  ): Promise<EcommerceOrder> {
    return this.update(id, { status });
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<EcommerceOrder> {
    return this.update(id, { paymentStatus });
  },

  /**
   * Update shipping status
   */
  async updateShippingStatus(
    id: string,
    shippingStatus: ShippingStatus
  ): Promise<EcommerceOrder> {
    return this.update(id, { shippingStatus });
  },

  /**
   * Update order totals
   */
  async updateTotals(
    id: string,
    totals: {
      subtotalAmount: number;
      taxAmount: number;
      shippingAmount?: number;
      discountAmount?: number;
      totalAmount: number;
    }
  ): Promise<EcommerceOrder> {
    return this.update(id, totals);
  },

  /**
   * Delete an ecommerce order
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/ecommerce-orders/${id}`);
  },

  /**
   * Cancel an order
   */
  async cancel(id: string, reason?: string): Promise<EcommerceOrder> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    });
  },
};

// ============================================
// Ecommerce Order Items Service
// ============================================

const itemsService = {
  /**
   * Get all order items with optional filters
   */
  async getAll(ecommerceOrderId?: number): Promise<EcommerceOrderItem[]> {
    const params: Record<string, string | number> = {};

    if (ecommerceOrderId) {
      params['filter[ecommerce_order_id]'] = ecommerceOrderId;
    }

    const response = await axiosClient.get<EcommerceOrderItemsResponse>(
      '/api/v1/ecommerce-order-items',
      { params }
    );

    return response.data.data.map(item => ecommerceOrderItemFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single order item by ID
   */
  async getById(id: string): Promise<EcommerceOrderItem> {
    const response = await axiosClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/ecommerce-order-items/${id}`,
      {
        params: {
          include: 'product',
        },
      }
    );

    return ecommerceOrderItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Create a new order item
   */
  async create(item: Partial<EcommerceOrderItem>): Promise<EcommerceOrderItem> {
    const payload = {
      data: {
        type: 'ecommerce-order-items',
        attributes: ecommerceOrderItemToAPI(item),
      },
    };

    const response = await axiosClient.post<{ data: Record<string, unknown> }>(
      '/api/v1/ecommerce-order-items',
      payload
    );

    return ecommerceOrderItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update an existing order item
   */
  async update(id: string, item: Partial<EcommerceOrderItem>): Promise<EcommerceOrderItem> {
    const payload = {
      data: {
        type: 'ecommerce-order-items',
        id,
        attributes: ecommerceOrderItemToAPI(item),
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/ecommerce-order-items/${id}`,
      payload
    );

    return ecommerceOrderItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Delete an order item
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/ecommerce-order-items/${id}`);
  },
};

// ============================================
// Export Combined Service
// ============================================

export const ecommerceService = {
  orders: ordersService,
  items: itemsService,
};
