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
function createCouponAPIResponse(coupon: ReturnType<typeof createMockCoupon>) {
  return {
    data: {
      id: coupon.id,
      type: 'coupons',
      attributes: {
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_order_amount: coupon.minimumOrderAmount,
        max_discount: coupon.maximumDiscount,
        usage_limit: coupon.usageLimit,
        usage_count: coupon.usageCount,
        start_date: coupon.startsAt,
        end_date: coupon.expiresAt,
        is_active: coupon.isActive,
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
                discount_type: mockCoupon.discountType,
                discount_value: mockCoupon.discountValue,
                min_order_amount: mockCoupon.minimumOrderAmount,
                max_discount: mockCoupon.maximumDiscount,
                usage_limit: mockCoupon.usageLimit,
                usage_count: mockCoupon.usageCount,
                start_date: mockCoupon.startsAt,
                end_date: mockCoupon.expiresAt,
                is_active: mockCoupon.isActive,
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
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 100,
        maxDiscount: 50,
        usageLimit: 100,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        isActive: true,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/coupons', {
        data: {
          type: 'coupons',
          attributes: {
            code: 'SAVE10',
            name: '10% Discount',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 100,
            maxDiscount: 50,
            usageLimit: 100,
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            isActive: true,
          },
        },
      });
      expect(result.discountType).toBe('percentage');
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
        discountType: 'fixed_amount',
        discountValue: 50,
        minOrderAmount: null,
        maxDiscount: null,
        usageLimit: null,
        startDate: null,
        endDate: null,
        isActive: true,
      });

      // Assert
      expect(result.discountType).toBe('fixed_amount');
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
        discountType: 'free_shipping',
        discountValue: 0,
        minOrderAmount: 200,
        maxDiscount: null,
        usageLimit: null,
        startDate: null,
        endDate: null,
        isActive: true,
      });

      // Assert
      expect(result.discountType).toBe('free_shipping');
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
    it('should transform camelCase attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test Coupon',
          discountType: 'percentage',
          discountValue: 15,
          minOrderAmount: 100,
          maxDiscount: 30,
          usageLimit: 50,
          usageCount: 10,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T23:59:59Z',
          isActive: true,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.discountType).toBe('percentage');
      expect(result.minOrderAmount).toBe(100);
      expect(result.maxDiscount).toBe(30);
      expect(result.usageCount).toBe(10);
    });

    it('should transform snake_case attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test Coupon',
          discount_type: 'fixed_amount',
          discount_value: 25,
          min_order_amount: null,
          max_discount: null,
          usage_limit: null,
          usage_count: 5,
          start_date: null,
          end_date: null,
          is_active: false,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.discountType).toBe('fixed_amount');
      expect(result.minOrderAmount).toBeNull();
      expect(result.isActive).toBe(false);
    });

    it('should default usageCount to 0 when missing', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'coupons',
        attributes: {
          code: 'TEST',
          name: 'Test',
          discount_type: 'percentage',
          discount_value: 10,
        },
      };

      // Act
      const result = couponsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.usageCount).toBe(0);
    });
  });
});
