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
          include: 'cartItems,cartItems.product',
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
    // Transform camelCase frontend fields to snake_case backend format
    const payload: Record<string, unknown> = {
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      shipping_address_line1: orderData.shippingAddressLine1,
      shipping_address_line2: orderData.shippingAddressLine2,
      shipping_city: orderData.shippingCity,
      shipping_state: orderData.shippingState,
      shipping_postal_code: orderData.shippingPostalCode,
      shipping_country: orderData.shippingCountry,
      payment_intent_id: orderData.paymentIntentId,
    };

    // If billing address is different from shipping
    if (orderData.billingAddressLine1) {
      payload.billing_address = {
        line1: orderData.billingAddressLine1,
        line2: orderData.billingAddressLine2,
        city: orderData.billingCity,
        state: orderData.billingState,
        postal_code: orderData.billingPostalCode,
        country: orderData.billingCountry || 'Mexico',
      };
    }

    // Pass contact_id if provided
    if (orderData.contactId) {
      payload.contact_id = orderData.contactId;
    }

    const response = await axiosClient.post(
      `/api/v1/shopping-carts/${id}/checkout`,
      payload
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
      'include': 'product',
    };

    const response = await axiosClient.get<ShoppingCartItemsResponse & { included?: Record<string, unknown>[] }>(
      '/api/v1/cart-items',
      { params }
    );

    // Build a map of included products by id
    const productMap = new Map<string, Record<string, unknown>>();
    if (response.data.included) {
      for (const inc of response.data.included) {
        if (inc.type === 'products' && inc.id) {
          productMap.set(String(inc.id), inc);
        }
      }
    }

    return response.data.data.map(item => {
      const cartItem = shoppingCartItemFromAPI(item as unknown as Record<string, unknown>);

      // Enrich with product data from included resources
      const productData = productMap.get(String(cartItem.productId));
      if (productData) {
        const attrs = (productData.attributes || {}) as Record<string, unknown>;
        cartItem.productName = (attrs.name as string) || cartItem.productName;
        cartItem.productSku = (attrs.sku as string) || cartItem.productSku;
        cartItem.productImage = (attrs.imgUrl as string) || cartItem.productImage;
      }

      return cartItem;
    });
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
    quantity: number = 1,
    unitPrice: number = 0
  ): Promise<ShoppingCartItem> {
    const subtotal = parseFloat((unitPrice * quantity).toFixed(2));
    const taxRate = 16;
    const taxAmount = parseFloat((subtotal * taxRate / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    const payload = {
      data: {
        type: 'cart-items',
        attributes: {
          quantity,
          unitPrice,
          originalPrice: unitPrice,
          discountPercent: 0,
          discountAmount: 0,
          subtotal,
          taxRate,
          taxAmount,
          total,
        },
        relationships: {
          shoppingCart: {
            data: { type: 'shopping-carts', id: String(shoppingCartId) },
          },
          product: {
            data: { type: 'products', id: String(productId) },
          },
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
        item.quantity,
        item.price
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
