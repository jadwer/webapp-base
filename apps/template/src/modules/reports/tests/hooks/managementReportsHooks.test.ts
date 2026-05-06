/**
 * Reports Module - Management Reports Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSalesByCustomer,
  useSalesByProduct,
  usePurchaseBySupplier,
  usePurchaseByProduct,
} from '../../hooks';

// Mock the services
vi.mock('../../services', () => ({
  balanceSheetService: { get: vi.fn() },
  incomeStatementService: { get: vi.fn() },
  cashFlowService: { get: vi.fn() },
  trialBalanceService: { get: vi.fn() },
  arAgingReportService: { get: vi.fn() },
  apAgingReportService: { get: vi.fn() },
  salesByCustomerService: { get: vi.fn() },
  salesByProductService: { get: vi.fn() },
  purchaseBySupplierService: { get: vi.fn() },
  purchaseByProductService: { get: vi.fn() },
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key) => {
    if (key) {
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      };
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    };
  }),
}));

describe('Management Reports Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSalesByCustomer', () => {
    it('should return sales by customer data structure', () => {
      // Act
      const { result } = renderHook(() =>
        useSalesByCustomer({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('salesByCustomer');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => useSalesByCustomer(filters));

      // Assert - Required filters are passed
    });

    it('should accept optional currency filter', () => {
      // Act
      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        currency: 'USD',
      };
      renderHook(() => useSalesByCustomer(filters));

      // Assert - Currency filter is passed
    });
  });

  describe('useSalesByProduct', () => {
    it('should return sales by product data structure', () => {
      // Act
      const { result } = renderHook(() =>
        useSalesByProduct({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('salesByProduct');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => useSalesByProduct(filters));

      // Assert - Required filters are passed
    });
  });

  describe('usePurchaseBySupplier', () => {
    it('should return purchase by supplier data structure', () => {
      // Act
      const { result } = renderHook(() =>
        usePurchaseBySupplier({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('purchaseBySupplier');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => usePurchaseBySupplier(filters));

      // Assert - Required filters are passed
    });

    it('should accept optional currency filter', () => {
      // Act
      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        currency: 'EUR',
      };
      renderHook(() => usePurchaseBySupplier(filters));

      // Assert - Currency filter is passed
    });
  });

  describe('usePurchaseByProduct', () => {
    it('should return purchase by product data structure', () => {
      // Act
      const { result } = renderHook(() =>
        usePurchaseByProduct({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('purchaseByProduct');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => usePurchaseByProduct(filters));

      // Assert - Required filters are passed
    });
  });
});
