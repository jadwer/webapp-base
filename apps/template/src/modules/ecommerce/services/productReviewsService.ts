/**
 * Product Reviews Service
 *
 * Service layer for product reviews operations.
 */

import axiosClient from '@/lib/axiosClient';

export interface ProductReview {
  id: string;
  productId: number;
  userId: number;
  rating: number;
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title?: string;
  content?: string;
}

interface JsonApiReview {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

export const productReviewsService = {
  /**
   * Get reviews for a product
   */
  async getByProduct(productId: number, approvedOnly: boolean = true): Promise<ProductReview[]> {
    const params: Record<string, string | number | boolean> = {
      'filter[product_id]': productId,
      sort: '-createdAt'
    };

    if (approvedOnly) {
      params['filter[is_approved]'] = true;
    }

    const response = await axiosClient.get('/api/v1/product-reviews', { params });

    return (response.data.data || []).map((item: JsonApiReview) => this.transformFromAPI(item));
  },

  /**
   * Get rating summary for a product
   */
  async getRatingSummary(productId: number): Promise<RatingSummary> {
    const response = await axiosClient.get(`/api/v1/products/${productId}/rating-summary`);

    return {
      averageRating: response.data.averageRating || response.data.average_rating || 0,
      totalReviews: response.data.totalReviews || response.data.total_reviews || 0,
      distribution: response.data.distribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    };
  },

  /**
   * Create a review
   */
  async create(data: CreateReviewRequest): Promise<ProductReview> {
    const response = await axiosClient.post('/api/v1/product-reviews', {
      data: {
        type: 'product-reviews',
        attributes: {
          productId: data.productId,
          rating: data.rating,
          title: data.title,
          content: data.content
        }
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Update a review
   */
  async update(id: string, data: { rating?: number; title?: string; content?: string }): Promise<ProductReview> {
    const response = await axiosClient.patch(`/api/v1/product-reviews/${id}`, {
      data: {
        type: 'product-reviews',
        id,
        attributes: data
      }
    });

    return this.transformFromAPI(response.data.data);
  },

  /**
   * Delete a review
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/product-reviews/${id}`);
  },

  /**
   * Get product recommendations
   */
  async getRecommendations(productId: number): Promise<{
    frequentlyBoughtTogether: Array<{ id: number; name: string; price: number }>;
    similarProducts: Array<{ id: number; name: string; price: number }>;
    customersAlsoViewed: Array<{ id: number; name: string; price: number }>;
  }> {
    const response = await axiosClient.get(`/api/v1/products/${productId}/recommendations`);

    return {
      frequentlyBoughtTogether: response.data.frequently_bought_together || [],
      similarProducts: response.data.similar_products || [],
      customersAlsoViewed: response.data.customers_also_viewed || []
    };
  },

  /**
   * Get personalized recommendations for logged-in user
   */
  async getPersonalizedRecommendations(): Promise<Array<{ id: number; name: string; price: number }>> {
    const response = await axiosClient.get('/api/v1/recommendations/personalized');
    return response.data.data || [];
  },

  /**
   * Transform API response to ProductReview
   */
  transformFromAPI(item: JsonApiReview): ProductReview {
    const attrs = item.attributes;
    return {
      id: item.id,
      productId: (attrs.productId || attrs.product_id) as number,
      userId: (attrs.userId || attrs.user_id) as number,
      rating: attrs.rating as number,
      title: attrs.title as string | null,
      content: attrs.content as string | null,
      isVerifiedPurchase: (attrs.isVerifiedPurchase || attrs.is_verified_purchase || false) as boolean,
      isApproved: (attrs.isApproved || attrs.is_approved || false) as boolean,
      createdAt: (attrs.createdAt || attrs.created_at) as string
    };
  }
};
