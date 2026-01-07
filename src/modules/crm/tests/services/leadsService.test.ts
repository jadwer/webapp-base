/**
 * CRM Module - Leads Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { leadsService } from '../../services';
import {
  createMockLead,
  createMockLeads,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('leadsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all leads with default includes', async () => {
      // Arrange
      const mockLeads = createMockLeads(3);
      const mockResponse = createMockAPICollectionResponse(
        mockLeads.map(lead => ({
          id: lead.id,
          attributes: {
            title: lead.title,
            status: lead.status,
            estimatedValue: lead.estimatedValue,
            source: lead.source,
            rating: lead.rating,
          },
        })),
        'leads'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await leadsService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('include=user%2CpipelineStage')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch leads with filters', async () => {
      // Arrange
      const mockLeads = createMockLeads(2);
      const mockResponse = createMockAPICollectionResponse(
        mockLeads.map(lead => ({
          id: lead.id,
          attributes: { title: lead.title, status: lead.status },
        })),
        'leads'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await leadsService.getAll({
        'filter[status]': 'new',
        'filter[rating]': 'hot',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=new')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Brating%5D=hot')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching leads', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(leadsService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should fetch a single lead by ID with all includes', async () => {
      // Arrange
      const mockLead = createMockLead({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'leads', {
        title: mockLead.title,
        status: mockLead.status,
        estimatedValue: mockLead.estimatedValue,
        source: mockLead.source,
        rating: mockLead.rating,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await leadsService.getById('5');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/leads/5?include=user,contact,pipelineStage,campaigns'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching a single lead', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(leadsService.getById('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      // Arrange
      const formData = {
        title: 'New Business Opportunity',
        status: 'new' as const,
        estimatedValue: 50000,
        source: 'website',
        rating: 'hot' as const,
        userId: 1,
        pipelineStageId: 2,
        contactId: 3,
      };

      const mockResponse = createMockAPIResponse('10', 'leads', {
        title: formData.title,
        status: formData.status,
        estimated_value: formData.estimatedValue,
        source: formData.source,
        rating: formData.rating,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await leadsService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/leads',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'leads',
            attributes: expect.objectContaining({
              title: formData.title,
              status: formData.status,
              estimatedValue: formData.estimatedValue,
            }),
            relationships: expect.objectContaining({
              user: expect.any(Object),
              contact: expect.any(Object),
              pipelineStage: expect.any(Object),
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors when creating', async () => {
      // Arrange
      const formData = {
        title: '',
        status: 'invalid' as any,
        estimatedValue: -1000,
        source: '',
        rating: 'hot' as const,
        userId: 0,
        pipelineStageId: 0,
      };

      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(leadsService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing lead', async () => {
      // Arrange
      const formData = {
        title: 'Updated Opportunity',
        status: 'qualified' as const,
        estimatedValue: 75000,
        source: 'referral',
        rating: 'warm' as const,
        userId: 1,
        pipelineStageId: 3,
      };

      const mockResponse = createMockAPIResponse('3', 'leads', {
        title: formData.title,
        status: formData.status,
        estimated_value: formData.estimatedValue,
        source: formData.source,
        rating: formData.rating,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await leadsService.update('3', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/leads/3',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'leads',
            id: '3',
            attributes: expect.objectContaining({
              title: formData.title,
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
        title: 'Updated Opportunity',
        status: 'qualified' as const,
        estimatedValue: 75000,
        source: 'referral',
        rating: 'warm' as const,
        userId: 1,
        pipelineStageId: 3,
      };

      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.patch).mockRejectedValue(error);

      // Act & Assert
      await expect(leadsService.update('999', formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a lead', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      // Act
      const result = await leadsService.delete('5');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/leads/5');
      expect(result).toEqual({});
    });

    it('should handle errors when deleting', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(leadsService.delete('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
