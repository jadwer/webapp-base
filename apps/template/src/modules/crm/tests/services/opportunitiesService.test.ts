/**
 * CRM Module - Opportunities Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { opportunitiesService } from '../../services';
import {
  createMockOpportunity,
  createMockOpportunities,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('opportunitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all opportunities with default includes', async () => {
      // Arrange
      const mockOpportunities = createMockOpportunities(3);
      const mockResponse = createMockAPICollectionResponse(
        mockOpportunities.map(opp => ({
          id: opp.id,
          attributes: {
            name: opp.name,
            amount: opp.amount,
            probability: opp.probability,
            expected_revenue: opp.expectedRevenue,
            status: opp.status,
            stage: opp.stage,
            close_date: opp.closeDate,
          },
        })),
        'opportunities'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.getAll();

      // Assert
      // URL encodes commas as %2C
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/include=user(%2C|,)pipelineStage/)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch opportunities with filters', async () => {
      // Arrange
      const mockOpportunities = createMockOpportunities(2);
      const mockResponse = createMockAPICollectionResponse(
        mockOpportunities.map(opp => ({
          id: opp.id,
          attributes: { name: opp.name, status: opp.status },
        })),
        'opportunities'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.getAll({
        'filter[status]': 'open',
        'filter[forecast_category]': 'pipeline',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=open')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bforecast_category%5D=pipeline')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching opportunities', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(opportunitiesService.getAll()).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('getById', () => {
    it('should fetch a single opportunity by ID with all includes', async () => {
      // Arrange
      const mockOpportunity = createMockOpportunity({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'opportunities', {
        name: mockOpportunity.name,
        amount: mockOpportunity.amount,
        probability: mockOpportunity.probability,
        expected_revenue: mockOpportunity.expectedRevenue,
        status: mockOpportunity.status,
        stage: mockOpportunity.stage,
        close_date: mockOpportunity.closeDate,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.getById('5');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/opportunities/5?include=user,lead,pipelineStage,activities'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching a single opportunity', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(opportunitiesService.getById('999')).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('create', () => {
    it('should create a new opportunity', async () => {
      // Arrange
      const formData = {
        name: 'Enterprise Software Deal',
        description: 'Annual license for enterprise client',
        amount: 150000,
        probability: 60,
        closeDate: '2025-06-30',
        status: 'open' as const,
        stage: 'proposal',
        forecastCategory: 'pipeline' as const,
        source: 'referral',
        nextStep: 'Schedule demo',
        userId: 1,
        leadId: 5,
        pipelineStageId: 3,
      };

      const mockResponse = createMockAPIResponse('10', 'opportunities', {
        name: formData.name,
        amount: formData.amount,
        probability: formData.probability,
        expected_revenue: formData.amount * formData.probability / 100,
        status: formData.status,
        stage: formData.stage,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/opportunities',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'opportunities',
            attributes: expect.objectContaining({
              name: formData.name,
              amount: formData.amount,
              probability: formData.probability,
              status: formData.status,
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
        amount: -5000,
        probability: 150, // Invalid: > 100
        closeDate: '',
        status: 'open' as const,
        stage: '',
        forecastCategory: 'pipeline' as const,
        userId: 0,
      };

      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(opportunitiesService.create(formData)).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('update', () => {
    it('should update an existing opportunity', async () => {
      // Arrange
      const formData = {
        name: 'Updated Enterprise Deal',
        amount: 175000,
        probability: 75,
        closeDate: '2025-07-15',
        status: 'open' as const,
        stage: 'negotiation',
        forecastCategory: 'best_case' as const,
        nextStep: 'Contract review',
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('3', 'opportunities', {
        name: formData.name,
        amount: formData.amount,
        probability: formData.probability,
        expected_revenue: formData.amount * formData.probability / 100,
        status: formData.status,
        stage: formData.stage,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.update('3', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/opportunities/3',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'opportunities',
            id: '3',
            attributes: expect.objectContaining({
              name: formData.name,
              amount: formData.amount,
              probability: formData.probability,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when updating', async () => {
      // Arrange
      const formData = {
        name: 'Updated Opportunity',
        amount: 100000,
        probability: 50,
        closeDate: '2025-06-30',
        status: 'open' as const,
        stage: 'proposal',
        forecastCategory: 'pipeline' as const,
        userId: 1,
      };

      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.patch).mockRejectedValue(error);

      // Act & Assert
      await expect(opportunitiesService.update('999', formData)).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });

    it('should update opportunity status to won', async () => {
      // Arrange
      const formData = {
        name: 'Won Deal',
        amount: 200000,
        probability: 100,
        closeDate: '2025-03-15',
        status: 'won' as const,
        stage: 'closed',
        forecastCategory: 'closed' as const,
        actualRevenue: 200000,
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('7', 'opportunities', {
        name: formData.name,
        amount: formData.amount,
        probability: formData.probability,
        status: formData.status,
        actual_revenue: formData.actualRevenue,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.update('7', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/opportunities/7',
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              status: 'won',
              actualRevenue: formData.actualRevenue,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update opportunity status to lost with reason', async () => {
      // Arrange
      const formData = {
        name: 'Lost Deal',
        amount: 100000,
        probability: 0,
        closeDate: '2025-03-15',
        status: 'lost' as const,
        stage: 'closed',
        forecastCategory: 'closed' as const,
        lossReason: 'Competitor offered lower price',
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('8', 'opportunities', {
        name: formData.name,
        amount: formData.amount,
        status: formData.status,
        loss_reason: formData.lossReason,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.update('8', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/opportunities/8',
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              status: 'lost',
              lossReason: formData.lossReason,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an opportunity', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      // Act
      const result = await opportunitiesService.delete('5');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/opportunities/5');
      expect(result).toEqual({});
    });

    it('should handle errors when deleting', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(opportunitiesService.delete('999')).rejects.toThrow();
      // console.error removed in Audit V2 - services rethrow without logging
    });
  });

  describe('edge cases', () => {
    it('should handle empty opportunities list', async () => {
      // Arrange
      const mockResponse = createMockAPICollectionResponse([], 'opportunities');
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.getAll();

      // Assert
      expect(result.data).toHaveLength(0);
    });

    it('should calculate expected revenue correctly', async () => {
      // Arrange
      const amount = 250000;
      const probability = 40;
      const expectedRevenue = amount * probability / 100;

      const formData = {
        name: 'High Value Opportunity',
        amount,
        probability,
        closeDate: '2025-09-30',
        status: 'open' as const,
        stage: 'qualification',
        forecastCategory: 'pipeline' as const,
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('20', 'opportunities', {
        name: formData.name,
        amount,
        probability,
        expected_revenue: expectedRevenue,
        status: formData.status,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.create(formData);

      // Assert
      expect(result.data.attributes.expected_revenue).toBe(expectedRevenue);
    });

    it('should handle opportunity with all optional fields', async () => {
      // Arrange
      const formData = {
        name: 'Full Opportunity',
        description: 'Complete opportunity record',
        amount: 500000,
        probability: 80,
        closeDate: '2025-12-31',
        status: 'open' as const,
        stage: 'negotiation',
        forecastCategory: 'commit' as const,
        source: 'Trade Show',
        nextStep: 'Final contract review',
        userId: 1,
        leadId: 10,
        pipelineStageId: 4,
      };

      const mockResponse = createMockAPIResponse('25', 'opportunities', {
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        probability: formData.probability,
        expected_revenue: formData.amount * formData.probability / 100,
        status: formData.status,
        stage: formData.stage,
        forecast_category: formData.forecastCategory,
        source: formData.source,
        next_step: formData.nextStep,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await opportunitiesService.create(formData);

      // Assert
      // Relationships are sent via relationships block in JSON:API
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/opportunities',
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              description: formData.description,
              source: formData.source,
              nextStep: formData.nextStep,
            }),
            relationships: expect.objectContaining({
              lead: expect.objectContaining({
                data: expect.objectContaining({
                  id: '10',
                  type: 'leads',
                }),
              }),
              pipelineStage: expect.objectContaining({
                data: expect.objectContaining({
                  id: '4',
                  type: 'pipeline-stages',
                }),
              }),
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
