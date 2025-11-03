/**
 * useShoppingCart Hooks Tests
 *
 * Unit tests for shopping cart hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useCurrentCart,
  useShoppingCart,
  useShoppingCartItems,
  useShoppingCartMutations,
  useShoppingCartItemMutations,
  useCart,
} from '../../hooks/useShoppingCart';
import { shoppingCartService } from '../../services';
import {
  createMockShoppingCart,
  createMockShoppingCartItem,
} from '../utils/test-utils';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: null,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  })),
}));

// Mock shopping cart service
vi.mock('../../services', () => ({
  shoppingCartService: {
    cart: {
      getCurrent: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      updateTotals: vi.fn(),
      clear: vi.fn(),
      delete: vi.fn(),
      checkout: vi.fn(),
    },
    items: {
      getAll: vi.fn(),
      add: vi.fn(),
      updateQuantity: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

describe('useShoppingCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCurrentCart', () => {
    it('should return current cart data structure', () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      vi.mocked(shoppingCartService.cart.getCurrent).mockResolvedValue(mockCart);

      // Act
      const { result } = renderHook(() =>
        useCurrentCart({ sessionId: 'sess_123' })
      );

      // Assert
      expect(result.current).toHaveProperty('cart');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

  });

  describe('useShoppingCart', () => {
    it('should return cart by ID data structure', () => {
      // Arrange
      const mockCart = createMockShoppingCart({ id: '1' });
      vi.mocked(shoppingCartService.cart.getById).mockResolvedValue(mockCart);

      // Act
      const { result } = renderHook(() => useShoppingCart('1'));

      // Assert
      expect(result.current).toHaveProperty('cart');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

  });

  describe('useShoppingCartItems', () => {
    it('should return cart items data structure', () => {
      // Arrange
      const mockItems = [
        createMockShoppingCartItem({ id: '1' }),
        createMockShoppingCartItem({ id: '2' }),
      ];
      vi.mocked(shoppingCartService.items.getAll).mockResolvedValue(mockItems);

      // Act
      const { result } = renderHook(() => useShoppingCartItems(1));

      // Assert
      expect(result.current).toHaveProperty('cartItems');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(Array.isArray(result.current.cartItems)).toBe(true);
    });

    it('should not fetch when cart ID is not provided', () => {
      // Act
      const { result } = renderHook(() => useShoppingCartItems());

      // Assert
      expect(result.current.cartItems).toEqual([]);
      expect(shoppingCartService.items.getAll).not.toHaveBeenCalled();
    });
  });

  describe('useShoppingCartMutations', () => {
    it('should provide createCart function', async () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      vi.mocked(shoppingCartService.cart.create).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      const cart = await result.current.createCart({
        sessionId: 'sess_123',
        subtotalAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
      });

      // Assert
      expect(shoppingCartService.cart.create).toHaveBeenCalled();
      expect(cart).toEqual(mockCart);
    });

    it('should provide updateCartTotals function', async () => {
      // Arrange
      const mockCart = createMockShoppingCart({ totalAmount: 1500.0 });
      vi.mocked(shoppingCartService.cart.updateTotals).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      const totals = {
        subtotalAmount: 1400.0,
        taxAmount: 100.0,
        totalAmount: 1500.0,
      };
      const cart = await result.current.updateCartTotals('1', totals);

      // Assert
      expect(shoppingCartService.cart.updateTotals).toHaveBeenCalledWith(
        '1',
        totals
      );
      expect(cart.totalAmount).toBe(1500.0);
    });

    it('should provide clearCart function', async () => {
      // Arrange
      vi.mocked(shoppingCartService.cart.clear).mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      await result.current.clearCart('1');

      // Assert
      expect(shoppingCartService.cart.clear).toHaveBeenCalledWith('1');
    });

    it('should provide deleteCart function', async () => {
      // Arrange
      vi.mocked(shoppingCartService.cart.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      await result.current.deleteCart('1');

      // Assert
      expect(shoppingCartService.cart.delete).toHaveBeenCalledWith('1');
    });

    it('should provide checkout function', async () => {
      // Arrange
      const mockOrderResponse = { data: { id: '1', orderNumber: 'ECO-2025-001' } };
      vi.mocked(shoppingCartService.cart.checkout).mockResolvedValue(
        mockOrderResponse
      );

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      const orderData = {
        customerEmail: 'customer@example.com',
        shippingAddress: '123 Main St',
      };
      const order = await result.current.checkout('1', orderData);

      // Assert
      expect(shoppingCartService.cart.checkout).toHaveBeenCalledWith('1', orderData);
      expect(order).toEqual(mockOrderResponse);
    });

    it('should track loading states', async () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      vi.mocked(shoppingCartService.cart.create).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useShoppingCartMutations());

      // Act
      await result.current.createCart({ sessionId: 'sess_123' });

      // Assert
      expect(result.current.isCreating).toBe(false); // False after completion
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isCheckingOut).toBe(false);
    });
  });

  describe('useShoppingCartItemMutations', () => {
    it('should provide addToCart function', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem();
      vi.mocked(shoppingCartService.items.add).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useShoppingCartItemMutations());

      // Act
      const item = await result.current.addToCart(1, 5, 2);

      // Assert
      expect(shoppingCartService.items.add).toHaveBeenCalledWith(1, 5, 2);
      expect(item).toEqual(mockItem);
    });

    it('should provide updateQuantity function', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem({ quantity: 5 });
      vi.mocked(shoppingCartService.items.updateQuantity).mockResolvedValue(
        mockItem
      );

      const { result } = renderHook(() => useShoppingCartItemMutations());

      // Act
      const item = await result.current.updateQuantity('1', 5);

      // Assert
      expect(shoppingCartService.items.updateQuantity).toHaveBeenCalledWith('1', 5);
      expect(item.quantity).toBe(5);
    });

    it('should provide updateCartItem function', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem({ quantity: 3 });
      vi.mocked(shoppingCartService.items.update).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useShoppingCartItemMutations());

      // Act
      const item = await result.current.updateCartItem('1', { quantity: 3 });

      // Assert
      expect(shoppingCartService.items.update).toHaveBeenCalledWith('1', {
        quantity: 3,
      });
      expect(item.quantity).toBe(3);
    });

    it('should provide removeFromCart function', async () => {
      // Arrange
      vi.mocked(shoppingCartService.items.remove).mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingCartItemMutations());

      // Act
      await result.current.removeFromCart('1');

      // Assert
      expect(shoppingCartService.items.remove).toHaveBeenCalledWith('1');
    });

    it('should track loading states', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem();
      vi.mocked(shoppingCartService.items.add).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useShoppingCartItemMutations());

      // Act
      await result.current.addToCart(1, 5, 2);

      // Assert
      expect(result.current.isAdding).toBe(false); // False after completion
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isRemoving).toBe(false);
    });
  });

  describe('useCart (comprehensive)', () => {
    it('should return cart and items data', () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      const mockItems = [createMockShoppingCartItem()];
      vi.mocked(shoppingCartService.cart.getCurrent).mockResolvedValue(mockCart);
      vi.mocked(shoppingCartService.items.getAll).mockResolvedValue(mockItems);

      // Act
      const { result } = renderHook(() =>
        useCart({ sessionId: 'sess_123' })
      );

      // Assert
      expect(result.current).toHaveProperty('cart');
      expect(result.current).toHaveProperty('cartItems');
      expect(result.current).toHaveProperty('addProduct');
      expect(result.current).toHaveProperty('updateItemQuantity');
      expect(result.current).toHaveProperty('removeItem');
      expect(result.current).toHaveProperty('clearAllItems');
      expect(result.current).toHaveProperty('checkoutCart');
      expect(result.current).toHaveProperty('refresh');
    });

    it('should expose loading states', () => {
      // Arrange
      vi.mocked(shoppingCartService.cart.getCurrent).mockResolvedValue(null);
      vi.mocked(shoppingCartService.items.getAll).mockResolvedValue([]);

      // Act
      const { result } = renderHook(() =>
        useCart({ sessionId: 'sess_123' })
      );

      // Assert
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isAdding');
      expect(result.current).toHaveProperty('isUpdating');
      expect(result.current).toHaveProperty('isRemoving');
      expect(result.current).toHaveProperty('isCheckingOut');
    });

    it('should expose cart mutations', () => {
      // Arrange
      vi.mocked(shoppingCartService.cart.getCurrent).mockResolvedValue(null);
      vi.mocked(shoppingCartService.items.getAll).mockResolvedValue([]);

      // Act
      const { result } = renderHook(() =>
        useCart({ sessionId: 'sess_123' })
      );

      // Assert
      expect(result.current).toHaveProperty('cartMutations');
      expect(result.current).toHaveProperty('itemMutations');
      expect(result.current.cartMutations).toHaveProperty('createCart');
      expect(result.current.itemMutations).toHaveProperty('addToCart');
    });
  });
});
