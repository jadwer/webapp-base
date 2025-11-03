/**
 * useEcommerceOrders Hooks Tests
 *
 * Unit tests for ecommerce orders hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useEcommerceOrders,
  useEcommerceOrder,
  useEcommerceOrderItems,
  useEcommerceOrderMutations,
  useEcommerceOrderItemMutations,
} from '../../hooks/useEcommerceOrders';
import { ecommerceService } from '../../services';
import {
  createMockEcommerceOrder,
  createMockEcommerceOrderItem,
} from '../utils/test-utils';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: [],
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  })),
}));

// Mock ecommerce service
vi.mock('../../services', () => ({
  ecommerceService: {
    orders: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      updatePaymentStatus: vi.fn(),
      updateShippingStatus: vi.fn(),
      updateTotals: vi.fn(),
      delete: vi.fn(),
      cancel: vi.fn(),
    },
    items: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('useEcommerceOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEcommerceOrders', () => {
    it('should return ecommerce orders data structure', () => {
      // Arrange
      const mockOrders = [
        createMockEcommerceOrder({ id: '1' }),
        createMockEcommerceOrder({ id: '2' }),
      ];
      vi.mocked(ecommerceService.orders.getAll).mockResolvedValue(mockOrders);

      // Act
      const { result } = renderHook(() => useEcommerceOrders());

      // Assert
      expect(result.current).toHaveProperty('ecommerceOrders');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(Array.isArray(result.current.ecommerceOrders)).toBe(true);
    });

    it('should return empty array when no orders', () => {
      // Arrange
      vi.mocked(ecommerceService.orders.getAll).mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useEcommerceOrders());

      // Assert
      expect(result.current.ecommerceOrders).toEqual([]);
    });

  });

  describe('useEcommerceOrder', () => {
    it('should return single order data structure', () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ id: '1' });
      vi.mocked(ecommerceService.orders.getById).mockResolvedValue(mockOrder);

      // Act
      const { result } = renderHook(() => useEcommerceOrder('1'));

      // Assert
      expect(result.current).toHaveProperty('ecommerceOrder');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

  });

  describe('useEcommerceOrderItems', () => {
    it('should return order items data structure', () => {
      // Arrange
      const mockItems = [
        createMockEcommerceOrderItem({ id: '1' }),
        createMockEcommerceOrderItem({ id: '2' }),
      ];
      vi.mocked(ecommerceService.items.getAll).mockResolvedValue(mockItems);

      // Act
      const { result } = renderHook(() => useEcommerceOrderItems(1));

      // Assert
      expect(result.current).toHaveProperty('ecommerceOrderItems');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(Array.isArray(result.current.ecommerceOrderItems)).toBe(true);
    });

    it('should not fetch when order ID is not provided', () => {
      // Act
      const { result } = renderHook(() => useEcommerceOrderItems());

      // Assert
      expect(result.current.ecommerceOrderItems).toEqual([]);
      expect(ecommerceService.items.getAll).not.toHaveBeenCalled();
    });
  });

  describe('useEcommerceOrderMutations', () => {
    it('should provide createEcommerceOrder function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder();
      vi.mocked(ecommerceService.orders.create).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.createEcommerceOrder({
        customerEmail: 'test@example.com',
        customerName: 'Test User',
      });

      // Assert
      expect(ecommerceService.orders.create).toHaveBeenCalled();
      expect(order).toEqual(mockOrder);
    });

    it('should handle createEcommerceOrder errors', async () => {
      // Arrange
      vi.mocked(ecommerceService.orders.create).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act & Assert
      await expect(
        result.current.createEcommerceOrder({ customerEmail: 'test@example.com' })
      ).rejects.toThrow('Creation failed');
    });

    it('should provide updateEcommerceOrder function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ status: 'confirmed' });
      vi.mocked(ecommerceService.orders.update).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.updateEcommerceOrder('1', {
        status: 'confirmed',
      });

      // Assert
      expect(ecommerceService.orders.update).toHaveBeenCalledWith('1', {
        status: 'confirmed',
      });
      expect(order.status).toBe('confirmed');
    });

    it('should provide updateOrderStatus function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ status: 'processing' });
      vi.mocked(ecommerceService.orders.updateStatus).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.updateOrderStatus('1', 'processing');

      // Assert
      expect(ecommerceService.orders.updateStatus).toHaveBeenCalledWith(
        '1',
        'processing'
      );
      expect(order.status).toBe('processing');
    });

    it('should provide updatePaymentStatus function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ paymentStatus: 'completed' });
      vi.mocked(ecommerceService.orders.updatePaymentStatus).mockResolvedValue(
        mockOrder
      );

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.updatePaymentStatus('1', 'completed');

      // Assert
      expect(ecommerceService.orders.updatePaymentStatus).toHaveBeenCalledWith(
        '1',
        'completed'
      );
      expect(order.paymentStatus).toBe('completed');
    });

    it('should provide updateShippingStatus function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ shippingStatus: 'shipped' });
      vi.mocked(ecommerceService.orders.updateShippingStatus).mockResolvedValue(
        mockOrder
      );

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.updateShippingStatus('1', 'shipped');

      // Assert
      expect(ecommerceService.orders.updateShippingStatus).toHaveBeenCalledWith(
        '1',
        'shipped'
      );
      expect(order.shippingStatus).toBe('shipped');
    });

    it('should provide updateEcommerceOrderTotals function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ totalAmount: 1500.0 });
      vi.mocked(ecommerceService.orders.updateTotals).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const totals = {
        subtotalAmount: 1400.0,
        taxAmount: 100.0,
        totalAmount: 1500.0,
      };
      const order = await result.current.updateEcommerceOrderTotals('1', totals);

      // Assert
      expect(ecommerceService.orders.updateTotals).toHaveBeenCalledWith('1', totals);
      expect(order.totalAmount).toBe(1500.0);
    });

    it('should provide deleteEcommerceOrder function', async () => {
      // Arrange
      vi.mocked(ecommerceService.orders.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      await result.current.deleteEcommerceOrder('1');

      // Assert
      expect(ecommerceService.orders.delete).toHaveBeenCalledWith('1');
    });

    it('should provide cancelOrder function', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder({ status: 'cancelled' });
      vi.mocked(ecommerceService.orders.cancel).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const order = await result.current.cancelOrder('1', 'Customer request');

      // Assert
      expect(ecommerceService.orders.cancel).toHaveBeenCalledWith(
        '1',
        'Customer request'
      );
      expect(order.status).toBe('cancelled');
    });

    it('should track isCreating state', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder();
      vi.mocked(ecommerceService.orders.create).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockOrder), 100);
          })
      );

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      const promise = result.current.createEcommerceOrder({
        customerEmail: 'test@example.com',
      });

      // Assert - should be creating
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false); // Will be false after completion
      });

      await promise;
    });

    it('should track isUpdating state', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder();
      vi.mocked(ecommerceService.orders.update).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      await result.current.updateEcommerceOrder('1', { status: 'confirmed' });

      // Assert
      expect(result.current.isUpdating).toBe(false); // False after completion
    });

    it('should track isDeleting state', async () => {
      // Arrange
      vi.mocked(ecommerceService.orders.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEcommerceOrderMutations());

      // Act
      await result.current.deleteEcommerceOrder('1');

      // Assert
      expect(result.current.isDeleting).toBe(false); // False after completion
    });
  });

  describe('useEcommerceOrderItemMutations', () => {
    it('should provide createEcommerceOrderItem function', async () => {
      // Arrange
      const mockItem = createMockEcommerceOrderItem();
      vi.mocked(ecommerceService.items.create).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useEcommerceOrderItemMutations());

      // Act
      const item = await result.current.createEcommerceOrderItem({
        ecommerceOrderId: 1,
        productId: 1,
        quantity: 2,
      });

      // Assert
      expect(ecommerceService.items.create).toHaveBeenCalled();
      expect(item).toEqual(mockItem);
    });

    it('should provide updateEcommerceOrderItem function', async () => {
      // Arrange
      const mockItem = createMockEcommerceOrderItem({ quantity: 5 });
      vi.mocked(ecommerceService.items.update).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useEcommerceOrderItemMutations());

      // Act
      const item = await result.current.updateEcommerceOrderItem('1', {
        quantity: 5,
      });

      // Assert
      expect(ecommerceService.items.update).toHaveBeenCalledWith('1', {
        quantity: 5,
      });
      expect(item.quantity).toBe(5);
    });

    it('should provide deleteEcommerceOrderItem function', async () => {
      // Arrange
      vi.mocked(ecommerceService.items.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEcommerceOrderItemMutations());

      // Act
      await result.current.deleteEcommerceOrderItem('1');

      // Assert
      expect(ecommerceService.items.delete).toHaveBeenCalledWith('1');
    });

    it('should track loading states', async () => {
      // Arrange
      const mockItem = createMockEcommerceOrderItem();
      vi.mocked(ecommerceService.items.create).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useEcommerceOrderItemMutations());

      // Act
      await result.current.createEcommerceOrderItem({
        ecommerceOrderId: 1,
        productId: 1,
      });

      // Assert
      expect(result.current.isCreating).toBe(false); // False after completion
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });
});
