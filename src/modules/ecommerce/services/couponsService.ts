/**
 * Coupons Service
 *
 * Service layer for coupon operations and cart coupon application.
 */

import axiosClient from '@/lib/axiosClient';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface ApplyCouponResult {
  valid: boolean;
  discountAmount?: number;
  newTotal?: number;
  message?: string;
  error?: string;
}

interface JsonApiCoupon {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

export const couponsService = {
  // ===== ADMIN CRUD =====

  /**
   * Get all coupons
   */
  async getAll(params?: { isActive?: boolean }): Promise<Coupon[]> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.isActive !== undefined) {
      queryParams['filter[is_active]'] = params.isActive;
    }

    const response = await axiosClient.get('/api/v1/coupons', { params: queryParams });

    return (response.data.data || []).map((item: JsonApiCoupon) => this.transformFromAPI(item));
  },

  /**
   * Get coupon by ID
   */
  async getById(id: string): Promise<Coupon> {
    const response = await axiosClient.get(`/api/v1/coupons/${id}`);
    return this.transformFromAPI(response.data.data);
  },

  /**
   * Create a coupon
   */
  async create(data: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> {
    const response = await axiosClient.post('/api/v1/coupons', {
      data: {
        type: 'coupons',
        attributes: {
          code: data.code,
          name: data.name,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive
        }
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Update a coupon
   */
  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const response = await axiosClient.patch(`/api/v1/coupons/${id}`, {
      data: {
        type: 'coupons',
        id,
        attributes: data
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Delete a coupon
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/coupons/${id}`);
  },

  // ===== CART COUPON APPLICATION =====

  /**
   * Apply coupon to shopping cart
   */
  async applyToCart(cartId: string, couponCode: string): Promise<ApplyCouponResult> {
    try {
      const response = await axiosClient.post(`/api/v1/shopping-carts/${cartId}/apply-coupon`, {
        coupon_code: couponCode
      });

      return {
        valid: response.data.valid !== false,
        discountAmount: response.data.discount_amount,
        newTotal: response.data.new_total,
        message: response.data.message
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        return {
          valid: false,
          error: axiosError.response?.data?.error || 'Invalid coupon'
        };
      }
      throw error;
    }
  },

  /**
   * Remove coupon from shopping cart
   */
  async removeFromCart(cartId: string): Promise<void> {
    await axiosClient.post(`/api/v1/shopping-carts/${cartId}/remove-coupon`);
  },

  /**
   * Validate coupon code without applying
   */
  async validate(couponCode: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    try {
      const response = await axiosClient.get(`/api/v1/coupons/validate/${couponCode}`);
      return {
        valid: true,
        coupon: this.transformFromAPI(response.data.data)
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        return {
          valid: false,
          error: axiosError.response?.data?.error || 'Invalid coupon'
        };
      }
      throw error;
    }
  },

  /**
   * Transform API response to Coupon
   */
  transformFromAPI(item: JsonApiCoupon): Coupon {
    const attrs = item.attributes;
    return {
      id: item.id,
      code: attrs.code as string,
      name: attrs.name as string,
      discountType: (attrs.discountType || attrs.discount_type) as Coupon['discountType'],
      discountValue: (attrs.discountValue || attrs.discount_value) as number,
      minOrderAmount: (attrs.minOrderAmount || attrs.min_order_amount) as number | null,
      maxDiscount: (attrs.maxDiscount || attrs.max_discount) as number | null,
      usageLimit: (attrs.usageLimit || attrs.usage_limit) as number | null,
      usageCount: (attrs.usageCount || attrs.usage_count || 0) as number,
      startDate: (attrs.startDate || attrs.start_date) as string | null,
      endDate: (attrs.endDate || attrs.end_date) as string | null,
      isActive: (attrs.isActive || attrs.is_active || false) as boolean
    };
  }
};
