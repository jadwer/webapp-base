/**
 * HR Module - Payroll Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { payrollPeriodsService } from '../../services';
import {
  createMockPayrollPeriod,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('HR Payroll Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('payrollPeriodsService', () => {
    it('should fetch all payroll periods', async () => {
      // Arrange
      const mockPeriods = [createMockPayrollPeriod(), createMockPayrollPeriod({ id: '2' })];
      const mockResponse = createMockAPICollectionResponse(
        mockPeriods.map(period => ({
          id: period.id,
          attributes: {
            name: period.name,
            period_type: period.periodType,
            start_date: period.startDate,
            end_date: period.endDate,
            payment_date: period.paymentDate,
            status: period.status,
          },
        })),
        'payroll-periods'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await payrollPeriodsService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/payroll-periods');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch payroll periods with filters', async () => {
      // Arrange
      const mockPeriods = [createMockPayrollPeriod()];
      const mockResponse = createMockAPICollectionResponse(
        mockPeriods.map(period => ({
          id: period.id,
          attributes: { status: period.status },
        })),
        'payroll-periods'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await payrollPeriodsService.getAll({
        'filter[status]': 'open',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/payroll-periods')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=open')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create payroll period', async () => {
      // Arrange
      const mockPeriod = createMockPayrollPeriod();
      const mockResponse = createMockAPIResponse('10', 'payroll-periods', {
        name: mockPeriod.name,
        start_date: mockPeriod.startDate,
      });
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const formData = {
        name: 'January 2024',
        periodType: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        paymentDate: '2024-02-05',
        status: 'draft' as const,
      };

      // Act
      const result = await payrollPeriodsService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/payroll-periods',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update payroll period', async () => {
      // Arrange
      const mockResponse = createMockAPIResponse('3', 'payroll-periods', {
        status: 'closed',
      });
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const formData = {
        name: 'January 2024',
        periodType: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        paymentDate: '2024-02-05',
        status: 'closed' as const,
      };

      // Act
      const result = await payrollPeriodsService.update('1', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/payroll-periods/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete payroll period', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null });

      // Act
      const result = await payrollPeriodsService.delete('1');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/payroll-periods/1');
      expect(result).toBeNull();
    });

    it('should handle errors when fetching payroll periods', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(payrollPeriodsService.getAll()).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });
});
