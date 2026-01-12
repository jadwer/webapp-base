/**
 * Checkout Sessions Service Tests
 *
 * Unit tests for checkout sessions service layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutSessionsService } from '../../services/checkoutSessionsService';
import { createMockCheckoutSession } from '../utils/test-utils';

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

const mockAxios = axiosClient as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

// Helper to create JSON:API response
function createCheckoutSessionAPIResponse(session: ReturnType<typeof createMockCheckoutSession>) {
  return {
    data: {
      id: session.id,
      type: 'checkout-sessions',
      attributes: {
        shopping_cart_id: session.shoppingCartId,
        contact_id: session.contactId,
        status: session.status,
        shipping_address_id: session.shippingAddressId,
        billing_address_id: session.billingAddressId,
        subtotal: session.subtotal,
        shipping_amount: session.shippingAmount,
        tax_amount: session.taxAmount,
        discount_amount: session.discountAmount,
        total: session.total,
        payment_method: session.paymentMethod,
        payment_intent_id: session.paymentIntentId,
        sales_order_id: session.salesOrderId,
        completed_at: session.completedAt,
        created_at: session.createdAt,
      },
    },
  };
}

describe('checkoutSessionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // CREATE CHECKOUT SESSION
  // ============================================

  describe('create', () => {
    it('should create a new checkout session', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockAxios.post.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.create({
        shoppingCartId: 1,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/checkout-sessions', {
        data: {
          type: 'checkout-sessions',
          attributes: {
            shoppingCartId: 1,
            shippingAddressId: undefined,
            billingAddressId: undefined,
          },
        },
      });
      expect(result.status).toBe('pending');
      expect(result.shoppingCartId).toBe(1);
    });

    it('should create checkout session with addresses', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession({
        shippingAddressId: 10,
        billingAddressId: 11,
      });
      mockAxios.post.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.create({
        shoppingCartId: 1,
        shippingAddressId: 10,
        billingAddressId: 11,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/checkout-sessions', {
        data: {
          type: 'checkout-sessions',
          attributes: {
            shoppingCartId: 1,
            shippingAddressId: 10,
            billingAddressId: 11,
          },
        },
      });
      expect(result.shippingAddressId).toBe(10);
      expect(result.billingAddressId).toBe(11);
    });

    it('should throw error on API failure', async () => {
      // Arrange
      mockAxios.post.mockRejectedValue(new Error('Cart not found'));

      // Act & Assert
      await expect(checkoutSessionsService.create({ shoppingCartId: 999 }))
        .rejects.toThrow('Cart not found');
    });
  });

  // ============================================
  // GET CHECKOUT SESSION
  // ============================================

  describe('getById', () => {
    it('should fetch checkout session by ID with includes', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockAxios.get.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.getById('session-123');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/checkout-sessions/session-123', {
        params: { include: 'shoppingCart,shippingAddress,billingAddress' },
      });
      expect(result.id).toBe('session-123');
    });

    it('should fetch session with all status types', async () => {
      // Test different status values
      const statuses: Array<'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled'> = [
        'pending',
        'payment_pending',
        'completed',
        'failed',
        'cancelled',
      ];

      for (const status of statuses) {
        const mockSession = createMockCheckoutSession({ status });
        mockAxios.get.mockResolvedValue({
          data: createCheckoutSessionAPIResponse(mockSession),
        });

        const result = await checkoutSessionsService.getById('session-123');
        expect(result.status).toBe(status);
      }
    });
  });

  // ============================================
  // UPDATE CHECKOUT SESSION
  // ============================================

  describe('update', () => {
    it('should update shipping method and amount', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession({
        shippingAmount: 15,
      });
      mockAxios.patch.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.update('session-123', {
        shippingMethod: 'express',
        shippingAmount: 15,
      });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/checkout-sessions/session-123', {
        data: {
          type: 'checkout-sessions',
          id: 'session-123',
          attributes: {
            shippingMethod: 'express',
            shippingAmount: 15,
            shippingAddressId: undefined,
            billingAddressId: undefined,
          },
        },
      });
      expect(result.shippingAmount).toBe(15);
    });

    it('should update addresses', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession({
        shippingAddressId: 20,
        billingAddressId: 21,
      });
      mockAxios.patch.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.update('session-123', {
        shippingAddressId: 20,
        billingAddressId: 21,
      });

      // Assert
      expect(result.shippingAddressId).toBe(20);
      expect(result.billingAddressId).toBe(21);
    });
  });

  // ============================================
  // TRANSFORMER
  // ============================================

  describe('transformFromAPI', () => {
    it('should transform camelCase attributes', () => {
      // Arrange
      const apiResponse = {
        id: 'session-1',
        type: 'checkout-sessions',
        attributes: {
          shoppingCartId: 1,
          contactId: 10,
          status: 'pending',
          shippingAddressId: 20,
          billingAddressId: 21,
          subtotal: 100,
          shippingAmount: 10,
          taxAmount: 16,
          discountAmount: 5,
          total: 121,
          paymentMethod: 'stripe',
          paymentIntentId: 'pi_123',
          salesOrderId: 50,
          completedAt: '2025-01-15T12:00:00Z',
          createdAt: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = checkoutSessionsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.shoppingCartId).toBe(1);
      expect(result.contactId).toBe(10);
      expect(result.shippingAmount).toBe(10);
      expect(result.taxAmount).toBe(16);
      expect(result.paymentIntentId).toBe('pi_123');
    });

    it('should transform snake_case attributes', () => {
      // Arrange
      const apiResponse = {
        id: 'session-1',
        type: 'checkout-sessions',
        attributes: {
          shopping_cart_id: 1,
          contact_id: null,
          status: 'completed',
          shipping_address_id: null,
          billing_address_id: null,
          subtotal: 200,
          shipping_amount: 0,
          tax_amount: 32,
          discount_amount: 0,
          total: 232,
          payment_method: null,
          payment_intent_id: null,
          sales_order_id: null,
          completed_at: null,
          created_at: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = checkoutSessionsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.shoppingCartId).toBe(1);
      expect(result.contactId).toBeNull();
      expect(result.shippingAddressId).toBeNull();
      expect(result.completedAt).toBeNull();
    });

    it('should default numeric amounts to 0 when missing', () => {
      // Arrange
      const apiResponse = {
        id: 'session-1',
        type: 'checkout-sessions',
        attributes: {
          shopping_cart_id: 1,
          status: 'pending',
          subtotal: 100,
          total: 100,
          created_at: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = checkoutSessionsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.shippingAmount).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.discountAmount).toBe(0);
    });
  });

  // ============================================
  // CHECKOUT FLOW BUSINESS RULES
  // ============================================

  describe('Checkout Flow Business Rules', () => {
    it('should calculate total correctly (subtotal + shipping + tax - discount)', async () => {
      // Arrange - Business Rule: Cart Totals
      const mockSession = createMockCheckoutSession({
        subtotal: 100,
        shippingAmount: 10,
        taxAmount: 16,
        discountAmount: 5,
        total: 121, // 100 + 10 + 16 - 5 = 121
      });
      mockAxios.get.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.getById('session-123');

      // Assert
      const calculatedTotal = result.subtotal + result.shippingAmount + result.taxAmount - result.discountAmount;
      expect(result.total).toBe(calculatedTotal);
    });

    it('should track payment status through lifecycle', async () => {
      // Test payment lifecycle statuses
      const statusFlow = ['pending', 'payment_pending', 'completed'];

      for (let i = 0; i < statusFlow.length; i++) {
        const mockSession = createMockCheckoutSession({
          status: statusFlow[i] as 'pending' | 'payment_pending' | 'completed',
        });
        mockAxios.get.mockResolvedValue({
          data: createCheckoutSessionAPIResponse(mockSession),
        });

        const result = await checkoutSessionsService.getById('session-123');
        expect(result.status).toBe(statusFlow[i]);
      }
    });

    it('should link to sales order when completed', async () => {
      // Arrange - Business Rule: Checkout creates sales order on completion
      const mockSession = createMockCheckoutSession({
        status: 'completed',
        salesOrderId: 123,
        completedAt: '2025-01-15T12:00:00Z',
      });
      mockAxios.get.mockResolvedValue({
        data: createCheckoutSessionAPIResponse(mockSession),
      });

      // Act
      const result = await checkoutSessionsService.getById('session-123');

      // Assert
      expect(result.status).toBe('completed');
      expect(result.salesOrderId).toBe(123);
      expect(result.completedAt).not.toBeNull();
    });
  });
});
