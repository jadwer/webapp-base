/**
 * Coupons Service Tests
 *
 * Unit tests for coupons service layer including business rules validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { couponsService } from '../../services/couponsService';
import { createMockCoupon } from '../utils/test-utils';

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
// The service transformFromAPI reads camelCase attributes from the backend
function createCouponAPIResponse(coupon: ReturnType<typeof createMockCoupon>) {
  return {
    data: {
      id: coupon.id,
      type: 'coupons',
      attributes: {
        code: coupon.code,
        name: coupon.name,
        couponType: coupon.discountType,
        value: coupon.discountValue,
        minAmount: coupon.minimumOrderAmount ?? null,
        maxAmount: coupon.maximumDiscount ?? null,
        maxUses: coupon.usageLimit ?? null,
        usedCount: coupon.usageCount,
        startsAt: coupon.startsAt ?? null,
        expiresAt: coupon.expiresAt ?? null,
        isActive: coupon.isActive,
      },
    },
  };
}

describe('couponsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // ADMIN CRUD
  // ============================================

  describe('getAll', () => {
    it('should fetch all coupons', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockAxios.get.mockResolvedValue({
        data: {
          data: [
            {
              id: mockCoupon.id,
              type: 'coupons',
              attributes: {
                code: mockCoupon.code,
                name: mockCoupon.name,
                couponType: mockCoupon.discountType,
                value: mockCoupon.discountValue,
                minAmount: mockCoupon.minimumOrderAmount ?? null,
                maxAmount: mockCoupon.maximumDiscount ?? null,
                maxUses: mockCoupon.usageLimit ?? null,
                usedCount: mockCoupon.usageCount,
                startsAt: mockCoupon.startsAt ?? null,
                expiresAt: mockCoupon.expiresAt ?? null,
                isActive: mockCoupon.isActive,
              },
            },
          ],
        },
      });

      // Act
      const result = await couponsService.getAll();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/coupons', { params: {} });
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('SAVE10');
    });

    it('should filter by active status', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      await couponsService.getAll({ isActive: true });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/coupons', {
        params: { 'filter[is_active]': true },
      });
    });

    it('should return empty array when no coupons exist', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await couponsService.getAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch coupon by ID', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockAxios.get.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/coupons/1');
      expect(result.code).toBe('SAVE10');
    });
  });

  describe('create', () => {
    it('should create a percentage coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockAxios.post.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.create({
        code: 'SAVE10',
        name: '10% Discount',
        couponType: 'percentage',
        value: 10,
        minAmount: 100,
        maxAmount: 50,
        maxUses: 100,
        startsAt: '2025-01-01T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
        isActive: true,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/coupons', {
        data: {
          type: 'coupons',
          attributes: {
            code: 'SAVE10',
            name: '10% Discount',
            couponType: 'percentage',
            value: 10,
            minAmount: 100,
            maxAmount: 50,
            maxUses: 100,
            startsAt: '2025-01-01T00:00:00Z',
            expiresAt: '2025-12-31T23:59:59Z',
            isActive: true,
          },
        },
      });
      expect(result.couponType).toBe('percentage');
    });

    it('should create a fixed amount coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon({
        discountType: 'fixed_amount',
        discountValue: 50,
      });
      mockAxios.post.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.create({
        code: 'FLAT50',
        name: '$50 Off',
        couponType: 'fixed_amount',
        value: 50,
        minAmount: null,
        maxAmount: null,
        maxUses: null,
        startsAt: null,
        expiresAt: null,
        isActive: true,
      });

      // Assert
      expect(result.couponType).toBe('fixed_amount');
    });

    it('should create a free shipping coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon({
        discountType: 'free_shipping',
        discountValue: 0,
      });
      mockAxios.post.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.create({
        code: 'FREESHIP',
        name: 'Free Shipping',
        couponType: 'free_shipping',
        value: 0,
        minAmount: 200,
        maxAmount: null,
        maxUses: null,
        startsAt: null,
        expiresAt: null,
        isActive: true,
      });

      // Assert
      expect(result.couponType).toBe('free_shipping');
    });
  });

  describe('update', () => {
    it('should update coupon', async () => {
      // Arrange
      const mockCoupon = createMockCoupon({ isActive: false });
      mockAxios.patch.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.update('1', { isActive: false });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/coupons/1', {
        data: {
          type: 'coupons',
          id: '1',
          attributes: { isActive: false },
        },
      });
      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete coupon', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await couponsService.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/coupons/1');
    });
  });

  // ============================================
  // CART COUPON APPLICATION - BUSINESS RULES
  // ============================================

  describe('applyToCart', () => {
    it('should apply valid coupon to cart', async () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        data: {
          valid: true,
          discount_amount: 50,
          new_total: 450,
          message: 'Coupon applied successfully',
        },
      });

      // Act
      const result = await couponsService.applyToCart('cart-1', 'SAVE10');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/shopping-carts/cart-1/apply-coupon', {
        coupon_code: 'SAVE10',
      });
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);
      expect(result.newTotal).toBe(450);
    });

    it('should return error for invalid coupon code', async () => {
      // Arrange - Business Rule: Invalid coupon code
      const error = {
        response: {
          data: { error: 'Coupon code not found' },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      // Act
      const result = await couponsService.applyToCart('cart-1', 'INVALID');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Coupon code not found');
    });

    it('should return error for expired coupon', async () => {
      // Arrange - Business Rule: Coupon expired
      const error = {
        response: {
          data: { error: 'Coupon has expired' },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      // Act
      const result = await couponsService.applyToCart('cart-1', 'EXPIRED');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Coupon has expired');
    });

    it('should return error when minimum order not met', async () => {
      // Arrange - Business Rule: Minimum order amount
      const error = {
        response: {
          data: { error: 'Minimum order amount not met' },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      // Act
      const result = await couponsService.applyToCart('cart-1', 'MINORDER');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Minimum order amount not met');
    });

    it('should return error when usage limit exceeded', async () => {
      // Arrange - Business Rule: Usage limit
      const error = {
        response: {
          data: { error: 'Coupon usage limit exceeded' },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      // Act
      const result = await couponsService.applyToCart('cart-1', 'MAXUSED');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Coupon usage limit exceeded');
    });

    it('should return default error for unknown errors', async () => {
      // Arrange
      const error = {
        response: {
          data: {},
        },
      };
      mockAxios.post.mockRejectedValue(error);

      // Act
      const result = await couponsService.applyToCart('cart-1', 'CODE');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid coupon');
    });

    it('should throw error for non-API errors', async () => {
      // Arrange
      mockAxios.post.mockRejectedValue(new Error('Network Error'));

      // Act & Assert
      await expect(couponsService.applyToCart('cart-1', 'CODE')).rejects.toThrow('Network Error');
    });
  });

  describe('removeFromCart', () => {
    it('should remove coupon from cart', async () => {
      // Arrange
      mockAxios.post.mockResolvedValue({});

      // Act
      await couponsService.removeFromCart('cart-1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/shopping-carts/cart-1/remove-coupon');
    });
  });

  // ============================================
  // COUPON VALIDATION
  // ============================================

  describe('validate', () => {
    it('should validate a valid coupon code', async () => {
      // Arrange
      const mockCoupon = createMockCoupon();
      mockAxios.get.mockResolvedValue({
        data: createCouponAPIResponse(mockCoupon),
      });

      // Act
      const result = await couponsService.validate('SAVE10');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/coupons/validate/SAVE10');
      expect(result.valid).toBe(true);
      expect(result.coupon?.code).toBe('SAVE10');
    });

    it('should return invalid for non-existent coupon', async () => {
      // Arrange
      const error = {
        response: {
          data: { error: 'Coupon not found' },
        },
      };
      mockAxios.get.mockRejectedValue(error);

      // Act
      const result = await couponsService.validate('INVALID');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Coupon not found');
      expect(result.coupon).toBeUndefined();
    });

    it('should throw error for network failures', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      // Act & Assert
      await expect(couponsService.validate('CODE')).rejects.toThrow('Network Error');
    });
  });

  // ============================================
  // TRANSFORMER
  // ============================================

  describe('transformFromAPI', () => {
    it('should transform camelCase attributes from backend', () => {
      // Arrange - backend sends camelCase attributes
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test Coupon',
          couponType: 'percentage',
          value: 15,
          minAmount: 100,
          maxAmount: 30,
          maxUses: 50,
          usedCount: 10,
          startsAt: '2025-01-01T00:00:00Z',
          expiresAt: '2025-12-31T23:59:59Z',
          isActive: true,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.couponType).toBe('percentage');
      expect(result.minAmount).toBe(100);
      expect(result.maxAmount).toBe(30);
      expect(result.usedCount).toBe(10);
    });

    it('should handle missing optional attributes gracefully', () => {
      // Arrange - backend may omit optional fields
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test Coupon',
          couponType: 'fixed_amount',
          value: 25,
          minAmount: null,
          maxAmount: null,
          maxUses: null,
          usedCount: 5,
          startsAt: null,
          expiresAt: null,
          isActive: false,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.couponType).toBe('fixed_amount');
      expect(result.minAmount).toBeNull();
      expect(result.isActive).toBe(false);
    });

    it('should default usedCount to 0 when missing', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test',
          couponType: 'percentage',
          value: 10,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.usedCount).toBe(0);
    });
  });
});
