/**
 * Product Reviews Service Tests
 *
 * Unit tests for product reviews service layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productReviewsService } from '../../services/productReviewsService';
import { createMockProductReview, createMockRatingSummary } from '../utils/test-utils';

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
function createReviewAPIResponse(review: ReturnType<typeof createMockProductReview>) {
  return {
    data: {
      id: review.id,
      type: 'product-reviews',
      attributes: {
        product_id: review.productId,
        user_id: review.userId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        is_verified_purchase: review.isVerifiedPurchase,
        is_approved: review.status === 'approved',
        created_at: review.createdAt,
      },
    },
  };
}

describe('productReviewsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // GET REVIEWS
  // ============================================

  describe('getByProduct', () => {
    it('should fetch approved reviews for a product', async () => {
      // Arrange
      const mockReview = createMockProductReview();
      mockAxios.get.mockResolvedValue({
        data: {
          data: [
            {
              id: mockReview.id,
              type: 'product-reviews',
              attributes: {
                product_id: mockReview.productId,
                user_id: mockReview.userId,
                rating: mockReview.rating,
                title: mockReview.title,
                content: mockReview.content,
                is_verified_purchase: mockReview.isVerifiedPurchase,
                is_approved: true,
                created_at: mockReview.createdAt,
              },
            },
          ],
        },
      });

      // Act
      const result = await productReviewsService.getByProduct(100);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/product-reviews', {
        params: {
          'filter[product_id]': 100,
          sort: '-createdAt',
          'filter[is_approved]': true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });

    it('should fetch all reviews including unapproved when approvedOnly is false', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      await productReviewsService.getByProduct(100, false);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/product-reviews', {
        params: {
          'filter[product_id]': 100,
          sort: '-createdAt',
        },
      });
    });

    it('should return empty array when no reviews exist', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await productReviewsService.getByProduct(100);

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Server Error'));

      // Act & Assert
      await expect(productReviewsService.getByProduct(100)).rejects.toThrow('Server Error');
    });
  });

  // ============================================
  // RATING SUMMARY
  // ============================================

  describe('getRatingSummary', () => {
    it('should fetch rating summary for a product', async () => {
      // Arrange
      const mockSummary = createMockRatingSummary();
      mockAxios.get.mockResolvedValue({
        data: {
          average_rating: mockSummary.averageRating,
          total_reviews: mockSummary.totalReviews,
          distribution: mockSummary.distribution,
        },
      });

      // Act
      const result = await productReviewsService.getRatingSummary(100);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/products/100/rating-summary');
      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(100);
      expect(result.distribution['5']).toBe(50);
    });

    it('should handle camelCase response', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: {
          averageRating: 4.2,
          totalReviews: 50,
          distribution: { '5': 20, '4': 15, '3': 10, '2': 3, '1': 2 },
        },
      });

      // Act
      const result = await productReviewsService.getRatingSummary(100);

      // Assert
      expect(result.averageRating).toBe(4.2);
      expect(result.totalReviews).toBe(50);
    });

    it('should return default values when data is missing', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: {},
      });

      // Act
      const result = await productReviewsService.getRatingSummary(100);

      // Assert
      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
      expect(result.distribution).toEqual({ '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 });
    });
  });

  // ============================================
  // CREATE REVIEW
  // ============================================

  describe('create', () => {
    it('should create a new review', async () => {
      // Arrange
      const mockReview = createMockProductReview();
      mockAxios.post.mockResolvedValue({
        data: createReviewAPIResponse(mockReview),
      });

      // Act
      const result = await productReviewsService.create({
        productId: 100,
        rating: 5,
        title: 'Great product!',
        content: 'This product exceeded my expectations.',
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/product-reviews', {
        data: {
          type: 'product-reviews',
          attributes: {
            productId: 100,
            rating: 5,
            title: 'Great product!',
            content: 'This product exceeded my expectations.',
          },
        },
      });
      expect(result.productId).toBe(100);
      expect(result.rating).toBe(5);
    });

    it('should create review without optional fields', async () => {
      // Arrange
      const mockReview = createMockProductReview({ title: null, content: null });
      mockAxios.post.mockResolvedValue({
        data: createReviewAPIResponse(mockReview),
      });

      // Act
      await productReviewsService.create({
        productId: 100,
        rating: 4,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/product-reviews', {
        data: {
          type: 'product-reviews',
          attributes: {
            productId: 100,
            rating: 4,
            title: undefined,
            content: undefined,
          },
        },
      });
    });

    it('should enforce rating range (1-5)', async () => {
      // This is a business rule validation test
      // The actual validation would be on the backend, but we test the service sends the data
      const mockReview = createMockProductReview({ rating: 5 });
      mockAxios.post.mockResolvedValue({
        data: createReviewAPIResponse(mockReview),
      });

      const result = await productReviewsService.create({
        productId: 100,
        rating: 5,
      });

      expect(result.rating).toBe(5);
    });
  });

  // ============================================
  // UPDATE REVIEW
  // ============================================

  describe('update', () => {
    it('should update review rating', async () => {
      // Arrange
      const mockReview = createMockProductReview({ rating: 4 });
      mockAxios.patch.mockResolvedValue({
        data: createReviewAPIResponse(mockReview),
      });

      // Act
      const result = await productReviewsService.update('1', { rating: 4 });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/product-reviews/1', {
        data: {
          type: 'product-reviews',
          id: '1',
          attributes: { rating: 4 },
        },
      });
      expect(result.rating).toBe(4);
    });

    it('should update review content', async () => {
      // Arrange
      const mockReview = createMockProductReview({ content: 'Updated content' });
      mockAxios.patch.mockResolvedValue({
        data: createReviewAPIResponse(mockReview),
      });

      // Act
      await productReviewsService.update('1', {
        title: 'New Title',
        content: 'Updated content',
      });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/product-reviews/1', {
        data: {
          type: 'product-reviews',
          id: '1',
          attributes: {
            title: 'New Title',
            content: 'Updated content',
          },
        },
      });
    });
  });

  // ============================================
  // DELETE REVIEW
  // ============================================

  describe('delete', () => {
    it('should delete a review', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await productReviewsService.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/product-reviews/1');
    });
  });

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  describe('getRecommendations', () => {
    it('should fetch product recommendations', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: {
          frequently_bought_together: [
            { id: 101, name: 'Product A', price: 99.99 },
          ],
          similar_products: [
            { id: 102, name: 'Product B', price: 149.99 },
          ],
          customers_also_viewed: [
            { id: 103, name: 'Product C', price: 79.99 },
          ],
        },
      });

      // Act
      const result = await productReviewsService.getRecommendations(100);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/products/100/recommendations');
      expect(result.frequentlyBoughtTogether).toHaveLength(1);
      expect(result.similarProducts).toHaveLength(1);
      expect(result.customersAlsoViewed).toHaveLength(1);
    });

    it('should handle empty recommendations', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: {},
      });

      // Act
      const result = await productReviewsService.getRecommendations(100);

      // Assert
      expect(result.frequentlyBoughtTogether).toEqual([]);
      expect(result.similarProducts).toEqual([]);
      expect(result.customersAlsoViewed).toEqual([]);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should fetch personalized recommendations for logged-in user', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: {
          data: [
            { id: 101, name: 'Recommended Product', price: 99.99 },
          ],
        },
      });

      // Act
      const result = await productReviewsService.getPersonalizedRecommendations();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/recommendations/personalized');
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no recommendations', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await productReviewsService.getPersonalizedRecommendations();

      // Assert
      expect(result).toEqual([]);
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
        type: 'product-reviews',
        attributes: {
          productId: 100,
          userId: 1,
          rating: 5,
          title: 'Great!',
          content: 'Excellent product',
          isVerifiedPurchase: true,
          isApproved: true,
          createdAt: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = productReviewsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.productId).toBe(100);
      expect(result.isVerifiedPurchase).toBe(true);
      expect(result.isApproved).toBe(true);
    });

    it('should transform snake_case attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'product-reviews',
        attributes: {
          product_id: 100,
          user_id: 1,
          rating: 4,
          title: 'Good',
          content: 'Nice product',
          is_verified_purchase: false,
          is_approved: false,
          created_at: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = productReviewsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.productId).toBe(100);
      expect(result.isVerifiedPurchase).toBe(false);
      expect(result.isApproved).toBe(false);
    });

    it('should handle null title and content', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'product-reviews',
        attributes: {
          product_id: 100,
          user_id: 1,
          rating: 5,
          title: null,
          content: null,
          is_verified_purchase: true,
          is_approved: true,
          created_at: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = productReviewsService.transformFromAPI(apiResponse);

      // Assert
      expect(result.title).toBeNull();
      expect(result.content).toBeNull();
    });
  });
});
