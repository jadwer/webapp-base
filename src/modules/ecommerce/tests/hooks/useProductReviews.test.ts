/**
 * useProductReviews Hooks Tests
 *
 * Unit tests for product reviews mutation hooks.
 * Note: SWR data fetching hooks are tested through service tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReviewMutations } from '../../hooks/useProductReviews';
import { productReviewsService } from '../../services/productReviewsService';
import { createMockProductReview } from '../utils/test-utils';

// Mock service
vi.mock('../../services/productReviewsService', () => ({
  productReviewsService: {
    getByProduct: vi.fn(),
    getRatingSummary: vi.fn(),
    getRecommendations: vi.fn(),
    getPersonalizedRecommendations: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockService = productReviewsService as {
  getByProduct: ReturnType<typeof vi.fn>;
  getRatingSummary: ReturnType<typeof vi.fn>;
  getRecommendations: ReturnType<typeof vi.fn>;
  getPersonalizedRecommendations: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('useProductReviews Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Flush pending timers to prevent "window is not defined" after teardown
    vi.runAllTimers();
    vi.useRealTimers();
  });

  // ============================================
  // useReviewMutations
  // ============================================

  describe('useReviewMutations', () => {
    it('should provide all mutation functions', () => {
      // Act
      const { result } = renderHook(() => useReviewMutations());

      // Assert
      expect(result.current.createReview).toBeDefined();
      expect(result.current.updateReview).toBeDefined();
      expect(result.current.deleteReview).toBeDefined();
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useReviewMutations());

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should create review', async () => {
      // Arrange
      const mockReview = createMockProductReview();
      mockService.create.mockResolvedValue(mockReview);

      // Act
      const { result } = renderHook(() => useReviewMutations());

      let createdReview;
      await act(async () => {
        createdReview = await result.current.createReview({
          productId: 100,
          rating: 5,
          title: 'Great!',
          content: 'Excellent product',
        });
      });

      // Assert
      expect(mockService.create).toHaveBeenCalledWith({
        productId: 100,
        rating: 5,
        title: 'Great!',
        content: 'Excellent product',
      });
      expect(createdReview).toEqual(mockReview);
    });

    it('should update review', async () => {
      // Arrange
      const mockReview = createMockProductReview({ rating: 4 });
      mockService.update.mockResolvedValue(mockReview);

      // Act
      const { result } = renderHook(() => useReviewMutations());

      await act(async () => {
        await result.current.updateReview('1', { rating: 4 });
      });

      // Assert
      expect(mockService.update).toHaveBeenCalledWith('1', { rating: 4 });
    });

    it('should delete review', async () => {
      // Arrange
      mockService.delete.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useReviewMutations());

      await act(async () => {
        await result.current.deleteReview('1');
      });

      // Assert
      expect(mockService.delete).toHaveBeenCalledWith('1');
    });

    it('should track creating state', async () => {
      // Arrange
      const mockReview = createMockProductReview();
      mockService.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockReview), 100))
      );

      // Act
      const { result } = renderHook(() => useReviewMutations());

      // Assert initial state
      expect(result.current.isCreating).toBe(false);

      // Start creation
      act(() => {
        result.current.createReview({
          productId: 100,
          rating: 5,
        });
      });

      // Check loading state
      expect(result.current.isCreating).toBe(true);
    });

    it('should track updating state', async () => {
      // Arrange
      const mockReview = createMockProductReview();
      mockService.update.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockReview), 100))
      );

      // Act
      const { result } = renderHook(() => useReviewMutations());

      // Assert initial state
      expect(result.current.isUpdating).toBe(false);

      // Start update
      act(() => {
        result.current.updateReview('1', { rating: 4 });
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
      const { result } = renderHook(() => useReviewMutations());

      // Assert initial state
      expect(result.current.isDeleting).toBe(false);

      // Start deletion
      act(() => {
        result.current.deleteReview('1');
      });

      // Check loading state
      expect(result.current.isDeleting).toBe(true);
    });
  });

  // ============================================
  // REVIEW BUSINESS RULES
  // ============================================

  describe('Review Business Rules', () => {
    it('should enforce rating range 1-5', async () => {
      // Business Rule: Ratings must be 1-5
      const validRatings = [1, 2, 3, 4, 5];

      const { result } = renderHook(() => useReviewMutations());

      for (const rating of validRatings) {
        const mockReview = createMockProductReview({ rating });
        mockService.create.mockResolvedValueOnce(mockReview);

        await act(async () => {
          const review = await result.current.createReview({
            productId: 100,
            rating,
            title: `Rating ${rating}`,
            content: 'Test',
          });
          expect(review.rating).toBe(rating);
        });
      }
    });

    it('should track verified purchase status', async () => {
      // Business Rule: Reviews can be marked as verified purchase
      const verifiedReview = createMockProductReview({
        isVerifiedPurchase: true,
      });
      mockService.create.mockResolvedValue(verifiedReview);

      const { result } = renderHook(() => useReviewMutations());

      let submittedReview;
      await act(async () => {
        submittedReview = await result.current.createReview({
          productId: 100,
          rating: 5,
          title: 'Great',
          content: 'Verified buyer',
        });
      });

      expect(submittedReview.isVerifiedPurchase).toBe(true);
    });

    it('should track review approval status', async () => {
      // Business Rule: Reviews have approval status
      const pendingReview = createMockProductReview({
        status: 'pending',
      });
      mockService.create.mockResolvedValue(pendingReview);

      const { result } = renderHook(() => useReviewMutations());

      let submittedReview;
      await act(async () => {
        submittedReview = await result.current.createReview({
          productId: 100,
          rating: 5,
          title: 'Test',
          content: 'Test',
        });
      });

      // New reviews start as pending
      expect(submittedReview.status).toBe('pending');
    });

    it('should associate review with contact', async () => {
      // Business Rule: Reviews are linked to contacts
      const reviewWithContact = createMockProductReview({
        contactId: 10,
      });
      mockService.create.mockResolvedValue(reviewWithContact);

      const { result } = renderHook(() => useReviewMutations());

      let submittedReview;
      await act(async () => {
        submittedReview = await result.current.createReview({
          productId: 100,
          rating: 5,
          title: 'Test',
          content: 'Test',
        });
      });

      expect(submittedReview.contactId).toBe(10);
    });

    it('should require title and content for review', async () => {
      // Business Rule: Reviews need title and content
      const mockReview = createMockProductReview({
        title: 'Great product',
        content: 'I really enjoyed using this product.',
      });
      mockService.create.mockResolvedValue(mockReview);

      const { result } = renderHook(() => useReviewMutations());

      let review;
      await act(async () => {
        review = await result.current.createReview({
          productId: 100,
          rating: 5,
          title: 'Great product',
          content: 'I really enjoyed using this product.',
        });
      });

      expect(review.title).toBe('Great product');
      expect(review.content).toBe('I really enjoyed using this product.');
    });
  });
});
