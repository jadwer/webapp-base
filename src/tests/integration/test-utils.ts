/**
 * Integration Tests - Shared Utilities
 *
 * Common utilities for integration testing across modules
 */

import { vi } from 'vitest';

/**
 * Mock localStorage for browser APIs
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

/**
 * Mock authentication token
 */
export const mockAuthToken = (token = 'test-token-12345') => {
  const storage = mockLocalStorage();
  storage.setItem('auth_token', token);
  return storage;
};

/**
 * Create a mock API response with JSON:API format
 */
export function createMockResponse<T>(data: T, included: unknown[] = []) {
  return {
    data,
    included,
  };
}

/**
 * Create mock collection response
 */
export function createMockCollectionResponse<T>(
  data: T[],
  meta = { total: data.length, page: 1, perPage: 10 }
) {
  return {
    data,
    meta,
    links: {
      first: '/api/resource?page=1',
      last: `/api/resource?page=${Math.ceil(meta.total / meta.perPage)}`,
      prev: null,
      next: null,
    },
  };
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Delay helper for testing timing-dependent code
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock axios error
 */
export const createMockAxiosError = (status: number, message: string) => {
  return {
    response: {
      status,
      data: {
        errors: [
          {
            status: status.toString(),
            title: message,
            detail: message,
          },
        ],
      },
    },
    isAxiosError: true,
  };
};
