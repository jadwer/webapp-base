/**
 * CRM Module - Campaign-Lead Relationship Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { campaignLeadsService } from '../../services';
import { createMockAxiosError } from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('campaignLeadsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('addLeads', () => {
    it('should add leads to a campaign', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['1', '2', '3'];
      const mockResponse = { data: {} };

      vi.mocked(axiosClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await campaignLeadsService.addLeads(campaignId, leadIds);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/campaigns/5/relationships/leads',
        expect.objectContaining({
          data: [
            { type: 'leads', id: '1' },
            { type: 'leads', id: '2' },
            { type: 'leads', id: '3' },
          ],
        })
      );
      expect(result).toEqual({});
    });

    it('should add a single lead to a campaign', async () => {
      // Arrange
      const campaignId = '10';
      const leadIds = ['7'];
      const mockResponse = { data: {} };

      vi.mocked(axiosClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await campaignLeadsService.addLeads(campaignId, leadIds);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/campaigns/10/relationships/leads',
        expect.objectContaining({
          data: [{ type: 'leads', id: '7' }],
        })
      );
      expect(result).toEqual({});
    });

    it('should handle errors when adding leads', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['1', '2'];
      const error = createMockAxiosError(404, 'Campaign not found');

      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(
        campaignLeadsService.addLeads(campaignId, leadIds)
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle validation errors when adding leads', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['999']; // Non-existent lead ID
      const error = createMockAxiosError(422, 'Lead not found');

      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(
        campaignLeadsService.addLeads(campaignId, leadIds)
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeLeads', () => {
    it('should remove leads from a campaign', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['1', '2', '3'];
      const mockResponse = { data: {} };

      vi.mocked(axiosClient.delete).mockResolvedValue(mockResponse);

      // Act
      const result = await campaignLeadsService.removeLeads(campaignId, leadIds);

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith(
        '/api/v1/campaigns/5/relationships/leads',
        expect.objectContaining({
          data: {
            data: [
              { type: 'leads', id: '1' },
              { type: 'leads', id: '2' },
              { type: 'leads', id: '3' },
            ],
          },
        })
      );
      expect(result).toEqual({});
    });

    it('should remove a single lead from a campaign', async () => {
      // Arrange
      const campaignId = '10';
      const leadIds = ['7'];
      const mockResponse = { data: {} };

      vi.mocked(axiosClient.delete).mockResolvedValue(mockResponse);

      // Act
      const result = await campaignLeadsService.removeLeads(campaignId, leadIds);

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith(
        '/api/v1/campaigns/10/relationships/leads',
        expect.objectContaining({
          data: {
            data: [{ type: 'leads', id: '7' }],
          },
        })
      );
      expect(result).toEqual({});
    });

    it('should handle errors when removing leads', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['1', '2'];
      const error = createMockAxiosError(404, 'Campaign not found');

      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(
        campaignLeadsService.removeLeads(campaignId, leadIds)
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle relationship errors when removing leads', async () => {
      // Arrange
      const campaignId = '5';
      const leadIds = ['999']; // Lead not associated with campaign
      const error = createMockAxiosError(422, 'Lead not associated with campaign');

      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(
        campaignLeadsService.removeLeads(campaignId, leadIds)
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
