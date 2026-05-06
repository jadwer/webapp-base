/**
 * CRM Module - Campaigns Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { campaignsService } from '../../services';
import {
  createMockCampaign,
  createMockCampaigns,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('campaignsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all campaigns with default includes', async () => {
      // Arrange
      const mockCampaigns = createMockCampaigns(3);
      const mockResponse = createMockAPICollectionResponse(
        mockCampaigns.map(campaign => ({
          id: campaign.id,
          attributes: {
            name: campaign.name,
            type: campaign.type,
            status: campaign.status,
            budget: campaign.budget,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
          },
        })),
        'campaigns'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await campaignsService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('include=user')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch campaigns with filters', async () => {
      // Arrange
      const mockCampaigns = createMockCampaigns(2);
      const mockResponse = createMockAPICollectionResponse(
        mockCampaigns.map(campaign => ({
          id: campaign.id,
          attributes: { name: campaign.name, status: campaign.status },
        })),
        'campaigns'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await campaignsService.getAll({
        'filter[status]': 'active',
        'filter[type]': 'email',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=active')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Btype%5D=email')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching campaigns', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(campaignsService.getAll()).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('getById', () => {
    it('should fetch a single campaign by ID with all includes', async () => {
      // Arrange
      const mockCampaign = createMockCampaign({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'campaigns', {
        name: mockCampaign.name,
        type: mockCampaign.type,
        status: mockCampaign.status,
        budget: mockCampaign.budget,
        startDate: mockCampaign.startDate,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await campaignsService.getById('5');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/campaigns/5?include=user,leads'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching a single campaign', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(campaignsService.getById('999')).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('create', () => {
    it('should create a new campaign', async () => {
      // Arrange
      const formData = {
        name: 'Summer Email Campaign',
        type: 'email' as const,
        status: 'planning' as const,
        budget: 10000,
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        userId: 1,
        description: 'Promotional summer campaign',
      };

      const mockResponse = createMockAPIResponse('10', 'campaigns', {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        budget: formData.budget,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await campaignsService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/campaigns',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'campaigns',
            attributes: expect.objectContaining({
              name: formData.name,
              type: formData.type,
              status: formData.status,
              budget: formData.budget,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors when creating', async () => {
      // Arrange
      const formData = {
        name: '',
        type: 'invalid' as any,
        status: 'planning' as const,
        budget: -5000,
        startDate: '',
        userId: 0,
      };

      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(campaignsService.create(formData)).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('update', () => {
    it('should update an existing campaign', async () => {
      // Arrange
      const formData = {
        name: 'Updated Email Campaign',
        type: 'email' as const,
        status: 'active' as const,
        budget: 15000,
        startDate: '2025-06-01',
        endDate: '2025-09-30',
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('3', 'campaigns', {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        budget: formData.budget,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await campaignsService.update('3', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/campaigns/3',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'campaigns',
            id: '3',
            attributes: expect.objectContaining({
              name: formData.name,
              status: formData.status,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when updating', async () => {
      // Arrange
      const formData = {
        name: 'Updated Campaign',
        type: 'email' as const,
        status: 'active' as const,
        budget: 15000,
        startDate: '2025-06-01',
        userId: 1,
      };

      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.patch).mockRejectedValue(error);

      // Act & Assert
      await expect(campaignsService.update('999', formData)).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('delete', () => {
    it('should delete a campaign', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      // Act
      const result = await campaignsService.delete('5');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/campaigns/5');
      expect(result).toEqual({});
    });

    it('should handle errors when deleting', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(campaignsService.delete('999')).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });
});
