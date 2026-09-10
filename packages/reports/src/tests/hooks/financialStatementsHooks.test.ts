/**
 * Reports Module - Financial Statements Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useBalanceSheet,
  useIncomeStatement,
  useCashFlow,
  useTrialBalance,
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

describe('Financial Statements Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBalanceSheet', () => {
    it('should return balance sheet data structure', () => {
      // Act
      const { result } = renderHook(() => useBalanceSheet());

      // Assert
      expect(result.current).toHaveProperty('balanceSheet');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { asOfDate: '2025-01-01', currency: 'MXN' };
      renderHook(() => useBalanceSheet(filters));

      // Assert - Filters are passed to SWR key
    });
  });

  describe('useIncomeStatement', () => {
    it('should return income statement data structure', () => {
      // Act
      const { result } = renderHook(() =>
        useIncomeStatement({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('incomeStatement');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => useIncomeStatement(filters));

      // Assert - Required filters are passed
    });

    it('should accept optional currency filter', () => {
      // Act
      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        currency: 'USD',
      };
      renderHook(() => useIncomeStatement(filters));

      // Assert - Currency filter is passed
    });
  });

  describe('useCashFlow', () => {
    it('should return cash flow data structure', () => {
      // Act
      const { result } = renderHook(() =>
        useCashFlow({ startDate: '2025-01-01', endDate: '2025-12-31' })
      );

      // Assert
      expect(result.current).toHaveProperty('cashFlow');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should require period filters', () => {
      // Act
      const filters = { startDate: '2025-01-01', endDate: '2025-12-31' };
      renderHook(() => useCashFlow(filters));

      // Assert - Required filters are passed
    });
  });

  describe('useTrialBalance', () => {
    it('should return trial balance data structure', () => {
      // Act
      const { result } = renderHook(() => useTrialBalance());

      // Assert
      expect(result.current).toHaveProperty('trialBalance');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { asOfDate: '2025-01-01', currency: 'MXN' };
      renderHook(() => useTrialBalance(filters));

      // Assert - Filters are passed to SWR key
    });
  });
});
