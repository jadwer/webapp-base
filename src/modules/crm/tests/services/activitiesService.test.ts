/**
 * CRM Module - Activities Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { activitiesService } from '../../services';
import {
  createMockActivity,
  createMockActivities,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('activitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to clean up test output
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all activities with default includes', async () => {
      // Arrange
      const mockActivities = createMockActivities(3);
      const mockResponse = createMockAPICollectionResponse(
        mockActivities.map(activity => ({
          id: activity.id,
          attributes: {
            subject: activity.subject,
            activity_type: activity.activityType,
            status: activity.status,
            activity_date: activity.activityDate,
            priority: activity.priority,
          },
        })),
        'activities'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.getAll();

      // Assert
      // URL encodes commas as %2C
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/include=user(%2C|,)lead(%2C|,)opportunity/)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch activities with filters', async () => {
      // Arrange
      const mockActivities = createMockActivities(2);
      const mockResponse = createMockAPICollectionResponse(
        mockActivities.map(activity => ({
          id: activity.id,
          attributes: { subject: activity.subject, status: activity.status },
        })),
        'activities'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.getAll({
        'filter[status]': 'pending',
        'filter[activity_type]': 'call',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=pending')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bactivity_type%5D=call')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching activities', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(activitiesService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should fetch a single activity by ID with all includes', async () => {
      // Arrange
      const mockActivity = createMockActivity({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'activities', {
        subject: mockActivity.subject,
        activity_type: mockActivity.activityType,
        status: mockActivity.status,
        activity_date: mockActivity.activityDate,
        priority: mockActivity.priority,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.getById('5');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/activities/5?include=user,lead,campaign,opportunity'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching a single activity', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(activitiesService.getById('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new activity', async () => {
      // Arrange
      const formData = {
        subject: 'Follow-up call with client',
        activityType: 'call' as const,
        status: 'pending' as const,
        description: 'Discuss contract renewal',
        activityDate: '2025-01-15',
        dueDate: '2025-01-20',
        duration: 30,
        priority: 'high' as const,
        userId: 1,
        leadId: 1,
      };

      const mockResponse = createMockAPIResponse('10', 'activities', {
        subject: formData.subject,
        activity_type: formData.activityType,
        status: formData.status,
        activity_date: formData.activityDate,
        priority: formData.priority,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/activities',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'activities',
            attributes: expect.objectContaining({
              subject: formData.subject,
              activityType: formData.activityType,
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
        subject: '',
        activityType: 'invalid' as unknown as 'call',
        status: 'pending' as const,
        activityDate: '',
        userId: 0,
      };

      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(activitiesService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing activity', async () => {
      // Arrange
      const formData = {
        subject: 'Updated follow-up call',
        activityType: 'call' as const,
        status: 'completed' as const,
        activityDate: '2025-01-15',
        outcome: 'Agreed to schedule demo next week',
        priority: 'medium' as const,
        userId: 1,
      };

      const mockResponse = createMockAPIResponse('3', 'activities', {
        subject: formData.subject,
        activity_type: formData.activityType,
        status: formData.status,
        outcome: formData.outcome,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.update('3', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/activities/3',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'activities',
            id: '3',
            attributes: expect.objectContaining({
              subject: formData.subject,
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
        subject: 'Updated Activity',
        activityType: 'call' as const,
        status: 'completed' as const,
        activityDate: '2025-01-15',
        userId: 1,
      };

      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.patch).mockRejectedValue(error);

      // Act & Assert
      await expect(activitiesService.update('999', formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an activity', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      // Act
      const result = await activitiesService.delete('5');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/activities/5');
      expect(result).toEqual({});
    });

    it('should handle errors when deleting', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Not Found');
      vi.mocked(axiosClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(activitiesService.delete('999')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty activities list', async () => {
      // Arrange
      const mockResponse = createMockAPICollectionResponse([], 'activities');
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.getAll();

      // Assert
      expect(result.data).toHaveLength(0);
    });

    it('should create activity with optional opportunity relationship', async () => {
      // Arrange
      const formData = {
        subject: 'Opportunity follow-up',
        activityType: 'meeting' as const,
        status: 'pending' as const,
        activityDate: '2025-01-20',
        userId: 1,
        opportunityId: 5,
      };

      const mockResponse = createMockAPIResponse('15', 'activities', {
        subject: formData.subject,
        activity_type: formData.activityType,
        status: formData.status,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await activitiesService.create(formData);

      // Assert
      // Relationships are sent via JSON:API relationships block, not attributes
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/activities',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'activities',
            relationships: expect.objectContaining({
              opportunity: expect.objectContaining({
                data: expect.objectContaining({
                  id: '5',
                  type: 'opportunities',
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
