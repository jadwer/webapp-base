/**
 * Shopping Cart Service
 *
 * Service layer for Shopping Cart operations.
 * Handles API communication for cart and cart items using JSON:API format.
 */

import axiosClient from '@/lib/axiosClient';
import type {
  ShoppingCart,
  ShoppingCartItem,
  ShoppingCartResponse,
  ShoppingCartItemsResponse,
  ShoppingCartFilters,
} from '../types';
import {
  shoppingCartFromAPI,
  shoppingCartItemFromAPI,
  shoppingCartItemToAPI,
} from '../utils/transformers';

// ============================================
// Shopping Cart Service
// ============================================

const cartService = {
  /**
   * Get current shopping cart (by session or customer)
   */
  async getCurrent(filters?: ShoppingCartFilters): Promise<ShoppingCart | null> {
    const params: Record<string, string | number> = {};

    if (filters?.sessionId) {
      params['filter[session_id]'] = filters.sessionId;
    }
    if (filters?.customerId) {
      params['filter[customer_id]'] = filters.customerId;
    }

    try {
      const response = await axiosClient.get<ShoppingCartResponse>(
        '/api/v1/shopping-carts/current',
        { params }
      );

      return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  /**
   * Get a shopping cart by ID
   */
  async getById(id: string): Promise<ShoppingCart> {
    const response = await axiosClient.get<ShoppingCartResponse>(
      `/api/v1/shopping-carts/${id}`,
      {
        params: {
          include: 'items,items.product',
        },
      }
    );

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Create a new shopping cart
   */
  async create(cart: Partial<ShoppingCart>): Promise<ShoppingCart> {
    // JSON:API 5.x uses camelCase for attributes, not snake_case
    const payload = {
      data: {
        type: 'shopping-carts',
        attributes: {
          sessionId: cart.sessionId,
          userId: cart.userId,
          status: cart.status,
          expiresAt: cart.expiresAt,
          totalAmount: cart.totalAmount,
          currency: cart.currency,
          couponCode: cart.couponCode,
          discountAmount: cart.discountAmount,
          taxAmount: cart.taxAmount,
          shippingAmount: cart.shippingAmount,
          notes: cart.notes,
          metadata: cart.metadata,
        },
      },
    };

    const response = await axiosClient.post<ShoppingCartResponse>(
      '/api/v1/shopping-carts',
      payload
    );

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update shopping cart totals
   */
  async updateTotals(
    id: string,
    totals: {
      subtotalAmount: number;
      taxAmount: number;
      totalAmount: number;
    }
  ): Promise<ShoppingCart> {
    const payload = {
      data: {
        type: 'shopping-carts',
        id,
        attributes: {
          subtotal_amount: totals.subtotalAmount,
          tax_amount: totals.taxAmount,
          total_amount: totals.totalAmount,
        },
      },
    };

    const response = await axiosClient.patch<ShoppingCartResponse>(
      `/api/v1/shopping-carts/${id}`,
      payload
    );

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Clear shopping cart (delete all items)
   */
  async clear(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/shopping-carts/${id}/clear`);
  },

  /**
   * Delete shopping cart
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/shopping-carts/${id}`);
  },

  /**
   * Convert cart to order
   */
  async checkout(id: string, orderData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await axiosClient.post(
      `/api/v1/shopping-carts/${id}/checkout`,
      orderData
    );

    return response.data as unknown as Record<string, unknown>;
  },
};

// ============================================
// Shopping Cart Items Service
// ============================================

const cartItemsService = {
  /**
   * Get all cart items for a specific cart
   */
  async getAll(shoppingCartId: number): Promise<ShoppingCartItem[]> {
    const params: Record<string, string | number> = {
      'filter[shopping_cart_id]': shoppingCartId,
    };

    const response = await axiosClient.get<ShoppingCartItemsResponse>(
      '/api/v1/shopping-cart-items',
      { params }
    );

    return response.data.data.map(item => shoppingCartItemFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single cart item by ID
   */
  async getById(id: string): Promise<ShoppingCartItem> {
    const response = await axiosClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/shopping-cart-items/${id}`,
      {
        params: {
          include: 'product',
        },
      }
    );

    return shoppingCartItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Add item to cart
   */
  async add(
    shoppingCartId: number,
    productId: number,
    quantity: number = 1
  ): Promise<ShoppingCartItem> {
    const payload = {
      data: {
        type: 'shopping-cart-items',
        attributes: {
          shopping_cart_id: shoppingCartId,
          product_id: productId,
          quantity,
        },
      },
    };

    const response = await axiosClient.post<{ data: Record<string, unknown> }>(
      '/api/v1/shopping-cart-items',
      payload
    );

    return shoppingCartItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(id: string, quantity: number): Promise<ShoppingCartItem> {
    const payload = {
      data: {
        type: 'shopping-cart-items',
        id,
        attributes: {
          quantity,
        },
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/shopping-cart-items/${id}`,
      payload
    );

    return shoppingCartItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Update cart item
   */
  async update(id: string, item: Partial<ShoppingCartItem>): Promise<ShoppingCartItem> {
    const payload = {
      data: {
        type: 'shopping-cart-items',
        id,
        attributes: shoppingCartItemToAPI(item),
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/shopping-cart-items/${id}`,
      payload
    );

    return shoppingCartItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Remove item from cart
   */
  async remove(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/shopping-cart-items/${id}`);
  },
};

// ============================================
// Export Combined Service
// ============================================

export const shoppingCartService = {
  cart: cartService,
  items: cartItemsService,
};
