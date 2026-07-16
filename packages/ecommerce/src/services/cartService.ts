/**
 * Shopping Cart Service
 *
 * Service layer for Shopping Cart operations.
 * Handles API communication for cart and cart items using JSON:API format.
 */

import { axiosClient } from '@lwm/auth';
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

    const response = await axiosClient.get<ShoppingCartResponse>(
      '/api/v1/shopping-carts/current',
      { params }
    );

    // Backend returns 200 with data: null when no active cart exists
    if (!response.data.data) {
      return null;
    }

    return shoppingCartFromAPI(response.data.data as unknown as Record<string, unknown>);
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
   *
   * @param taxRate - Tax rate as percentage (e.g. 16 for 16% IVA). Defaults to 16.
   *                  The backend CartItemObserver may recalculate if currency conversion applies.
   */
  async add(
    shoppingCartId: number,
    productId: number,
    quantity: number = 1,
    unitPrice: number = 0,
    taxRate: number = 16
  ): Promise<ShoppingCartItem> {
    const subtotal = parseFloat((unitPrice * quantity).toFixed(2));
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
  iva?: boolean;
  taxRate?: number;
  sku?: string | null;
  imageUrl?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  unitName?: string | null;
}

/**
 * Extract an HTTP status code from an axios-style error, if present.
 */
function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

/**
 * Thrown when syncing the local cart to the API fails because the session is
 * no longer valid (401/403). Callers should prompt the user to log in again.
 */
export class CartSyncAuthError extends Error {
  readonly isAuthError = true;

  constructor(message = 'Tu sesion expiro. Inicia sesion de nuevo para continuar.') {
    super(message);
    this.name = 'CartSyncAuthError';
  }
}

/**
 * Thrown when syncing the local cart to the API fails for a non-auth reason
 * (invalid product, network, server error). The local cart is preserved.
 */
export class CartSyncError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'CartSyncError';
    this.status = status;
  }
}

const localCartSyncService = {
  /**
   * Sync local cart (localStorage) to API cart
   * Creates a new cart in the API and adds all items from localStorage
   * Returns the created cart ID for use in checkout
   *
   * Robustness: the server cart is only cleared AFTER the local items have
   * been staged successfully. If an item fails to add, the previous server
   * cart is left untouched so the user never ends up with an empty cart at
   * checkout. Auth failures (401/403) are surfaced as CartSyncAuthError so the
   * caller can prompt for re-login instead of showing a generic error.
   */
  async syncLocalCartToAPI(localItems: LocalCartItem[]): Promise<ShoppingCart> {
    // 1. Get or create cart in API
    const cart = await cartService.getOrCreate();
    const cartId = parseInt(cart.id);

    // 2. Add all local items FIRST. Do NOT clear the existing server cart yet:
    // if any add fails (auth expired, invalid product, network), the previous
    // cart state is preserved and checkout will not show an empty cart.
    const addedItemIds: string[] = [];
    try {
      for (const item of localItems) {
        const added = await cartItemsService.add(
          cartId,
          parseInt(item.productId),
          item.quantity,
          item.price,
          item.taxRate ?? (item.iva === false ? 0 : 16)
        );
        if (added?.id) {
          addedItemIds.push(String(added.id));
        }
      }
    } catch (error) {
      // Roll back the items we just added so we do not leave a half-synced
      // cart mixed with the previous contents. Best-effort: ignore cleanup errors.
      for (const itemId of addedItemIds) {
        try {
          await cartItemsService.remove(itemId);
        } catch {
          // ignore cleanup failures; the important part is not reporting success
        }
      }

      const status = getErrorStatus(error);
      if (status === 401 || status === 403) {
        throw new CartSyncAuthError();
      }
      throw new CartSyncError(
        'No se pudieron agregar todos los productos al carrito. Intenta de nuevo.',
        status
      );
    }

    // 3. Remove any pre-existing items from the server cart (a stale cart from a
    // previous session). We identify the just-added items and delete the rest so
    // the synced cart contains exactly the local items.
    try {
      const allItems = await cartItemsService.getAll(cartId);
      const staleItems = allItems.filter(
        (existing) => existing.id && !addedItemIds.includes(String(existing.id))
      );
      for (const stale of staleItems) {
        try {
          await cartItemsService.remove(String(stale.id));
        } catch {
          // ignore individual cleanup failures; the freshly added items are intact
        }
      }
    } catch {
      // If we cannot enumerate/clean stale items, proceed anyway: the local
      // items were added successfully, which is what checkout needs.
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
      localStorage.removeItem('app_cart');
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
