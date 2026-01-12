/**
 * useWishlist Hooks Tests
 *
 * Unit tests for wishlist SWR hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWishlistMutations,
} from '../../hooks/useWishlist';
import { wishlistService } from '../../services/wishlistService';
import { createMockWishlist, createMockWishlistItem } from '../utils/test-utils';

// Mock service
vi.mock('../../services/wishlistService', () => ({
  wishlistService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getItems: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    moveToCart: vi.fn(),
  },
}));

const mockService = wishlistService as {
  getAll: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getItems: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  addItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  moveToCart: ReturnType<typeof vi.fn>;
};

describe('useWishlist Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // useWishlistMutations
  // ============================================

  describe('useWishlistMutations', () => {
    it('should provide all mutation functions', () => {
      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert
      expect(result.current.createWishlist).toBeDefined();
      expect(result.current.updateWishlist).toBeDefined();
      expect(result.current.deleteWishlist).toBeDefined();
      expect(result.current.addItem).toBeDefined();
      expect(result.current.removeItem).toBeDefined();
      expect(result.current.moveToCart).toBeDefined();
    });

    it('should provide loading states', () => {
      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isAddingItem).toBe(false);
      expect(result.current.isRemovingItem).toBe(false);
      expect(result.current.isMovingToCart).toBe(false);
    });

    it('should track creating state', async () => {
      // Arrange
      const mockWishlist = createMockWishlist();
      mockService.create.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockWishlist), 100))
      );

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert initial state
      expect(result.current.isCreating).toBe(false);

      // Start creation
      act(() => {
        result.current.createWishlist({ name: 'New List' });
      });

      // Check loading state
      expect(result.current.isCreating).toBe(true);
    });

    it('should create wishlist', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ name: 'New List' });
      mockService.create.mockResolvedValue(mockWishlist);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      let createdWishlist;
      await act(async () => {
        createdWishlist = await result.current.createWishlist({
          name: 'New List',
          isPublic: false,
        });
      });

      // Assert
      expect(mockService.create).toHaveBeenCalledWith({
        name: 'New List',
        isPublic: false,
      });
      expect(createdWishlist).toEqual(mockWishlist);
    });

    it('should update wishlist', async () => {
      // Arrange
      const mockWishlist = createMockWishlist({ name: 'Updated' });
      mockService.update.mockResolvedValue(mockWishlist);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      await act(async () => {
        await result.current.updateWishlist('1', { name: 'Updated' });
      });

      // Assert
      expect(mockService.update).toHaveBeenCalledWith('1', { name: 'Updated' });
    });

    it('should delete wishlist', async () => {
      // Arrange
      mockService.delete.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      await act(async () => {
        await result.current.deleteWishlist('1');
      });

      // Assert
      expect(mockService.delete).toHaveBeenCalledWith('1');
    });

    it('should add item to wishlist', async () => {
      // Arrange
      const mockItem = createMockWishlistItem();
      mockService.addItem.mockResolvedValue(mockItem);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      await act(async () => {
        await result.current.addItem(1, 100, 'Notes');
      });

      // Assert
      expect(mockService.addItem).toHaveBeenCalledWith(1, 100, 'Notes');
    });

    it('should remove item from wishlist', async () => {
      // Arrange
      mockService.removeItem.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      await act(async () => {
        await result.current.removeItem('item-1');
      });

      // Assert
      expect(mockService.removeItem).toHaveBeenCalledWith('item-1');
    });

    it('should move item to cart', async () => {
      // Arrange
      mockService.moveToCart.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      await act(async () => {
        await result.current.moveToCart('item-1');
      });

      // Assert
      expect(mockService.moveToCart).toHaveBeenCalledWith('item-1');
    });

    it('should track deleting state', async () => {
      // Arrange
      mockService.delete.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert initial state
      expect(result.current.isDeleting).toBe(false);

      // Start deletion
      act(() => {
        result.current.deleteWishlist('1');
      });

      // Check loading state
      expect(result.current.isDeleting).toBe(true);
    });

    it('should track adding item state', async () => {
      // Arrange
      const mockItem = createMockWishlistItem();
      mockService.addItem.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockItem), 100))
      );

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert initial state
      expect(result.current.isAddingItem).toBe(false);

      // Start adding
      act(() => {
        result.current.addItem(1, 100);
      });

      // Check loading state
      expect(result.current.isAddingItem).toBe(true);
    });

    it('should track removing item state', async () => {
      // Arrange
      mockService.removeItem.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      // Act
      const { result } = renderHook(() => useWishlistMutations());

      // Assert initial state
      expect(result.current.isRemovingItem).toBe(false);

      // Start removing
      act(() => {
        result.current.removeItem('item-1');
      });

      // Check loading state
      expect(result.current.isRemovingItem).toBe(true);
    });
  });

  // ============================================
  // WISHLIST BUSINESS RULES
  // ============================================

  describe('Wishlist Business Rules', () => {
    it('should support public and private wishlists', async () => {
      // Business Rule: Wishlists can be public or private
      const publicWishlist = createMockWishlist({ isPublic: true });
      const privateWishlist = createMockWishlist({ isPublic: false });
      mockService.create.mockResolvedValueOnce(publicWishlist);
      mockService.create.mockResolvedValueOnce(privateWishlist);

      const { result } = renderHook(() => useWishlistMutations());

      let createdPublic, createdPrivate;
      await act(async () => {
        createdPublic = await result.current.createWishlist({
          name: 'Public List',
          isPublic: true,
        });
      });

      await act(async () => {
        createdPrivate = await result.current.createWishlist({
          name: 'Private List',
          isPublic: false,
        });
      });

      expect(createdPublic.isPublic).toBe(true);
      expect(createdPrivate.isPublic).toBe(false);
    });

    it('should support item notes', async () => {
      // Business Rule: Items can have optional notes
      const mockItem = createMockWishlistItem({ notes: 'Want this for birthday' });
      mockService.addItem.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useWishlistMutations());

      let addedItem;
      await act(async () => {
        addedItem = await result.current.addItem(1, 100, 'Want this for birthday');
      });

      expect(mockService.addItem).toHaveBeenCalledWith(1, 100, 'Want this for birthday');
      expect(addedItem.notes).toBe('Want this for birthday');
    });

    it('should track item added date', async () => {
      // Business Rule: Items have addedAt timestamp
      const mockItem = createMockWishlistItem({
        addedAt: '2025-01-15T10:00:00Z',
      });
      mockService.addItem.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useWishlistMutations());

      let addedItem;
      await act(async () => {
        addedItem = await result.current.addItem(1, 100);
      });

      expect(addedItem.addedAt).toBe('2025-01-15T10:00:00Z');
    });
  });
});
