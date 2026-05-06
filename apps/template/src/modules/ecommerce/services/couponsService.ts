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
  description?: string;
  couponType: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minAmount: number | null;
  maxAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  customerIds?: number[];
  productIds?: number[];
  categoryIds?: number[];
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
  async create(data: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
    const response = await axiosClient.post('/api/v1/coupons', {
      data: {
        type: 'coupons',
        attributes: {
          code: data.code,
          name: data.name,
          description: data.description,
          couponType: data.couponType,
          value: data.value,
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          maxUses: data.maxUses,
          startsAt: data.startsAt,
          expiresAt: data.expiresAt,
          isActive: data.isActive,
          customerIds: data.customerIds,
          productIds: data.productIds,
          categoryIds: data.categoryIds
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
   * Backend uses camelCase in JSON:API attributes
   */
  transformFromAPI(item: JsonApiCoupon): Coupon {
    const attrs = item.attributes;
    return {
      id: item.id,
      code: attrs.code as string,
      name: attrs.name as string,
      description: attrs.description as string | undefined,
      couponType: attrs.couponType as Coupon['couponType'],
      value: attrs.value as number,
      minAmount: attrs.minAmount as number | null,
      maxAmount: attrs.maxAmount as number | null,
      maxUses: attrs.maxUses as number | null,
      usedCount: (attrs.usedCount || 0) as number,
      startsAt: attrs.startsAt as string | null,
      expiresAt: attrs.expiresAt as string | null,
      isActive: (attrs.isActive || false) as boolean,
      customerIds: attrs.customerIds as number[] | undefined,
      productIds: attrs.productIds as number[] | undefined,
      categoryIds: attrs.categoryIds as number[] | undefined
    };
  }
};
