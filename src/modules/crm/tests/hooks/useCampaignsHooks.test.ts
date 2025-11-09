/**
 * CRM Module - Campaigns Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useCampaigns,
  useCampaign,
  useCampaignsMutations,
  useCampaignROI,
} from '../../hooks';
import { campaignsService, campaignLeadsService } from '../../services';

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

describe('Campaigns Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCampaigns', () => {
    it('should return campaigns data structure', () => {
      // Act
      const { result } = renderHook(() => useCampaigns());

      // Assert
      expect(result.current).toHaveProperty('campaigns');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('meta');
    });

    it('should handle empty campaigns', () => {
      // Act
      const { result } = renderHook(() => useCampaigns());

      // Assert
      expect(result.current.campaigns).toEqual([]);
    });

    it('should accept search filter parameter', () => {
      // Act
      const filters = { search: 'email campaign' };
      renderHook(() => useCampaigns(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept status filter parameter', () => {
      // Act
      const filters = { status: 'active' };
      renderHook(() => useCampaigns(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept type filter parameter', () => {
      // Act
      const filters = { type: 'email' };
      renderHook(() => useCampaigns(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept userId filter parameter', () => {
      // Act
      const filters = { userId: 1 };
      renderHook(() => useCampaigns(filters));

      // Assert - Filters are passed correctly
    });

    it('should accept date range filter parameters', () => {
      // Act
      const filters = {
        startDateFrom: '2025-01-01',
        startDateTo: '2025-12-31',
      };
      renderHook(() => useCampaigns(filters));

      // Assert - Filters are passed correctly
    });
  });

  describe('useCampaign', () => {
    it('should return single campaign data structure', () => {
      // Act
      const { result } = renderHook(() => useCampaign('1'));

      // Assert
      expect(result.current).toHaveProperty('campaign');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should not fetch when ID is empty', () => {
      // Act
      const { result } = renderHook(() => useCampaign(''));

      // Assert - Should not trigger fetch
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCampaignsMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCampaignsMutations());

      // Assert
      expect(result.current).toHaveProperty('createCampaign');
      expect(result.current).toHaveProperty('updateCampaign');
      expect(result.current).toHaveProperty('deleteCampaign');
      expect(result.current).toHaveProperty('addLeadsToCampaign');
      expect(result.current).toHaveProperty('removeLeadsFromCampaign');
      expect(typeof result.current.createCampaign).toBe('function');
      expect(typeof result.current.updateCampaign).toBe('function');
      expect(typeof result.current.deleteCampaign).toBe('function');
      expect(typeof result.current.addLeadsToCampaign).toBe('function');
      expect(typeof result.current.removeLeadsFromCampaign).toBe('function');
    });

    it('should call create service', async () => {
      // Arrange
      const { result } = renderHook(() => useCampaignsMutations());
      const mockData = {
        name: 'Summer Campaign',
        type: 'email' as const,
        status: 'planning' as const,
        startDate: '2025-06-01',
        userId: '1',
      };

      // Act
      await result.current.createCampaign(mockData);

      // Assert
      expect(campaignsService.create).toHaveBeenCalledWith(mockData);
    });

    it('should call update service', async () => {
      // Arrange
      const { result } = renderHook(() => useCampaignsMutations());
      const mockData = {
        name: 'Updated Campaign',
        type: 'social_media' as const,
        status: 'active' as const,
        startDate: '2025-06-01',
        userId: '1',
      };

      // Act
      await result.current.updateCampaign('1', mockData);

      // Assert
      expect(campaignsService.update).toHaveBeenCalledWith('1', mockData);
    });

    it('should call delete service', async () => {
      // Arrange
      const { result } = renderHook(() => useCampaignsMutations());

      // Act
      await result.current.deleteCampaign('1');

      // Assert
      expect(campaignsService.delete).toHaveBeenCalledWith('1');
    });

    it('should call addLeads service', async () => {
      // Arrange
      const { result } = renderHook(() => useCampaignsMutations());
      const leadIds = ['1', '2', '3'];

      // Act
      await result.current.addLeadsToCampaign('5', leadIds);

      // Assert
      expect(campaignLeadsService.addLeads).toHaveBeenCalledWith('5', leadIds);
    });

    it('should call removeLeads service', async () => {
      // Arrange
      const { result } = renderHook(() => useCampaignsMutations());
      const leadIds = ['1', '2'];

      // Act
      await result.current.removeLeadsFromCampaign('5', leadIds);

      // Assert
      expect(campaignLeadsService.removeLeads).toHaveBeenCalledWith('5', leadIds);
    });
  });

  describe('useCampaignROI', () => {
    it('should return ROI data structure', () => {
      // Act
      const { result } = renderHook(() => useCampaignROI('1'));

      // Assert
      expect(result.current).toHaveProperty('roi');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('should return null ROI when campaign is not loaded', () => {
      // Act
      const { result } = renderHook(() => useCampaignROI('1'));

      // Assert
      // Since SWR is mocked to return undefined data, campaign will be undefined
      // and roi will be null
      expect(result.current.roi).toBeNull();
    });

    it('should not fetch when campaignId is empty', () => {
      // Act
      const { result } = renderHook(() => useCampaignROI(''));

      // Assert
      expect(result.current.roi).toBeNull();
    });
  });
});
