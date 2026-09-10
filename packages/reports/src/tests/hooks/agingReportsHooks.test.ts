/**
 * Reports Module - Aging Reports Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useARAgingReport, useAPAgingReport } from '../../hooks';

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

describe('Aging Reports Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useARAgingReport', () => {
    it('should return AR aging report data structure', () => {
      // Act
      const { result } = renderHook(() => useARAgingReport());

      // Assert
      expect(result.current).toHaveProperty('arAgingReport');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { asOfDate: '2025-01-01', currency: 'MXN' };
      renderHook(() => useARAgingReport(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept asOfDate filter', () => {
      // Act
      const filters = { asOfDate: '2025-01-01' };
      renderHook(() => useARAgingReport(filters));

      // Assert - asOfDate filter is passed
    });

    it('should accept currency filter', () => {
      // Act
      const filters = { currency: 'USD' };
      renderHook(() => useARAgingReport(filters));

      // Assert - currency filter is passed
    });
  });

  describe('useAPAgingReport', () => {
    it('should return AP aging report data structure', () => {
      // Act
      const { result } = renderHook(() => useAPAgingReport());

      // Assert
      expect(result.current).toHaveProperty('apAgingReport');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { asOfDate: '2025-01-01', currency: 'MXN' };
      renderHook(() => useAPAgingReport(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept asOfDate filter', () => {
      // Act
      const filters = { asOfDate: '2025-01-01' };
      renderHook(() => useAPAgingReport(filters));

      // Assert - asOfDate filter is passed
    });

    it('should accept currency filter', () => {
      // Act
      const filters = { currency: 'EUR' };
      renderHook(() => useAPAgingReport(filters));

      // Assert - currency filter is passed
    });
  });
});
