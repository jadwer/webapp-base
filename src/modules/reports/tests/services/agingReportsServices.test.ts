/**
 * Reports Module - Aging Reports Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { arAgingReportService, apAgingReportService } from '../../services';
import {
  createMockARAgingReport,
  createMockAPAgingReport,
  createMockReportResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('Aging Reports Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('arAgingReportService', () => {
    it('should fetch AR aging report without filters', async () => {
      // Arrange
      const mockData = createMockARAgingReport();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await arAgingReportService.get();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/reports/ar-aging-reports');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch AR aging report with filters', async () => {
      // Arrange
      const mockData = createMockARAgingReport();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await arAgingReportService.get({
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

    it('should handle errors when fetching AR aging report', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(arAgingReportService.get()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('apAgingReportService', () => {
    it('should fetch AP aging report without filters', async () => {
      // Arrange
      const mockData = createMockAPAgingReport();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await apAgingReportService.get();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/reports/ap-aging-reports');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch AP aging report with filters', async () => {
      // Arrange
      const mockData = createMockAPAgingReport();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await apAgingReportService.get({
        asOfDate: '2025-01-01',
        currency: 'USD',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BasOfDate%5D=2025-01-01')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bcurrency%5D=USD')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching AP aging report', async () => {
      // Arrange
      const error = createMockAxiosError(403, 'Forbidden');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(apAgingReportService.get()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
