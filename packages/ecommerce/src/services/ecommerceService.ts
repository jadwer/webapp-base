/**
 * Ecommerce Service
 *
 * Service layer for Ecommerce module operations.
 * Handles API communication for orders and order items using JSON:API format.
 */

import { axiosClient } from '@lwm/auth';
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
   * Uses sales-orders endpoint with orderType=ecommerce filter
   */
  async getAll(filters?: EcommerceOrderFilters): Promise<EcommerceOrder[]> {
    const params: Record<string, string | number> = {};

    // Note: filter[order_type] removed - not supported by backend
    // All sales-orders will be returned until backend implements this filter

    if (filters?.search) {
      params['filter[search]'] = filters.search;
    }
    if (filters?.status) {
      params['filter[status]'] = filters.status;
    }
    if (filters?.paymentStatus) {
      // Paquete A: filter[payment_status] ya existe en el SalesOrderSchema
      // (columna real escrita por los listeners del webhook Stripe).
      params['filter[payment_status]'] = filters.paymentStatus;
    }
    // Paquete A: se retiran shipping_status (no existe la columna; el eje de
    // envio vive en el status de la orden), y start_date/end_date (el backend
    // no declara rangos de fecha). Mandarlos daba 400 en el listado.
    if (filters?.customerId) {
      // La clave declarada por el backend es 'contact' (Where::make('contact',
      // 'contact_id')); customer_id no existia y daba 400.
      params['filter[contact]'] = filters.customerId;
    }

    // Default: lo mas reciente primero (pedido de Gabino 2026-07-19). Sin sort
    // el backend devuelve id ascendente y el listado abria en lo mas viejo.
    params['sort'] = '-createdAt';

    const response = await axiosClient.get<EcommerceOrdersResponse>(
      '/api/v1/sales-orders',
      { params }
    );

    return response.data.data.map(item => ecommerceOrderFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single ecommerce order by ID
   * Uses sales-orders endpoint
   */
  async getById(id: string): Promise<EcommerceOrder> {
    const response = await axiosClient.get<EcommerceOrderResponse>(
      `/api/v1/sales-orders/${id}`,
      {
        params: {
          include: 'items,items.product,customer',
        },
      }
    );

    return ecommerceOrderFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Create a new ecommerce order
   * Uses sales-orders endpoint with orderType=ecommerce
   */
  async create(order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    const payload = {
      data: {
        type: 'sales-orders',
        attributes: {
          ...ecommerceOrderToAPI(order),
          order_type: 'ecommerce',
        },
      },
    };

    const response = await axiosClient.post<EcommerceOrderResponse>(
      '/api/v1/sales-orders',
      payload
    );

    return ecommerceOrderFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update an existing ecommerce order
   * Uses sales-orders endpoint
   */
  async update(id: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    const payload = {
      data: {
        type: 'sales-orders',
        id,
        attributes: ecommerceOrderToAPI(order),
      },
    };

    const response = await axiosClient.patch<EcommerceOrderResponse>(
      `/api/v1/sales-orders/${id}`,
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
   * Uses sales-orders endpoint
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/sales-orders/${id}`);
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
   * Uses sales-order-items endpoint
   */
  async getAll(salesOrderId?: number): Promise<EcommerceOrderItem[]> {
    const params: Record<string, string | number> = {};

    if (salesOrderId) {
      params['filter[sales_order_id]'] = salesOrderId;
    }

    const response = await axiosClient.get<EcommerceOrderItemsResponse>(
      '/api/v1/sales-order-items',
      { params }
    );

    return response.data.data.map(item => ecommerceOrderItemFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single order item by ID
   * Uses sales-order-items endpoint
   */
  async getById(id: string): Promise<EcommerceOrderItem> {
    const response = await axiosClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/sales-order-items/${id}`,
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
   * Uses sales-order-items endpoint
   */
  async create(item: Partial<EcommerceOrderItem>): Promise<EcommerceOrderItem> {
    const payload = {
      data: {
        type: 'sales-order-items',
        attributes: ecommerceOrderItemToAPI(item),
      },
    };

    const response = await axiosClient.post<{ data: Record<string, unknown> }>(
      '/api/v1/sales-order-items',
      payload
    );

    return ecommerceOrderItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update an existing order item
   * Uses sales-order-items endpoint
   */
  async update(id: string, item: Partial<EcommerceOrderItem>): Promise<EcommerceOrderItem> {
    const payload = {
      data: {
        type: 'sales-order-items',
        id,
        attributes: ecommerceOrderItemToAPI(item),
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/sales-order-items/${id}`,
      payload
    );

    return ecommerceOrderItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Delete an order item
   * Uses sales-order-items endpoint
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/sales-order-items/${id}`);
  },
};

// ============================================
// Export Combined Service
// ============================================

export const ecommerceService = {
  orders: ordersService,
  items: itemsService,
};
