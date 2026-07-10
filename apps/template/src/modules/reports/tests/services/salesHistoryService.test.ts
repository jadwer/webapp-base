/**
 * Reports Module - Sales History Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { salesHistoryService } from '../../services';
import { createMockAxiosError } from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

const mockBackendResponse = {
  data: [
    {
      order_id: 1,
      order_number: 'OV-000001',
      date: '2026-07-01',
      customer_name: 'QUIMICA SUASTES',
      salesperson_name: 'Juan Perez',
      cost: '100.00',
      profit: '50.00',
      subtotal: '150.00',
      discount: '10.00',
      iva: '22.40',
      total: '162.40',
      status: 'delivered',
    },
  ],
  totals: {
    cost: 100,
    profit: 50,
    subtotal: 150,
    discount: 10,
    iva: 22.4,
    total: 162.4,
    count: 1,
  },
};

describe('salesHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReport', () => {
    it('should fetch sales history with required date range', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBackendResponse });

      // Act
      const result = await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/sales-history?')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2026-07-01')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2026-07-31')
      );
      expect(result.rows).toHaveLength(1);
    });

    it('should transform snake_case rows and totals to camelCase with numeric values', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBackendResponse });

      // Act
      const result = await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      });

      // Assert
      expect(result.rows[0]).toEqual({
        orderId: 1,
        orderNumber: 'OV-000001',
        date: '2026-07-01',
        customerName: 'QUIMICA SUASTES',
        salespersonName: 'Juan Perez',
        cost: 100,
        profit: 50,
        subtotal: 150,
        discount: 10,
        iva: 22.4,
        total: 162.4,
        status: 'delivered',
      });
      expect(result.totals).toEqual({
        cost: 100,
        profit: 50,
        subtotal: 150,
        discount: 10,
        iva: 22.4,
        total: 162.4,
        count: 1,
      });
      expect(result.grouped).toBeUndefined();
    });

    it('should send all optional filters as snake_case params', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBackendResponse });

      // Act
      await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        contactId: 5,
        assignedTo: 3,
        productId: 7,
        categoryId: 2,
        brandId: 4,
        status: ['delivered', 'confirmed'],
        currency: 'MXN',
        iva: '1',
        orderNumber: 'OV-000001',
        pageNumber: 2,
        pageSize: 50,
      });

      // Assert
      const url = vi.mocked(axiosClient.get).mock.calls[0][0] as string;
      expect(url).toContain('contact_id=5');
      expect(url).toContain('assigned_to=3');
      expect(url).toContain('product_id=7');
      expect(url).toContain('category_id=2');
      expect(url).toContain('brand_id=4');
      expect(url).toContain('status=delivered%2Cconfirmed');
      expect(url).toContain('currency=MXN');
      expect(url).toContain('iva=1');
      expect(url).toContain('order_number=OV-000001');
      expect(url).toContain('page%5Bnumber%5D=2');
      expect(url).toContain('page%5Bsize%5D=50');
    });

    it('should send group_by when grouping and transform grouped rows', async () => {
      // Arrange
      const groupedResponse = {
        data: [],
        totals: mockBackendResponse.totals,
        grouped: [
          {
            group_key: 'customer-5',
            group_label: 'QUIMICA SUASTES',
            cost: 100,
            profit: 50,
            subtotal: 150,
            discount: 10,
            iva: 22.4,
            total: 162.4,
            count: 1,
          },
        ],
      };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: groupedResponse });

      // Act
      const result = await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        groupBy: 'customer',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('group_by=customer')
      );
      expect(result.grouped).toHaveLength(1);
      expect(result.grouped?.[0]).toMatchObject({
        groupKey: 'customer-5',
        groupLabel: 'QUIMICA SUASTES',
        total: 162.4,
        count: 1,
      });
    });

    it('should NOT send group_by when groupBy is none', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBackendResponse });

      // Act
      await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        groupBy: 'none',
      });

      // Assert
      const url = vi.mocked(axiosClient.get).mock.calls[0][0] as string;
      expect(url).not.toContain('group_by');
    });

    it('should tolerate an empty response payload', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: {} });

      // Act
      const result = await salesHistoryService.getReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      });

      // Assert
      expect(result.rows).toEqual([]);
      expect(result.totals.total).toBe(0);
      expect(result.totals.count).toBe(0);
    });

    it('should handle errors when fetching sales history', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        salesHistoryService.getReport({
          startDate: '2026-07-01',
          endDate: '2026-07-31',
        })
      ).rejects.toThrow();
    });
  });

  describe('export', () => {
    it('should request the export endpoint as blob with format and filters', async () => {
      // Arrange
      const mockBlob = new Blob(['csv-content'], { type: 'text/csv' });
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBlob });

      // Act
      const result = await salesHistoryService.export(
        {
          startDate: '2026-07-01',
          endDate: '2026-07-31',
          contactId: 5,
          status: ['delivered'],
        },
        'excel'
      );

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/sales-history/export?'),
        { responseType: 'blob' }
      );
      const url = vi.mocked(axiosClient.get).mock.calls[0][0] as string;
      expect(url).toContain('format=excel');
      expect(url).toContain('contact_id=5');
      expect(url).toContain('status=delivered');
      expect(result).toBe(mockBlob);
    });

    it('should handle errors when exporting', async () => {
      // Arrange
      const error = createMockAxiosError(422, 'Unprocessable');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(
        salesHistoryService.export(
          { startDate: '2026-07-01', endDate: '2026-07-31' },
          'csv'
        )
      ).rejects.toThrow();
    });
  });
});
