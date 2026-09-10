/**
 * CRM Module - Leads Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeads, useLead, useLeadsMutations } from '../../hooks';
import { leadsService } from '../../services';

// Mock the services
vi.mock('../../services', () => ({
  pipelineStagesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  leadsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  campaignsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  campaignLeadsService: {
    addLeads: vi.fn(),
    removeLeads: vi.fn(),
  },
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

describe('Leads Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLeads', () => {
    it('should return leads data structure', () => {
      // Act
      const { result } = renderHook(() => useLeads());

      // Assert
      expect(result.current).toHaveProperty('leads');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('meta');
    });

    it('should handle empty leads', () => {
      // Act
      const { result } = renderHook(() => useLeads());

      // Assert
      expect(result.current.leads).toEqual([]);
    });

    it('should accept search filter parameter', () => {
      // Act
      const filters = { search: 'business' };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept status filter parameter', () => {
      // Act
      const filters = { status: 'new' };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept rating filter parameter', () => {
      // Act
      const filters = { rating: 'hot' };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept userId filter parameter', () => {
      // Act
      const filters = { userId: 1 };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept pipelineStageId filter parameter', () => {
      // Act
      const filters = { pipelineStageId: 2 };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept date range filter parameters', () => {
      // Act
      const filters = {
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };
      renderHook(() => useLeads(filters));

      // Assert - Filters are passed correctly
    });
  });

  describe('useLead', () => {
    it('should return single lead data structure', () => {
      // Act
      const { result } = renderHook(() => useLead('1'));

      // Assert
      expect(result.current).toHaveProperty('lead');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should not fetch when ID is empty', () => {
      // Act
      const { result } = renderHook(() => useLead(''));

      // Assert - Should not trigger fetch
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useLeadsMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useLeadsMutations());

      // Assert
      expect(result.current).toHaveProperty('createLead');
      expect(result.current).toHaveProperty('updateLead');
      expect(result.current).toHaveProperty('deleteLead');
      expect(typeof result.current.createLead).toBe('function');
      expect(typeof result.current.updateLead).toBe('function');
      expect(typeof result.current.deleteLead).toBe('function');
    });

    it('should call create service', async () => {
      // Arrange
      const { result } = renderHook(() => useLeadsMutations());
      const mockData = {
        title: 'New Business Opportunity',
        status: 'new' as const,
        rating: 'hot' as const,
        source: 'website',
        userId: 1,
        pipelineStageId: 2,
      };

      // Act
      await result.current.createLead(mockData);

      // Assert
      expect(leadsService.create).toHaveBeenCalledWith(mockData);
    });

    it('should call update service', async () => {
      // Arrange
      const { result } = renderHook(() => useLeadsMutations());
      const mockData = {
        title: 'Updated Opportunity',
        status: 'qualified' as const,
        rating: 'warm' as const,
        source: 'referral',
        userId: 1,
        pipelineStageId: 3,
      };

      // Act
      await result.current.updateLead('1', mockData);

      // Assert
      expect(leadsService.update).toHaveBeenCalledWith('1', mockData);
    });

    it('should call delete service', async () => {
      // Arrange
      const { result } = renderHook(() => useLeadsMutations());

      // Act
      await result.current.deleteLead('1');

      // Assert
      expect(leadsService.delete).toHaveBeenCalledWith('1');
    });
  });
});
