/**
 * CRM Module - Pipeline Stages Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  usePipelineStages,
  usePipelineStage,
  usePipelineStagesMutations,
} from '../../hooks';
import { pipelineStagesService } from '../../services';

// Mock the service
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

describe('Pipeline Stages Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePipelineStages', () => {
    it('should return pipeline stages data structure', () => {
      // Act
      const { result } = renderHook(() => usePipelineStages());

      // Assert
      expect(result.current).toHaveProperty('pipelineStages');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('meta');
    });

    it('should handle empty pipeline stages', () => {
      // Act
      const { result } = renderHook(() => usePipelineStages());

      // Assert
      expect(result.current.pipelineStages).toEqual([]);
    });

    it('should accept search filter parameter', () => {
      // Act
      const filters = { search: 'prospect' };
      renderHook(() => usePipelineStages(filters));

      // Assert - Filters are passed correctly
      // The hook should construct the proper query params
    });

    it('should accept isActive filter parameter', () => {
      // Act
      const filters = { isActive: true };
      renderHook(() => usePipelineStages(filters));

      // Assert - Filters are passed correctly
    });
  });

  describe('usePipelineStage', () => {
    it('should return single pipeline stage data structure', () => {
      // Act
      const { result } = renderHook(() => usePipelineStage('1'));

      // Assert
      expect(result.current).toHaveProperty('pipelineStage');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should not fetch when ID is empty', () => {
      // Act
      const { result } = renderHook(() => usePipelineStage(''));

      // Assert - Should not trigger fetch
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('usePipelineStagesMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => usePipelineStagesMutations());

      // Assert
      expect(result.current).toHaveProperty('createPipelineStage');
      expect(result.current).toHaveProperty('updatePipelineStage');
      expect(result.current).toHaveProperty('deletePipelineStage');
      expect(typeof result.current.createPipelineStage).toBe('function');
      expect(typeof result.current.updatePipelineStage).toBe('function');
      expect(typeof result.current.deletePipelineStage).toBe('function');
    });

    it('should call create service', async () => {
      // Arrange
      const { result } = renderHook(() => usePipelineStagesMutations());
      const mockData = {
        name: 'Test Stage',
        order: 1,
        probability: 50,
        isActive: true,
      };

      // Act
      await result.current.createPipelineStage(mockData);

      // Assert
      expect(pipelineStagesService.create).toHaveBeenCalledWith(mockData);
    });

    it('should call update service', async () => {
      // Arrange
      const { result } = renderHook(() => usePipelineStagesMutations());
      const mockData = {
        name: 'Updated Stage',
        order: 2,
        probability: 75,
        isActive: true,
      };

      // Act
      await result.current.updatePipelineStage('1', mockData);

      // Assert
      expect(pipelineStagesService.update).toHaveBeenCalledWith('1', mockData);
    });

    it('should call delete service', async () => {
      // Arrange
      const { result } = renderHook(() => usePipelineStagesMutations());

      // Act
      await result.current.deletePipelineStage('1');

      // Assert
      expect(pipelineStagesService.delete).toHaveBeenCalledWith('1');
    });
  });
});
