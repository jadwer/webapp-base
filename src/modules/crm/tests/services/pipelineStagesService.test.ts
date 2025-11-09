/**
 * CRM Module - Pipeline Stages Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { pipelineStagesService } from '../../services';
import {
  createMockPipelineStage,
  createMockPipelineStages,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('pipelineStagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all pipeline stages with default sort', async () => {
      // Arrange
      const mockStages = createMockPipelineStages(3);
      const mockResponse = createMockAPICollectionResponse(
        mockStages.map(stage => ({
          id: stage.id,
          attributes: {
            name: stage.name,
            order: stage.order,
            probability: stage.probability,
            is_active: stage.isActive,
            color: stage.color,
            description: stage.description,
          },
        })),
        'pipeline-stages'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await pipelineStagesService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/pipeline-stages?sort=order'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch pipeline stages with filters', async () => {
      // Arrange
      const mockStages = createMockPipelineStages(2);
      const mockResponse = createMockAPICollectionResponse(
        mockStages.map(stage => ({
          id: stage.id,
          attributes: { name: stage.name, order: stage.order },
        })),
        'pipeline-stages'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await pipelineStagesService.getAll({
        'filter[is_active]': '1',
        'filter[search]': 'prospect',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bis_active%5D=1')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bsearch%5D=prospect')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching pipeline stages', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(pipelineStagesService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should fetch a single pipeline stage by ID', async () => {
      // Arrange
      const mockStage = createMockPipelineStage({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'pipeline-stages', {
        name: mockStage.name,
        order: mockStage.order,
        probability: mockStage.probability,
        is_active: mockStage.isActive,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await pipelineStagesService.getById('5');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/pipeline-stages/5');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching a single pipeline stage', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(pipelineStagesService.getById('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new pipeline stage', async () => {
      // Arrange
      const formData = {
        name: 'New Stage',
        order: 10,
        probability: 50,
        isActive: true,
        color: '#ff0000',
        description: 'Test stage',
      };

      const mockResponse = createMockAPIResponse('10', 'pipeline-stages', {
        name: formData.name,
        order: formData.order,
        probability: formData.probability,
        is_active: formData.isActive,
        color: formData.color,
        description: formData.description,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await pipelineStagesService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/pipeline-stages',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'pipeline-stages',
            attributes: expect.objectContaining({
              name: formData.name,
              order: formData.order,
              probability: formData.probability,
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
        order: -1,
        probability: 150,
        isActive: true,
      };

      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(pipelineStagesService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing pipeline stage', async () => {
      // Arrange
      const formData = {
        name: 'Updated Stage',
        order: 5,
        probability: 75,
        isActive: false,
      };

      const mockResponse = createMockAPIResponse('3', 'pipeline-stages', {
        name: formData.name,
        order: formData.order,
        probability: formData.probability,
        is_active: formData.isActive,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await pipelineStagesService.update('3', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/pipeline-stages/3',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'pipeline-stages',
            id: '3',
            attributes: expect.objectContaining({
              name: formData.name,
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when updating', async () => {
      // Arrange
      const formData = {
        name: 'Updated Stage',
        order: 5,
        probability: 75,
        isActive: true,
      };

      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.patch).mockRejectedValue(error);

      // Act & Assert
      await expect(
        pipelineStagesService.update('999', formData)
      ).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a pipeline stage', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      // Act
      const result = await pipelineStagesService.delete('5');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith(
        '/api/v1/pipeline-stages/5'
      );
      expect(result).toEqual({});
    });

    it('should handle errors when deleting', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(pipelineStagesService.delete('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
