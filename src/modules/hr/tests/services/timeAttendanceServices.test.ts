/**
 * HR Module - Time & Attendance Services Tests
 * Tests for Attendance, LeaveType, and Leave services
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import {
  attendancesService,
  leaveTypesService,
  leavesService,
} from '../../services';
import {
  createMockAttendance,
  createMockAttendances,
  createMockLeaveType,
  createMockLeaveTypes,
  createMockLeave,
  createMockLeaves,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('Time & Attendance Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  // ==========================================================================
  // ATTENDANCES SERVICE
  // ==========================================================================

  describe('attendancesService', () => {
    it('should fetch all attendances', async () => {
      const mockAttendances = createMockAttendances(3);
      const mockResponse = createMockAPICollectionResponse(
        mockAttendances.map(att => ({
          id: att.id,
          attributes: {
            date: att.date,
            check_in: att.checkIn,
            check_out: att.checkOut,
            status: att.status,
          },
        })),
        'attendances'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await attendancesService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/attendances'));
      expect(result).toEqual(mockResponse);
    });

    it('should fetch attendances with filters', async () => {
      const mockAttendances = createMockAttendances(2);
      const mockResponse = createMockAPICollectionResponse(
        mockAttendances.map(att => ({ id: att.id, attributes: { date: att.date } })),
        'attendances'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await attendancesService.getAll({
        'filter[employee_id]': '1',
        'filter[date_from]': '2025-01-01',
      });

      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bemployee_id%5D=1')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a new attendance', async () => {
      const formData = {
        date: '2025-01-15',
        checkIn: '09:00:00',
        checkOut: '17:00:00',
        status: 'present' as const,
        employeeId: 1,
      };
      const mockResponse = createMockAPIResponse('10', 'attendances', {
        date: formData.date,
        check_in: formData.checkIn,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const result = await attendancesService.create(formData);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/attendances', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should update an existing attendance', async () => {
      const formData = {
        date: '2025-01-15',
        checkIn: '09:00:00',
        checkOut: '18:00:00',
        status: 'present' as const,
        employeeId: 1,
      };
      const mockResponse = createMockAPIResponse('3', 'attendances', {
        check_out: formData.checkOut,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const result = await attendancesService.update('3', formData);

      expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/attendances/3', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should delete an attendance', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      const result = await attendancesService.delete('5');

      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/attendances/5');
      expect(result).toEqual({});
    });

    it('should handle errors when creating attendance', async () => {
      const formData = {
        date: '',
        checkIn: '',
        status: 'present' as const,
        employeeId: 0,
      };
      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      await expect(attendancesService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // LEAVE TYPES SERVICE
  // ==========================================================================

  describe('leaveTypesService', () => {
    it('should fetch all leave types', async () => {
      const mockTypes = createMockLeaveTypes(3);
      const mockResponse = createMockAPICollectionResponse(
        mockTypes.map(type => ({
          id: type.id,
          attributes: {
            name: type.name,
            description: type.description,
            default_days: type.defaultDays,
            is_paid: type.isPaid,
          },
        })),
        'leave-types'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await leaveTypesService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/leave-types'));
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching leave types', async () => {
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      await expect(leaveTypesService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // LEAVES SERVICE
  // ==========================================================================

  describe('leavesService', () => {
    it('should fetch all leaves', async () => {
      const mockLeaves = createMockLeaves(3);
      const mockResponse = createMockAPICollectionResponse(
        mockLeaves.map(leave => ({
          id: leave.id,
          attributes: {
            start_date: leave.startDate,
            end_date: leave.endDate,
            status: leave.status,
            reason: leave.reason,
          },
        })),
        'leaves'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await leavesService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/leaves'));
      expect(result).toEqual(mockResponse);
    });

    it('should fetch leaves with filters', async () => {
      const mockLeaves = createMockLeaves(2);
      const mockResponse = createMockAPICollectionResponse(
        mockLeaves.map(leave => ({ id: leave.id, attributes: { status: leave.status } })),
        'leaves'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await leavesService.getAll({
        'filter[status]': 'approved',
        'filter[employee_id]': '1',
      });

      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=approved')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a new leave', async () => {
      const formData = {
        startDate: '2025-02-01',
        endDate: '2025-02-05',
        status: 'pending' as const,
        reason: 'Vacation',
        employeeId: 1,
        leaveTypeId: 1,
      };
      const mockResponse = createMockAPIResponse('10', 'leaves', {
        start_date: formData.startDate,
        end_date: formData.endDate,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const result = await leavesService.create(formData);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/leaves', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should update an existing leave', async () => {
      const formData = {
        startDate: '2025-02-01',
        endDate: '2025-02-10',
        status: 'approved' as const,
        reason: 'Extended vacation',
        employeeId: 1,
        leaveTypeId: 1,
        approverId: 2,
      };
      const mockResponse = createMockAPIResponse('3', 'leaves', {
        status: formData.status,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const result = await leavesService.update('3', formData);

      expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/leaves/3', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should delete a leave', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      const result = await leavesService.delete('5');

      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/leaves/5');
      expect(result).toEqual({});
    });

    it('should handle errors when creating leave', async () => {
      const formData = {
        startDate: '',
        endDate: '',
        status: 'pending' as const,
        reason: '',
        employeeId: 0,
        leaveTypeId: 0,
      };
      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      await expect(leavesService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
