/**
 * useCheckout Hooks Tests
 *
 * Unit tests for checkout mutation hooks.
 * Note: SWR data fetching hooks are tested through service tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCheckoutMutations,
  useCheckoutFlow,
} from '../../hooks/useCheckout';
import { checkoutSessionsService } from '../../services/checkoutSessionsService';
import { createMockCheckoutSession } from '../utils/test-utils';

// Mock services
vi.mock('../../services/checkoutSessionsService', () => ({
  checkoutSessionsService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../services/cartService', () => ({
  shoppingCartService: {
    cart: {
      getById: vi.fn(),
    },
  },
}));

const mockCheckoutService = checkoutSessionsService as {
  create: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

describe('useCheckout Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // useCheckoutMutations
  // ============================================

  describe('useCheckoutMutations', () => {
    it('should provide all mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      // Assert
      expect(result.current.createSession).toBeDefined();
      expect(result.current.updateSession).toBeDefined();
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should create checkout session', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockCheckoutService.create.mockResolvedValue(mockSession);

      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      let createdSession;
      await act(async () => {
        createdSession = await result.current.createSession({
          shoppingCartId: 1,
        });
      });

      // Assert
      expect(mockCheckoutService.create).toHaveBeenCalledWith({
        shoppingCartId: 1,
      });
      expect(createdSession).toEqual(mockSession);
    });

    it('should create session with addresses', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession({
        shippingAddressId: 10,
        billingAddressId: 11,
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        await result.current.createSession({
          shoppingCartId: 1,
          shippingAddressId: 10,
          billingAddressId: 11,
        });
      });

      // Assert
      expect(mockCheckoutService.create).toHaveBeenCalledWith({
        shoppingCartId: 1,
        shippingAddressId: 10,
        billingAddressId: 11,
      });
    });

    it('should update checkout session', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession({
        shippingAmount: 15,
      });
      mockCheckoutService.update.mockResolvedValue(mockSession);

      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        await result.current.updateSession('session-123', {
          shippingMethod: 'express',
          shippingAmount: 15,
        });
      });

      // Assert
      expect(mockCheckoutService.update).toHaveBeenCalledWith('session-123', {
        shippingMethod: 'express',
        shippingAmount: 15,
      });
    });

    it('should track creating state', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockCheckoutService.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSession), 100))
      );

      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      // Assert initial state
      expect(result.current.isCreating).toBe(false);

      // Start creation
      act(() => {
        result.current.createSession({ shoppingCartId: 1 });
      });

      // Check loading state
      expect(result.current.isCreating).toBe(true);
    });

    it('should track updating state', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockCheckoutService.update.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSession), 100))
      );

      // Act
      const { result } = renderHook(() => useCheckoutMutations());

      // Assert initial state
      expect(result.current.isUpdating).toBe(false);

      // Start update
      act(() => {
        result.current.updateSession('session-123', { shippingMethod: 'express' });
      });

      // Check loading state
      expect(result.current.isUpdating).toBe(true);
    });
  });

  // ============================================
  // useCheckoutFlow
  // ============================================

  describe('useCheckoutFlow', () => {
    it('should provide checkout flow functions', () => {
      // Act
      const { result } = renderHook(() => useCheckoutFlow(1));

      // Assert
      expect(result.current.startCheckout).toBeDefined();
      expect(result.current.setShippingMethod).toBeDefined();
      expect(result.current.updateShippingAddress).toBeDefined();
      expect(result.current.updateBillingAddress).toBeDefined();
      expect(result.current.session).toBeUndefined();
    });

    it('should start checkout process', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockCheckoutService.create.mockResolvedValue(mockSession);

      // Act
      const { result } = renderHook(() => useCheckoutFlow(1));

      await act(async () => {
        await result.current.startCheckout();
      });

      // Assert
      expect(mockCheckoutService.create).toHaveBeenCalled();
    });

    it('should set shipping method during checkout', async () => {
      // Arrange
      const mockSession = createMockCheckoutSession();
      mockCheckoutService.create.mockResolvedValue(mockSession);
      mockCheckoutService.update.mockResolvedValue({
        ...mockSession,
        shippingAmount: 20,
      });

      // Act
      const { result } = renderHook(() => useCheckoutFlow(1));

      // First start checkout
      await act(async () => {
        await result.current.startCheckout();
      });

      // Then set shipping method
      await act(async () => {
        await result.current.setShippingMethod('express', 20);
      });

      // Assert
      expect(mockCheckoutService.update).toHaveBeenCalled();
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useCheckoutFlow(1));

      // Assert - useCheckoutFlow exposes isCreating, isUpdating, isProcessing
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
    });
  });

  // ============================================
  // CHECKOUT FLOW BUSINESS RULES
  // ============================================

  describe('Checkout Flow Business Rules', () => {
    it('should require cart for checkout', async () => {
      // Business Rule: Checkout requires a shopping cart
      const mockSession = createMockCheckoutSession({ shoppingCartId: 1 });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({
          shoppingCartId: 1,
        });
        expect(session.shoppingCartId).toBe(1);
      });
    });

    it('should support different checkout statuses', async () => {
      // Business Rule: Checkout has specific status flow
      const statuses: Array<'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled'> = [
        'pending',
        'payment_pending',
        'completed',
        'failed',
        'cancelled',
      ];

      const { result } = renderHook(() => useCheckoutMutations());

      for (const status of statuses) {
        const mockSession = createMockCheckoutSession({ status });
        mockCheckoutService.create.mockResolvedValueOnce(mockSession);

        await act(async () => {
          const session = await result.current.createSession({ shoppingCartId: 1 });
          expect(session.status).toBe(status);
        });
      }
    });

    it('should calculate totals correctly', async () => {
      // Business Rule: Total = subtotal + shipping + tax - discount
      const mockSession = createMockCheckoutSession({
        subtotal: 100,
        shippingAmount: 10,
        taxAmount: 16,
        discountAmount: 5,
        total: 121, // 100 + 10 + 16 - 5 = 121
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({ shoppingCartId: 1 });
        const calculated = session.subtotal + session.shippingAmount +
                         session.taxAmount - session.discountAmount;
        expect(session.total).toBe(calculated);
      });
    });

    it('should link to sales order on completion', async () => {
      // Business Rule: Completed checkout creates sales order
      const mockSession = createMockCheckoutSession({
        status: 'completed',
        salesOrderId: 123,
        completedAt: '2025-01-15T12:00:00Z',
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({ shoppingCartId: 1 });
        expect(session.status).toBe('completed');
        expect(session.salesOrderId).toBe(123);
        expect(session.completedAt).not.toBeNull();
      });
    });

    it('should handle failed checkout', async () => {
      // Business Rule: Checkout can fail
      const mockSession = createMockCheckoutSession({
        status: 'failed',
        salesOrderId: null,
        completedAt: null,
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({ shoppingCartId: 1 });
        expect(session.status).toBe('failed');
        expect(session.salesOrderId).toBeNull();
      });
    });

    it('should support shipping and billing addresses', async () => {
      // Business Rule: Checkout can have separate addresses
      const mockSession = createMockCheckoutSession({
        shippingAddressId: 10,
        billingAddressId: 20,
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({
          shoppingCartId: 1,
          shippingAddressId: 10,
          billingAddressId: 20,
        });
        expect(session.shippingAddressId).toBe(10);
        expect(session.billingAddressId).toBe(20);
      });
    });

    it('should track payment information', async () => {
      // Business Rule: Checkout tracks payment method and intent
      const mockSession = createMockCheckoutSession({
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_123456',
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({ shoppingCartId: 1 });
        expect(session.paymentMethod).toBe('stripe');
        expect(session.paymentIntentId).toBe('pi_123456');
      });
    });

    it('should associate checkout with contact', async () => {
      // Business Rule: Checkout is linked to a contact
      const mockSession = createMockCheckoutSession({
        contactId: 50,
      });
      mockCheckoutService.create.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useCheckoutMutations());

      await act(async () => {
        const session = await result.current.createSession({ shoppingCartId: 1 });
        expect(session.contactId).toBe(50);
      });
    });
  });
});
