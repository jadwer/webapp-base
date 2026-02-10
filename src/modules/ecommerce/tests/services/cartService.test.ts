/**
 * Shopping Cart Service Tests
 *
 * Unit tests for shopping cart and cart items service layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shoppingCartService } from '../../services/cartService';
import {
  createMockShoppingCart,
  createMockShoppingCartItem,
  createMockShoppingCartAPIResponse,
  createMockShoppingCartItemAPIResponse,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosClient from '@/lib/axiosClient';

const mockAxios = axiosClient as any;

describe('shoppingCartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cart.getCurrent', () => {
    it('should fetch current shopping cart by session ID', async () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      mockAxios.get.mockResolvedValue({
        data: createMockShoppingCartAPIResponse(mockCart),
      });

      // Act
      const result = await shoppingCartService.cart.getCurrent({
        sessionId: 'sess_123456789',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/shopping-carts/current', {
        params: {
          'session_id': 'sess_123456789',
        },
      });
      expect(result).not.toBeNull();
      expect(result?.sessionId).toBe('sess_123456789');
    });

    it('should fetch current shopping cart for authenticated user (no customerId param)', async () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      mockAxios.get.mockResolvedValue({
        data: createMockShoppingCartAPIResponse(mockCart),
      });

      // Act - backend uses Auth::id() for authenticated users, no customerId sent
      const result = await shoppingCartService.cart.getCurrent({
        customerId: 1,
      });

      // Assert - customerId is NOT sent as param; backend resolves it from auth
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/shopping-carts/current', {
        params: {},
      });
      expect(result).not.toBeNull();
    });

    it('should return null when cart not found', async () => {
      // Arrange
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockAxios.get.mockRejectedValue(error);

      // Act
      const result = await shoppingCartService.cart.getCurrent({
        sessionId: 'sess_123456789',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error on other API failures', async () => {
      // Arrange
      const error = new Error('Server Error');
      (error as any).response = { status: 500 };
      mockAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(
        shoppingCartService.cart.getCurrent({ sessionId: 'sess_123456789' })
      ).rejects.toThrow('Server Error');
    });
  });

  describe('cart.getById', () => {
    it('should fetch a shopping cart by ID', async () => {
      // Arrange
      const mockCart = createMockShoppingCart();
      mockAxios.get.mockResolvedValue({
        data: createMockShoppingCartAPIResponse(mockCart),
      });

      // Act
      const result = await shoppingCartService.cart.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/shopping-carts/1', {
        params: {
          include: 'cartItems,cartItems.product',
        },
      });
      expect(result.id).toBe('1');
    });
  });

  describe('cart.create', () => {
    it('should create a new shopping cart', async () => {
      // Arrange
      const newCart = createMockShoppingCart({ id: undefined as any });
      const createdCart = createMockShoppingCart({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: createMockShoppingCartAPIResponse(createdCart),
      });

      // Act
      const result = await shoppingCartService.cart.create(newCart);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/shopping-carts',
        expect.objectContaining({
          data: {
            type: 'shopping-carts',
            attributes: expect.any(Object),
          },
        })
      );
      expect(result.id).toBe('1');
    });
  });

  describe('cart.updateTotals', () => {
    it('should update cart totals', async () => {
      // Arrange
      const updatedCart = createMockShoppingCart({
        subtotalAmount: 1500.00,
        totalAmount: 1740.00,
      });
      mockAxios.patch.mockResolvedValue({
        data: createMockShoppingCartAPIResponse(updatedCart),
      });

      // Act
      const result = await shoppingCartService.cart.updateTotals('1', {
        subtotalAmount: 1500.00,
        taxAmount: 240.00,
        totalAmount: 1740.00,
      });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/shopping-carts/1',
        expect.objectContaining({
          data: {
            type: 'shopping-carts',
            id: '1',
            attributes: {
              taxAmount: 240.00,
              totalAmount: 1740.00,
            },
          },
        })
      );
      expect(result.subtotalAmount).toBe(1500.00);
      expect(result.totalAmount).toBe(1740.00);
    });
  });

  describe('cart.clear', () => {
    it('should clear all items from cart', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await shoppingCartService.cart.clear('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/shopping-carts/1/clear');
    });
  });

  describe('cart.delete', () => {
    it('should delete a shopping cart', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await shoppingCartService.cart.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/shopping-carts/1');
    });
  });

  describe('cart.checkout', () => {
    it('should convert cart to order', async () => {
      // Arrange
      const orderData = {
        customerEmail: 'customer@example.com',
        shippingAddress: '123 Main St',
      };
      const mockOrderResponse = { data: { id: '1', orderNumber: 'ECO-2025-001' } };
      mockAxios.post.mockResolvedValue(mockOrderResponse);

      // Act
      const result = await shoppingCartService.cart.checkout('1', orderData);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/shopping-carts/1/checkout',
        orderData
      );
      expect(result).toEqual(mockOrderResponse.data);
    });
  });

  // ============================================
  // Cart Items Tests
  // ============================================

  describe('items.getAll', () => {
    it('should fetch all cart items for a specific cart', async () => {
      // Arrange
      const mockItems = [
        createMockShoppingCartItem({ id: '1' }),
        createMockShoppingCartItem({ id: '2' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: { data: mockItems },
      });

      // Act
      const result = await shoppingCartService.items.getAll(1);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/cart-items', {
        params: {
          'filter[shopping_cart_id]': 1,
        },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('items.getById', () => {
    it('should fetch a single cart item by ID', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem();
      mockAxios.get.mockResolvedValue({
        data: createMockShoppingCartItemAPIResponse(mockItem),
      });

      // Act
      const result = await shoppingCartService.items.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/cart-items/1', {
        params: {
          include: 'product',
        },
      });
      expect(result.id).toBe('1');
    });
  });

  describe('items.add', () => {
    it('should add item to cart with default quantity', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem();
      mockAxios.post.mockResolvedValue({
        data: createMockShoppingCartItemAPIResponse(mockItem),
      });

      // Act
      const result = await shoppingCartService.items.add(1, 1);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/cart-items',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cart-items',
            attributes: expect.objectContaining({
              quantity: 1,
              unitPrice: 0,
              originalPrice: 0,
            }),
            relationships: {
              shoppingCart: {
                data: { type: 'shopping-carts', id: '1' },
              },
              product: {
                data: { type: 'products', id: '1' },
              },
            },
          }),
        })
      );
      expect(result.id).toBe('1');
    });

    it('should add item to cart with custom quantity and price', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem({ quantity: 5 });
      mockAxios.post.mockResolvedValue({
        data: createMockShoppingCartItemAPIResponse(mockItem),
      });

      // Act
      const result = await shoppingCartService.items.add(1, 1, 5, 100);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/cart-items',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cart-items',
            attributes: expect.objectContaining({
              quantity: 5,
              unitPrice: 100,
              originalPrice: 100,
              subtotal: 500,
              taxRate: 16,
              taxAmount: 80,
              total: 580,
            }),
            relationships: {
              shoppingCart: {
                data: { type: 'shopping-carts', id: '1' },
              },
              product: {
                data: { type: 'products', id: '1' },
              },
            },
          }),
        })
      );
      expect(result.quantity).toBe(5);
    });
  });

  describe('items.updateQuantity', () => {
    it('should update cart item quantity', async () => {
      // Arrange
      const mockItem = createMockShoppingCartItem({ quantity: 3 });
      mockAxios.patch.mockResolvedValue({
        data: createMockShoppingCartItemAPIResponse(mockItem),
      });

      // Act
      const result = await shoppingCartService.items.updateQuantity('1', 3);

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/cart-items/1',
        expect.objectContaining({
          data: {
            type: 'cart-items',
            id: '1',
            attributes: {
              quantity: 3,
            },
          },
        })
      );
      expect(result.quantity).toBe(3);
    });
  });

  describe('items.update', () => {
    it('should update cart item', async () => {
      // Arrange
      const updatedItem = createMockShoppingCartItem({ quantity: 4 });
      mockAxios.patch.mockResolvedValue({
        data: createMockShoppingCartItemAPIResponse(updatedItem),
      });

      // Act
      const result = await shoppingCartService.items.update('1', { quantity: 4 });

      // Assert
      expect(result.quantity).toBe(4);
    });
  });

  describe('items.remove', () => {
    it('should remove item from cart', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await shoppingCartService.items.remove('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/cart-items/1');
    });
  });
});
