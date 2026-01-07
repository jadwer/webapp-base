/**
 * Reports Module - Financial Statements Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import {
  balanceSheetService,
  incomeStatementService,
  cashFlowService,
  trialBalanceService,
} from '../../services';
import {
  createMockBalanceSheet,
  createMockIncomeStatement,
  createMockCashFlow,
  createMockTrialBalance,
  createMockReportResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('Financial Statements Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('balanceSheetService', () => {
    it('should fetch balance sheet without filters', async () => {
      // Arrange
      const mockData = createMockBalanceSheet();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await balanceSheetService.get();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/reports/balance-sheets');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch balance sheet with filters', async () => {
      // Arrange
      const mockData = createMockBalanceSheet();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await balanceSheetService.get({
        asOfDate: '2025-01-01',
        currency: 'MXN',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BasOfDate%5D=2025-01-01')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bcurrency%5D=MXN')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching balance sheet', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(balanceSheetService.get()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('incomeStatementService', () => {
    it('should fetch income statement with required period', async () => {
      // Arrange
      const mockData = createMockIncomeStatement();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await incomeStatementService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BstartDate%5D=2025-01-01')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BendDate%5D=2025-12-31')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch income statement with currency filter', async () => {
      // Arrange
      const mockData = createMockIncomeStatement();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await incomeStatementService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        currency: 'USD',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bcurrency%5D=USD')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching income statement', async () => {
      // Arrange
      const error = createMockAxiosError(400, 'Bad Request');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        incomeStatementService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('cashFlowService', () => {
    it('should fetch cash flow with required period', async () => {
      // Arrange
      const mockData = createMockCashFlow();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cashFlowService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/cash-flows')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BstartDate%5D=2025-01-01')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching cash flow', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        cashFlowService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('trialBalanceService', () => {
    it('should fetch trial balance without filters', async () => {
      // Arrange
      const mockData = createMockTrialBalance();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await trialBalanceService.get();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/reports/trial-balances');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch trial balance with filters', async () => {
      // Arrange
      const mockData = createMockTrialBalance();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await trialBalanceService.get({
        asOfDate: '2025-01-01',
        currency: 'MXN',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BasOfDate%5D=2025-01-01')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching trial balance', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(trialBalanceService.get()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
