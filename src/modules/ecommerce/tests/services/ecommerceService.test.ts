/**
 * Ecommerce Service Tests
 *
 * Unit tests for ecommerce orders and order items service layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ecommerceService } from '../../services/ecommerceService';
import {
  createMockEcommerceOrder,
  createMockEcommerceOrderItem,
  createMockEcommerceOrderAPIResponse,
  createMockEcommerceOrderItemAPIResponse,
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

describe('ecommerceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('orders.getAll', () => {
    it('should fetch all ecommerce orders without filters', async () => {
      // Arrange
      const mockOrders = [
        createMockEcommerceOrder({ id: '1' }),
        createMockEcommerceOrder({ id: '2' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: { data: mockOrders },
      });

      // Act
      const result = await ecommerceService.orders.getAll();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ecommerce-orders', {
        params: {},
      });
      expect(result).toHaveLength(2);
    });

    it('should fetch ecommerce orders with filters', async () => {
      // Arrange
      const mockOrders = [createMockEcommerceOrder()];
      mockAxios.get.mockResolvedValue({
        data: { data: mockOrders },
      });

      // Act
      await ecommerceService.orders.getAll({
        search: 'ECO-2025',
        status: 'pending',
        paymentStatus: 'pending',
        customerId: 1,
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ecommerce-orders', {
        params: {
          'filter[search]': 'ECO-2025',
          'filter[status]': 'pending',
          'filter[payment_status]': 'pending',
          'filter[customer_id]': 1,
        },
      });
    });

    it('should handle empty response', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await ecommerceService.orders.getAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(ecommerceService.orders.getAll()).rejects.toThrow('API Error');
    });
  });

  describe('orders.getById', () => {
    it('should fetch a single ecommerce order by ID', async () => {
      // Arrange
      const mockOrder = createMockEcommerceOrder();
      mockAxios.get.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(mockOrder),
      });

      // Act
      const result = await ecommerceService.orders.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ecommerce-orders/1', {
        params: {
          include: 'items,items.product,customer,paymentMethod',
        },
      });
      expect(result.id).toBe('1');
    });

    it('should throw 404 error when order not found', async () => {
      // Arrange
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(ecommerceService.orders.getById('999')).rejects.toThrow();
    });
  });

  describe('orders.create', () => {
    it('should create a new ecommerce order', async () => {
      // Arrange
      const newOrder = createMockEcommerceOrder({ id: undefined as any });
      const createdOrder = createMockEcommerceOrder({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(createdOrder),
      });

      // Act
      const result = await ecommerceService.orders.create(newOrder);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/ecommerce-orders',
        expect.objectContaining({
          data: {
            type: 'ecommerce-orders',
            attributes: expect.any(Object),
          },
        })
      );
      expect(result.id).toBe('1');
    });

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const error = new Error('Validation Error');
      (error as any).response = { status: 422 };
      mockAxios.post.mockRejectedValue(error);

      // Act & Assert
      await expect(
        ecommerceService.orders.create({} as any)
      ).rejects.toThrow('Validation Error');
    });
  });

  describe('orders.update', () => {
    it('should update an existing ecommerce order', async () => {
      // Arrange
      const updatedOrder = createMockEcommerceOrder({ status: 'confirmed' });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(updatedOrder),
      });

      // Act
      const result = await ecommerceService.orders.update('1', { status: 'confirmed' });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/ecommerce-orders/1',
        expect.objectContaining({
          data: {
            type: 'ecommerce-orders',
            id: '1',
            attributes: expect.any(Object),
          },
        })
      );
      expect(result.status).toBe('confirmed');
    });

    it('should throw 404 error when updating non-existent order', async () => {
      // Arrange
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockAxios.patch.mockRejectedValue(error);

      // Act & Assert
      await expect(
        ecommerceService.orders.update('999', { status: 'confirmed' })
      ).rejects.toThrow();
    });
  });

  describe('orders.updateStatus', () => {
    it('should update order status', async () => {
      // Arrange
      const updatedOrder = createMockEcommerceOrder({ status: 'processing' });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(updatedOrder),
      });

      // Act
      const result = await ecommerceService.orders.updateStatus('1', 'processing');

      // Assert
      expect(result.status).toBe('processing');
    });
  });

  describe('orders.updatePaymentStatus', () => {
    it('should update payment status', async () => {
      // Arrange
      const updatedOrder = createMockEcommerceOrder({ paymentStatus: 'completed' });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(updatedOrder),
      });

      // Act
      const result = await ecommerceService.orders.updatePaymentStatus('1', 'completed');

      // Assert
      expect(result.paymentStatus).toBe('completed');
    });
  });

  describe('orders.updateShippingStatus', () => {
    it('should update shipping status', async () => {
      // Arrange
      const updatedOrder = createMockEcommerceOrder({ shippingStatus: 'shipped' });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(updatedOrder),
      });

      // Act
      const result = await ecommerceService.orders.updateShippingStatus('1', 'shipped');

      // Assert
      expect(result.shippingStatus).toBe('shipped');
    });
  });

  describe('orders.updateTotals', () => {
    it('should update order totals', async () => {
      // Arrange
      const updatedOrder = createMockEcommerceOrder({
        subtotalAmount: 1500.00,
        totalAmount: 1710.00,
      });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(updatedOrder),
      });

      // Act
      const result = await ecommerceService.orders.updateTotals('1', {
        subtotalAmount: 1500.00,
        taxAmount: 160.00,
        shippingAmount: 50.00,
        totalAmount: 1710.00,
      });

      // Assert
      expect(result.subtotalAmount).toBe(1500.00);
      expect(result.totalAmount).toBe(1710.00);
    });
  });

  describe('orders.delete', () => {
    it('should delete an ecommerce order', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await ecommerceService.orders.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ecommerce-orders/1');
    });

    it('should throw 404 error when deleting non-existent order', async () => {
      // Arrange
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockAxios.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(ecommerceService.orders.delete('999')).rejects.toThrow();
    });
  });

  describe('orders.cancel', () => {
    it('should cancel an order with reason', async () => {
      // Arrange
      const cancelledOrder = createMockEcommerceOrder({
        status: 'cancelled',
        notes: 'Customer request',
      });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderAPIResponse(cancelledOrder),
      });

      // Act
      const result = await ecommerceService.orders.cancel('1', 'Customer request');

      // Assert
      expect(result.status).toBe('cancelled');
      expect(result.notes).toBe('Customer request');
    });
  });

  // ============================================
  // Order Items Tests
  // ============================================

  describe('items.getAll', () => {
    it('should fetch all order items', async () => {
      // Arrange
      const mockItems = [
        createMockEcommerceOrderItem({ id: '1' }),
        createMockEcommerceOrderItem({ id: '2' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: { data: mockItems },
      });

      // Act
      const result = await ecommerceService.items.getAll();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ecommerce-order-items', {
        params: {},
      });
      expect(result).toHaveLength(2);
    });

    it('should fetch items filtered by order ID', async () => {
      // Arrange
      const mockItems = [createMockEcommerceOrderItem()];
      mockAxios.get.mockResolvedValue({
        data: { data: mockItems },
      });

      // Act
      await ecommerceService.items.getAll(1);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ecommerce-order-items', {
        params: {
          'filter[ecommerce_order_id]': 1,
        },
      });
    });
  });

  describe('items.create', () => {
    it('should create a new order item', async () => {
      // Arrange
      const newItem = createMockEcommerceOrderItem({ id: undefined as any });
      const createdItem = createMockEcommerceOrderItem({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: createMockEcommerceOrderItemAPIResponse(createdItem),
      });

      // Act
      const result = await ecommerceService.items.create(newItem);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/ecommerce-order-items',
        expect.objectContaining({
          data: {
            type: 'ecommerce-order-items',
            attributes: expect.any(Object),
          },
        })
      );
      expect(result.id).toBe('1');
    });
  });

  describe('items.update', () => {
    it('should update an existing order item', async () => {
      // Arrange
      const updatedItem = createMockEcommerceOrderItem({ quantity: 5 });
      mockAxios.patch.mockResolvedValue({
        data: createMockEcommerceOrderItemAPIResponse(updatedItem),
      });

      // Act
      const result = await ecommerceService.items.update('1', { quantity: 5 });

      // Assert
      expect(result.quantity).toBe(5);
    });
  });

  describe('items.delete', () => {
    it('should delete an order item', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await ecommerceService.items.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ecommerce-order-items/1');
    });
  });
});
