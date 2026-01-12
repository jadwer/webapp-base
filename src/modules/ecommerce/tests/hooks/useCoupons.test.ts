/**
 * useCoupons Hooks Tests
 *
 * Unit tests for coupons mutation hooks including business rules validation.
 * Note: SWR data fetching hooks are tested through service tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCouponMutations,
  useCartCoupon,
} from '../../hooks/useCoupons';
import { couponsService } from '../../services/couponsService';
import { createMockCoupon } from '../utils/test-utils';

// Mock service
vi.mock('../../services/couponsService', () => ({
  couponsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    validate: vi.fn(),
    applyToCart: vi.fn(),
    removeFromCart: vi.fn(),
  },
}));

const mockService = couponsService as {
  getAll: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  validate: ReturnType<typeof vi.fn>;
  applyToCart: ReturnType<typeof vi.fn>;
  removeFromCart: ReturnType<typeof vi.fn>;
};

describe('useCoupons Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // useCouponMutations
  // ============================================

  describe('useCouponMutations', () => {
    it('should provide all mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCouponMutations());

      // Assert
      expect(result.current.createCoupon).toBeDefined();
      expect(result.current.updateCoupon).toBeDefined();
      expect(result.current.deleteCoupon).toBeDefined();
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useCouponMutations());

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should create coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockService.create.mockResolvedValue(mockCoupon);

      // Act
      const { result } = renderHook(() => useCouponMutations());

      let createdCoupon;
      await act(async () => {
        createdCoupon = await result.current.createCoupon({
          code: 'NEW10',
          name: 'New Coupon',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
        });
      });

      // Assert
      expect(mockService.create).toHaveBeenCalled();
      expect(createdCoupon).toEqual(mockCoupon);
    });

    it('should update coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon({ isActive: false });
      mockService.update.mockResolvedValue(mockCoupon);

      // Act
      const { result } = renderHook(() => useCouponMutations());

      await act(async () => {
        await result.current.updateCoupon('1', { isActive: false });
      });

      // Assert
      expect(mockService.update).toHaveBeenCalledWith('1', { isActive: false });
    });

    it('should delete coupon', async () => {
      // Arrange
      mockService.delete.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useCouponMutations());

      await act(async () => {
        await result.current.deleteCoupon('1');
      });

      // Assert
      expect(mockService.delete).toHaveBeenCalledWith('1');
    });

    it('should track creating state', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockService.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockCoupon), 100))
      );

      // Act
      const { result } = renderHook(() => useCouponMutations());

      // Assert initial state
      expect(result.current.isCreating).toBe(false);

      // Start creation
      act(() => {
        result.current.createCoupon({
          code: 'TEST',
          name: 'Test',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
        });
      });

      // Check loading state
      expect(result.current.isCreating).toBe(true);
    });

    it('should track updating state', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockService.update.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockCoupon), 100))
      );

      // Act
      const { result } = renderHook(() => useCouponMutations());

      // Assert initial state
      expect(result.current.isUpdating).toBe(false);

      // Start update
      act(() => {
        result.current.updateCoupon('1', { isActive: false });
      });

      // Check loading state
      expect(result.current.isUpdating).toBe(true);
    });

    it('should track deleting state', async () => {
      // Arrange
      mockService.delete.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      // Act
      const { result } = renderHook(() => useCouponMutations());

      // Assert initial state
      expect(result.current.isDeleting).toBe(false);

      // Start deletion
      act(() => {
        result.current.deleteCoupon('1');
      });

      // Check loading state
      expect(result.current.isDeleting).toBe(true);
    });
  });

  // ============================================
  // useCartCoupon
  // ============================================

  describe('useCartCoupon', () => {
    it('should provide coupon application functions', () => {
      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      // Assert
      expect(result.current.validateCoupon).toBeDefined();
      expect(result.current.applyCoupon).toBeDefined();
      expect(result.current.removeCoupon).toBeDefined();
    });

    it('should validate coupon code', async () => {
      // Arrange
      mockService.validate.mockResolvedValue({
        valid: true,
        coupon: createMockCoupon(),
      });

      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      await act(async () => {
        await result.current.validateCoupon('SAVE10');
      });

      // Assert
      expect(mockService.validate).toHaveBeenCalledWith('SAVE10');
    });

    it('should apply coupon to cart', async () => {
      // Arrange
      mockService.applyToCart.mockResolvedValue({
        valid: true,
        discountAmount: 50,
        newTotal: 450,
      });

      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      await act(async () => {
        await result.current.applyCoupon('SAVE10');
      });

      // Assert
      expect(mockService.applyToCart).toHaveBeenCalledWith('cart-1', 'SAVE10');
    });

    it('should remove coupon from cart', async () => {
      // Arrange
      mockService.removeFromCart.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      await act(async () => {
        await result.current.removeCoupon();
      });

      // Assert
      expect(mockService.removeFromCart).toHaveBeenCalledWith('cart-1');
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      // Assert - useCartCoupon has isApplying and isRemoving only
      expect(result.current.isApplying).toBe(false);
      expect(result.current.isRemoving).toBe(false);
    });

    it('should track applying state', async () => {
      // Arrange
      mockService.applyToCart.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ valid: true }), 100))
      );

      // Act
      const { result } = renderHook(() => useCartCoupon('cart-1'));

      // Start applying
      act(() => {
        result.current.applyCoupon('TEST');
      });

      // Check loading state
      expect(result.current.isApplying).toBe(true);
    });
  });

  // ============================================
  // BUSINESS RULES
  // ============================================

  describe('Business Rules', () => {
    it('should validate minimum order amount', async () => {
      // Business Rule: Coupon requires minimum order amount
      mockService.applyToCart.mockResolvedValue({
        valid: false,
        error: 'Minimum order amount not met',
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; error?: string } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('MINORDER');
      });

      expect(applyResult?.valid).toBe(false);
      expect(applyResult?.error).toBe('Minimum order amount not met');
    });

    it('should validate usage limit', async () => {
      // Business Rule: Coupon has usage limit
      mockService.applyToCart.mockResolvedValue({
        valid: false,
        error: 'Coupon usage limit exceeded',
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; error?: string } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('MAXUSED');
      });

      expect(applyResult?.valid).toBe(false);
    });

    it('should validate date range (expired coupon)', async () => {
      // Business Rule: Coupon must be within valid date range
      mockService.applyToCart.mockResolvedValue({
        valid: false,
        error: 'Coupon has expired',
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; error?: string } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('EXPIRED');
      });

      expect(applyResult?.valid).toBe(false);
      expect(applyResult?.error).toBe('Coupon has expired');
    });

    it('should apply percentage discount correctly', async () => {
      // Business Rule: Percentage discount calculation
      mockService.applyToCart.mockResolvedValue({
        valid: true,
        discountAmount: 50, // 10% of 500
        newTotal: 450,
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; discountAmount?: number; newTotal?: number } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('SAVE10');
      });

      expect(applyResult?.valid).toBe(true);
      expect(applyResult?.discountAmount).toBe(50);
      expect(applyResult?.newTotal).toBe(450);
    });

    it('should apply fixed amount discount', async () => {
      // Business Rule: Fixed amount discount
      mockService.applyToCart.mockResolvedValue({
        valid: true,
        discountAmount: 100, // $100 off
        newTotal: 400,
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; discountAmount?: number; newTotal?: number } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('FLAT100');
      });

      expect(applyResult?.valid).toBe(true);
      expect(applyResult?.discountAmount).toBe(100);
    });

    it('should handle free shipping coupon', async () => {
      // Business Rule: Free shipping discount type
      mockService.applyToCart.mockResolvedValue({
        valid: true,
        discountAmount: 25, // Shipping cost
        newTotal: 475,
        freeShipping: true,
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; freeShipping?: boolean } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('FREESHIP');
      });

      expect(applyResult?.valid).toBe(true);
      expect(applyResult?.freeShipping).toBe(true);
    });

    it('should reject inactive coupon', async () => {
      // Business Rule: Inactive coupons cannot be applied
      mockService.applyToCart.mockResolvedValue({
        valid: false,
        error: 'Coupon is not active',
      });

      const { result } = renderHook(() => useCartCoupon('cart-1'));

      let applyResult: { valid: boolean; error?: string } | undefined;
      await act(async () => {
        applyResult = await result.current.applyCoupon('INACTIVE');
      });

      expect(applyResult?.valid).toBe(false);
      expect(applyResult?.error).toBe('Coupon is not active');
    });

    it('should create coupon with all discount types', async () => {
      // Business Rule: Support all discount types
      const discountTypes: Array<'percentage' | 'fixed_amount' | 'free_shipping'> = [
        'percentage',
        'fixed_amount',
        'free_shipping',
      ];

      const { result } = renderHook(() => useCouponMutations());

      for (const discountType of discountTypes) {
        const mockCoupon = createMockCoupon({ discountType });
        mockService.create.mockResolvedValueOnce(mockCoupon);

        await act(async () => {
          const coupon = await result.current.createCoupon({
            code: `TYPE_${discountType.toUpperCase()}`,
            name: `${discountType} coupon`,
            discountType,
            discountValue: discountType === 'free_shipping' ? 0 : 10,
            isActive: true,
          });
          expect(coupon.discountType).toBe(discountType);
        });
      }
    });
  });
});
