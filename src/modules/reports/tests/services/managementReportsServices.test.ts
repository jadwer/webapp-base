/**
 * Reports Module - Management Reports Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import {
  salesByCustomerService,
  salesByProductService,
  purchaseBySupplierService,
  purchaseByProductService,
} from '../../services';
import {
  createMockSalesByCustomer,
  createMockSalesByProduct,
  createMockPurchaseBySupplier,
  createMockPurchaseByProduct,
  createMockReportResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('Management Reports Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('salesByCustomerService', () => {
    it('should fetch sales by customer with required period', async () => {
      // Arrange
      const mockData = createMockSalesByCustomer();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await salesByCustomerService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/sales-by-customer-reports')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BstartDate%5D=2025-01-01')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch sales by customer with currency filter', async () => {
      // Arrange
      const mockData = createMockSalesByCustomer();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await salesByCustomerService.get({
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

    it('should handle errors when fetching sales by customer', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        salesByCustomerService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('salesByProductService', () => {
    it('should fetch sales by product with required period', async () => {
      // Arrange
      const mockData = createMockSalesByProduct();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await salesByProductService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/sales-by-product-reports')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching sales by product', async () => {
      // Arrange
      const error = createMockAxiosError(400, 'Bad Request');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        salesByProductService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('purchaseBySupplierService', () => {
    it('should fetch purchase by supplier with required period', async () => {
      // Arrange
      const mockData = createMockPurchaseBySupplier();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await purchaseBySupplierService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/purchase-by-supplier-reports')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching purchase by supplier', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        purchaseBySupplierService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('purchaseByProductService', () => {
    it('should fetch purchase by product with required period', async () => {
      // Arrange
      const mockData = createMockPurchaseByProduct();
      const mockResponse = createMockReportResponse(mockData);
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await purchaseByProductService.get({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/purchase-by-product-reports')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching purchase by product', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        purchaseByProductService.get({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
