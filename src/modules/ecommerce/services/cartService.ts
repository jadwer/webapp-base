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
   * Get or create shopping cart
   */
  async getOrCreate(): Promise<ShoppingCart> {
    const response = await axiosClient.post<ShoppingCartResponse>(
      '/api/v1/shopping-carts/get-or-create'
    );

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Merge guest cart after login
   */
  async merge(guestSessionId: string): Promise<ShoppingCart> {
    const response = await axiosClient.post<ShoppingCartResponse>(
      '/api/v1/shopping-carts/merge',
      { guest_session_id: guestSessionId }
    );

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Get current shopping cart (by session or customer)
   */
  async getCurrent(filters?: ShoppingCartFilters): Promise<ShoppingCart | null> {
    const params: Record<string, string | number> = {};

    // Backend controller reads 'session_id' directly (not as JSON:API filter)
    // customer_id is not needed: backend uses Auth::id() for authenticated users
    if (filters?.sessionId) {
      params['session_id'] = filters.sessionId;
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
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
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
      '/api/v1/cart-items',
      { params }
    );

    return response.data.data.map(item => shoppingCartItemFromAPI(item as unknown as Record<string, unknown>));
  },

  /**
   * Get a single cart item by ID
   */
  async getById(id: string): Promise<ShoppingCartItem> {
    const response = await axiosClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/cart-items/${id}`,
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
        type: 'cart-items',
        attributes: {
          shopping_cart_id: shoppingCartId,
          product_id: productId,
          quantity,
        },
      },
    };

    const response = await axiosClient.post<{ data: Record<string, unknown> }>(
      '/api/v1/cart-items',
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
        type: 'cart-items',
        id,
        attributes: {
          quantity,
        },
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/cart-items/${id}`,
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
        type: 'cart-items',
        id,
        attributes: shoppingCartItemToAPI(item),
      },
    };

    const response = await axiosClient.patch<{ data: Record<string, unknown> }>(
      `/api/v1/cart-items/${id}`,
      payload
    );

    return shoppingCartItemFromAPI(response.data.data as unknown as Record<string, unknown>);
  },

  /**
   * Remove item from cart
   */
  async remove(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/cart-items/${id}`);
  },
};

// ============================================
// Local Cart Sync Service
// ============================================

interface LocalCartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  sku?: string | null;
  imageUrl?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  unitName?: string | null;
}

const localCartSyncService = {
  /**
   * Sync local cart (localStorage) to API cart
   * Creates a new cart in the API and adds all items from localStorage
   * Returns the created cart ID for use in checkout
   */
  async syncLocalCartToAPI(localItems: LocalCartItem[]): Promise<ShoppingCart> {
    // 1. Get or create cart in API
    const cart = await cartService.getOrCreate();

    // 2. Clear existing items (in case there are any)
    try {
      await cartService.clear(cart.id);
    } catch {
      // Cart might be empty, ignore error
    }

    // 3. Add all local items to the API cart
    for (const item of localItems) {
      await cartItemsService.add(
        parseInt(cart.id),
        parseInt(item.productId),
        item.quantity
      );
    }

    // 4. Get updated cart with items
    const updatedCart = await cartService.getById(cart.id);

    return updatedCart;
  },

  /**
   * Clear local cart from localStorage
   */
  clearLocalCart(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('laborwasser_cart');
    }
  },

  /**
   * Save cart ID to localStorage for checkout
   */
  saveCartIdForCheckout(cartId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecommerce_session_id', cartId);
    }
  },

  /**
   * Get cart ID from localStorage
   */
  getCartIdForCheckout(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecommerce_session_id');
    }
    return null;
  },

  /**
   * Clear cart ID from localStorage
   */
  clearCartIdForCheckout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecommerce_session_id');
    }
  },
};

// ============================================
// Export Combined Service
// ============================================

export const shoppingCartService = {
  cart: cartService,
  items: cartItemsService,
  localSync: localCartSyncService,
};
