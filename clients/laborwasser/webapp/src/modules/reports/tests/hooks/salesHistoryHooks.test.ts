/**
 * Reports Module - Sales History Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { useSalesHistory } from '../../hooks';
import { salesHistoryService } from '../../services';
import type { SalesHistoryReport } from '../../types';

// Mock the services
vi.mock('../../services', () => ({
  salesHistoryService: { getReport: vi.fn(), export: vi.fn() },
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: true,
    mutate: vi.fn(),
  })),
}));

const mockReport: SalesHistoryReport = {
  rows: [
    {
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

describe('useSalesHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sales history data structure', () => {
    // Act
    const { result } = renderHook(() =>
      useSalesHistory({ startDate: '2026-07-01', endDate: '2026-07-31' })
    );

    // Assert
    expect(result.current).toHaveProperty('rows');
    expect(result.current).toHaveProperty('totals');
    expect(result.current).toHaveProperty('grouped');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('mutate');
  });

  it('should default rows to an empty array while loading', () => {
    // Act
    const { result } = renderHook(() =>
      useSalesHistory({ startDate: '2026-07-01', endDate: '2026-07-31' })
    );

    // Assert
    expect(result.current.rows).toEqual([]);
    expect(result.current.totals).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('should use a sales-history SWR key including filters', () => {
    // Arrange
    const filters = {
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      contactId: 5,
      groupBy: 'customer' as const,
      pageNumber: 2,
      pageSize: 50,
    };

    // Act
    renderHook(() => useSalesHistory(filters));

    // Assert
    expect(vi.mocked(useSWR)).toHaveBeenCalledWith(
      ['sales-history', filters],
      expect.any(Function),
      expect.objectContaining({ keepPreviousData: true })
    );
  });

  it('should call salesHistoryService.getReport through the SWR fetcher', async () => {
    // Arrange
    vi.mocked(salesHistoryService.getReport).mockResolvedValue(mockReport);
    const filters = { startDate: '2026-07-01', endDate: '2026-07-31' };

    // Act
    renderHook(() => useSalesHistory(filters));
    const fetcher = vi.mocked(useSWR).mock.calls[0][1] as () => Promise<SalesHistoryReport>;
    const data = await fetcher();

    // Assert
    expect(salesHistoryService.getReport).toHaveBeenCalledWith(filters);
    expect(data).toEqual(mockReport);
  });

  it('should expose rows, totals and grouped when data is available', () => {
    // Arrange
    const reportWithGroups: SalesHistoryReport = {
      ...mockReport,
      grouped: [
        {
          groupKey: 'customer-5',
          groupLabel: 'QUIMICA SUASTES',
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
    vi.mocked(useSWR).mockReturnValueOnce({
      data: reportWithGroups,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    // Act
    const { result } = renderHook(() =>
      useSalesHistory({ startDate: '2026-07-01', endDate: '2026-07-31' })
    );

    // Assert
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].orderNumber).toBe('OV-000001');
    expect(result.current.totals?.total).toBe(162.4);
    expect(result.current.grouped).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });
});
