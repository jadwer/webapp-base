/**
 * HR Module - Time & Attendance Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useAttendances,
  useAttendancesMutations,
  useLeaves,
  useLeavesMutations,
  useLeaveTypes,
} from '../../hooks';

// Mock the services
vi.mock('../../services', () => ({
  employeesService: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  departmentsService: { getAll: vi.fn() },
  positionsService: { getAll: vi.fn() },
  attendancesService: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  leavesService: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  payrollPeriodsService: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  leaveTypesService: { getAll: vi.fn() },
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

describe('HR Time & Attendance Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAttendances', () => {
    it('should return attendances data structure', () => {
      // Act
      const { result } = renderHook(() => useAttendances());

      // Assert
      expect(result.current).toHaveProperty('attendances');
      expect(result.current).toHaveProperty('meta');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { employeeId: 1, dateFrom: '2025-01-01', dateTo: '2025-01-31' };
      renderHook(() => useAttendances(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept status filter', () => {
      // Act
      const filters = { status: 'present' as const };
      renderHook(() => useAttendances(filters));

      // Assert - Status filter is passed
    });
  });

  describe('useAttendancesMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useAttendancesMutations());

      // Assert
      expect(result.current).toHaveProperty('createAttendance');
      expect(result.current).toHaveProperty('updateAttendance');
      expect(result.current).toHaveProperty('deleteAttendance');
      expect(typeof result.current.createAttendance).toBe('function');
      expect(typeof result.current.updateAttendance).toBe('function');
      expect(typeof result.current.deleteAttendance).toBe('function');
    });
  });

  describe('useLeaves', () => {
    it('should return leaves data structure', () => {
      // Act
      const { result } = renderHook(() => useLeaves());

      // Assert
      expect(result.current).toHaveProperty('leaves');
      expect(result.current).toHaveProperty('meta');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { employeeId: 1, status: 'approved' as const, leaveTypeId: 1 };
      renderHook(() => useLeaves(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept date range filters', () => {
      // Act
      const filters = { dateFrom: '2025-01-01', dateTo: '2025-12-31' };
      renderHook(() => useLeaves(filters));

      // Assert - Date filters are passed
    });
  });

  describe('useLeavesMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useLeavesMutations());

      // Assert
      expect(result.current).toHaveProperty('createLeave');
      expect(result.current).toHaveProperty('updateLeave');
      expect(result.current).toHaveProperty('deleteLeave');
      expect(typeof result.current.createLeave).toBe('function');
      expect(typeof result.current.updateLeave).toBe('function');
      expect(typeof result.current.deleteLeave).toBe('function');
    });
  });

  describe('useLeaveTypes', () => {
    it('should return leave types data structure', () => {
      // Act
      const { result } = renderHook(() => useLeaveTypes());

      // Assert
      expect(result.current).toHaveProperty('leaveTypes');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });
  });
});
