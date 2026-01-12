/**
 * Wishlist Service Tests
 *
 * Unit tests for wishlist and wishlist items service layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wishlistService } from '../../services/wishlistService';
import { createMockWishlist, createMockWishlistItem } from '../utils/test-utils';

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
function createWishlistAPIResponse(wishlist: ReturnType<typeof createMockWishlist>) {
  return {
    data: {
      id: wishlist.id,
      type: 'wishlists',
      attributes: {
        user_id: wishlist.userId,
        name: wishlist.name,
        is_public: wishlist.isPublic,
        share_token: null,
        created_at: wishlist.createdAt,
      },
    },
  };
}

function createWishlistItemAPIResponse(item: ReturnType<typeof createMockWishlistItem>) {
  return {
    data: {
      id: item.id,
      type: 'wishlist-items',
      attributes: {
        wishlist_id: item.wishlistId,
        product_id: item.productId,
        product_variant_id: null,
        added_at: item.addedAt,
        notes: null,
      },
    },
  };
}

describe('wishlistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // WISHLISTS
  // ============================================

  describe('getAll', () => {
    it('should fetch all wishlists for current user', async () => {
      // Arrange
      const mockWishlist = createMockWishlist();
      mockAxios.get.mockResolvedValue({
        data: {
          data: [
            {
              id: mockWishlist.id,
              type: 'wishlists',
              attributes: {
                user_id: mockWishlist.userId,
                name: mockWishlist.name,
                is_public: mockWishlist.isPublic,
                share_token: null,
                created_at: mockWishlist.createdAt,
              },
            },
          ],
        },
      });

      // Act
      const result = await wishlistService.getAll();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/wishlists', {
        params: { 'filter[user_id]': 'current' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mi Lista de Deseos');
    });

    it('should return empty array when no wishlists exist', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await wishlistService.getAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Server Error'));

      // Act & Assert
      await expect(wishlistService.getAll()).rejects.toThrow('Server Error');
    });
  });

  describe('getById', () => {
    it('should fetch wishlist by ID with includes', async () => {
      // Arrange
      const mockWishlist = createMockWishlist();
      mockAxios.get.mockResolvedValue({
        data: createWishlistAPIResponse(mockWishlist),
      });

      // Act
      const result = await wishlistService.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/wishlists/1', {
        params: { include: 'items,items.product' },
      });
      expect(result.id).toBe('1');
      expect(result.name).toBe('Mi Lista de Deseos');
    });
  });

  describe('create', () => {
    it('should create a new wishlist', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ name: 'Nueva Lista' });
      mockAxios.post.mockResolvedValue({
        data: createWishlistAPIResponse(mockWishlist),
      });

      // Act
      const result = await wishlistService.create({
        name: 'Nueva Lista',
        isPublic: false,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/wishlists', {
        data: {
          type: 'wishlists',
          attributes: {
            name: 'Nueva Lista',
            isPublic: false,
          },
        },
      });
      expect(result.name).toBe('Nueva Lista');
    });

    it('should create public wishlist', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ isPublic: true });
      mockAxios.post.mockResolvedValue({
        data: createWishlistAPIResponse(mockWishlist),
      });

      // Act
      const result = await wishlistService.create({
        name: 'Lista Publica',
        isPublic: true,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/wishlists', {
        data: {
          type: 'wishlists',
          attributes: {
            name: 'Lista Publica',
            isPublic: true,
          },
        },
      });
      expect(result.isPublic).toBe(true);
    });
  });

  describe('update', () => {
    it('should update wishlist name', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ name: 'Updated Name' });
      mockAxios.patch.mockResolvedValue({
        data: createWishlistAPIResponse(mockWishlist),
      });

      // Act
      const result = await wishlistService.update('1', { name: 'Updated Name' });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/wishlists/1', {
        data: {
          type: 'wishlists',
          id: '1',
          attributes: { name: 'Updated Name' },
        },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should update wishlist visibility', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ isPublic: true });
      mockAxios.patch.mockResolvedValue({
        data: createWishlistAPIResponse(mockWishlist),
      });

      // Act
      await wishlistService.update('1', { isPublic: true });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/wishlists/1', {
        data: {
          type: 'wishlists',
          id: '1',
          attributes: { isPublic: true },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete wishlist', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await wishlistService.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/wishlists/1');
    });
  });

  // ============================================
  // WISHLIST ITEMS
  // ============================================

  describe('getItems', () => {
    it('should fetch items for a wishlist', async () => {
      // Arrange
      const mockItem = createMockWishlistItem();
      mockAxios.get.mockResolvedValue({
        data: {
          data: [
            {
              id: mockItem.id,
              type: 'wishlist-items',
              attributes: {
                wishlist_id: mockItem.wishlistId,
                product_id: mockItem.productId,
                product_variant_id: null,
                added_at: mockItem.addedAt,
                notes: null,
              },
            },
          ],
        },
      });

      // Act
      const result = await wishlistService.getItems('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/wishlist-items', {
        params: {
          'filter[wishlist_id]': '1',
          include: 'product',
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(100);
    });

    it('should return empty array when wishlist has no items', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: { data: [] },
      });

      // Act
      const result = await wishlistService.getItems('1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add item to wishlist', async () => {
      // Arrange
      const mockItem = createMockWishlistItem();
      mockAxios.post.mockResolvedValue({
        data: createWishlistItemAPIResponse(mockItem),
      });

      // Act
      const result = await wishlistService.addItem(1, 100);

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/wishlist-items', {
        data: {
          type: 'wishlist-items',
          attributes: {
            wishlistId: 1,
            productId: 100,
            notes: undefined,
          },
        },
      });
      expect(result.productId).toBe(100);
    });

    it('should add item with notes', async () => {
      // Arrange
      const mockItem = createMockWishlistItem();
      mockAxios.post.mockResolvedValue({
        data: createWishlistItemAPIResponse(mockItem),
      });

      // Act
      await wishlistService.addItem(1, 100, 'Regalo para navidad');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/wishlist-items', {
        data: {
          type: 'wishlist-items',
          attributes: {
            wishlistId: 1,
            productId: 100,
            notes: 'Regalo para navidad',
          },
        },
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await wishlistService.removeItem('item-1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/wishlist-items/item-1');
    });
  });

  describe('moveToCart', () => {
    it('should move item to shopping cart', async () => {
      // Arrange
      mockAxios.post.mockResolvedValue({});

      // Act
      await wishlistService.moveToCart('item-1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/wishlist-items/item-1/move-to-cart');
    });
  });

  // ============================================
  // TRANSFORMERS
  // ============================================

  describe('transformWishlistFromAPI', () => {
    it('should transform camelCase attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'wishlists',
        attributes: {
          userId: 1,
          name: 'Test',
          isPublic: true,
          shareToken: 'token123',
          createdAt: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = wishlistService.transformWishlistFromAPI(apiResponse);

      // Assert
      expect(result.userId).toBe(1);
      expect(result.isPublic).toBe(true);
      expect(result.shareToken).toBe('token123');
    });

    it('should transform snake_case attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'wishlists',
        attributes: {
          user_id: 1,
          name: 'Test',
          is_public: false,
          share_token: null,
          created_at: '2025-01-15T10:00:00Z',
        },
      };

      // Act
      const result = wishlistService.transformWishlistFromAPI(apiResponse);

      // Assert
      expect(result.userId).toBe(1);
      expect(result.isPublic).toBe(false);
      expect(result.shareToken).toBeNull();
    });
  });

  describe('transformItemFromAPI', () => {
    it('should transform item with camelCase attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'wishlist-items',
        attributes: {
          wishlistId: 1,
          productId: 100,
          productVariantId: 5,
          addedAt: '2025-01-15T10:00:00Z',
          notes: 'Test notes',
        },
      };

      // Act
      const result = wishlistService.transformItemFromAPI(apiResponse);

      // Assert
      expect(result.wishlistId).toBe(1);
      expect(result.productId).toBe(100);
      expect(result.productVariantId).toBe(5);
      expect(result.notes).toBe('Test notes');
    });

    it('should transform item with snake_case attributes', () => {
      // Arrange
      const apiResponse = {
        id: '1',
        type: 'wishlist-items',
        attributes: {
          wishlist_id: 1,
          product_id: 100,
          product_variant_id: null,
          added_at: '2025-01-15T10:00:00Z',
          notes: null,
        },
      };

      // Act
      const result = wishlistService.transformItemFromAPI(apiResponse);

      // Assert
      expect(result.wishlistId).toBe(1);
      expect(result.productId).toBe(100);
      expect(result.productVariantId).toBeNull();
      expect(result.notes).toBeNull();
    });
  });
});
