/**
 * useShoppingCart Hooks
 *
 * SWR-based hooks for fetching and mutating shopping cart.
 */

'use client'

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { shoppingCartService } from '../services';
import type {
  ShoppingCart,
  ShoppingCartItem,
  ShoppingCartFilters,
} from '../types';

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch current shopping cart
 */
export function useCurrentCart(filters?: ShoppingCartFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    filters ? ['shopping-cart-current', filters] : 'shopping-cart-current',
    () => shoppingCartService.cart.getCurrent(filters)
  );

  return {
    cart: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a shopping cart by ID
 */
export function useShoppingCart(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `shopping-carts/${id}` : null,
    () => shoppingCartService.cart.getById(id!)
  );

  return {
    cart: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch cart items for a specific cart
 */
export function useShoppingCartItems(shoppingCartId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    shoppingCartId ? `shopping-cart-items/${shoppingCartId}` : null,
    () => shoppingCartService.items.getAll(shoppingCartId!)
  );

  return {
    cartItems: data || [],
    isLoading,
    error,
    mutate,
  };
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for shopping cart mutations
 */
export function useShoppingCartMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  /**
   * Create a new shopping cart
   */
  const createCart = async (cart: Partial<ShoppingCart>): Promise<ShoppingCart> => {
    setIsCreating(true);
    try {
      const result = await shoppingCartService.cart.create(cart);
      return result;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update cart totals
   */
  const updateCartTotals = async (
    id: string,
    totals: {
      subtotalAmount: number;
      taxAmount: number;
      totalAmount: number;
    }
  ): Promise<ShoppingCart> => {
    setIsUpdating(true);
    try {
      const result = await shoppingCartService.cart.updateTotals(id, totals);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Clear all items from cart
   */
  const clearCart = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await shoppingCartService.cart.clear(id);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Delete shopping cart
   */
  const deleteCart = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await shoppingCartService.cart.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Convert cart to order (checkout)
   */
  const checkout = async (id: string, orderData: Record<string, unknown>): Promise<Record<string, unknown>> => {
    setIsCheckingOut(true);
    try {
      const result = await shoppingCartService.cart.checkout(id, orderData);
      return result;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    createCart,
    updateCartTotals,
    clearCart,
    deleteCart,
    checkout,
    isCreating,
    isUpdating,
    isDeleting,
    isCheckingOut,
  };
}

/**
 * Hook for shopping cart item mutations
 */
export function useShoppingCartItemMutations() {
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  /**
   * Add item to cart
   */
  const addToCart = async (
    shoppingCartId: number,
    productId: number,
    quantity: number = 1
  ): Promise<ShoppingCartItem> => {
    setIsAdding(true);
    try {
      const result = await shoppingCartService.items.add(
        shoppingCartId,
        productId,
        quantity
      );
      return result;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Update cart item quantity
   */
  const updateQuantity = async (
    id: string,
    quantity: number
  ): Promise<ShoppingCartItem> => {
    setIsUpdating(true);
    try {
      const result = await shoppingCartService.items.updateQuantity(id, quantity);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update cart item
   */
  const updateCartItem = async (
    id: string,
    item: Partial<ShoppingCartItem>
  ): Promise<ShoppingCartItem> => {
    setIsUpdating(true);
    try {
      const result = await shoppingCartService.items.update(id, item);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (id: string): Promise<void> => {
    setIsRemoving(true);
    try {
      await shoppingCartService.items.remove(id);
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    addToCart,
    updateQuantity,
    updateCartItem,
    removeFromCart,
    isAdding,
    isUpdating,
    isRemoving,
  };
}

/**
 * Comprehensive shopping cart hook with all functionality
 */
export function useCart(filters?: ShoppingCartFilters) {
  const { cart, isLoading: isLoadingCart, mutate: mutateCart } = useCurrentCart(filters);
  const { cartItems, isLoading: isLoadingItems, mutate: mutateItems } = useShoppingCartItems(
    cart?.id ? parseInt(cart.id) : undefined
  );

  const cartMutations = useShoppingCartMutations();
  const itemMutations = useShoppingCartItemMutations();

  /**
   * Refresh both cart and items
   */
  const refresh = useCallback(async () => {
    await Promise.all([mutateCart(), mutateItems()]);
  }, [mutateCart, mutateItems]);

  /**
   * Add product to cart with automatic cart creation if needed
   */
  const addProduct = useCallback(
    async (productId: number, quantity: number = 1) => {
      let currentCart = cart;

      // Create cart if it doesn't exist
      if (!currentCart) {
        // Set cart expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        currentCart = await cartMutations.createCart({
          sessionId: filters?.sessionId || null,
          userId: filters?.customerId ? String(filters.customerId) : null,
          status: 'active',
          currency: 'MXN',
          expiresAt: expiresAt.toISOString(),
          totalAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          shippingAmount: 0,
        });
        await mutateCart();
      }

      // Add item to cart
      await itemMutations.addToCart(parseInt(currentCart.id), productId, quantity);

      // Refresh data
      await refresh();
    },
    [cart, filters, cartMutations, itemMutations, mutateCart, refresh]
  );

  /**
   * Update item quantity in cart
   */
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await itemMutations.updateQuantity(itemId, quantity);
      await refresh();
    },
    [itemMutations, refresh]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      await itemMutations.removeFromCart(itemId);
      await refresh();
    },
    [itemMutations, refresh]
  );

  /**
   * Clear all items
   */
  const clearAllItems = useCallback(
    async () => {
      if (cart) {
        await cartMutations.clearCart(cart.id);
        await refresh();
      }
    },
    [cart, cartMutations, refresh]
  );

  /**
   * Checkout cart
   */
  const checkoutCart = useCallback(
    async (orderData: Record<string, unknown>) => {
      if (cart) {
        const result = await cartMutations.checkout(cart.id, orderData);
        await mutateCart();
        return result;
      }
      throw new Error('No cart available');
    },
    [cart, cartMutations, mutateCart]
  );

  return {
    // Data
    cart,
    cartItems,
    isLoading: isLoadingCart || isLoadingItems,

    // Actions
    addProduct,
    updateItemQuantity,
    removeItem,
    clearAllItems,
    checkoutCart,
    refresh,

    // Loading states
    isAdding: itemMutations.isAdding,
    isUpdating: itemMutations.isUpdating || cartMutations.isUpdating,
    isRemoving: itemMutations.isRemoving,
    isCheckingOut: cartMutations.isCheckingOut,

    // Individual mutation hooks
    cartMutations,
    itemMutations,
  };
}
