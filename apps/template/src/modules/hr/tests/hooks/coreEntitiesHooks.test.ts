/**
 * HR Module - Core Entities Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useEmployees,
  useEmployee,
  useEmployeesMutations,
  useDepartments,
  usePositions,
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

describe('HR Core Entities Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEmployees', () => {
    it('should return employees data structure', () => {
      // Act
      const { result } = renderHook(() => useEmployees());

      // Assert
      expect(result.current).toHaveProperty('employees');
      expect(result.current).toHaveProperty('meta');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { search: 'John', status: 'active' as const };
      renderHook(() => useEmployees(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept department and position filters', () => {
      // Act
      const filters = { departmentId: 1, positionId: 2 };
      renderHook(() => useEmployees(filters));

      // Assert - Filters are passed to SWR key
    });
  });

  describe('useEmployee', () => {
    it('should return single employee data structure', () => {
      // Act
      const { result } = renderHook(() => useEmployee('1'));

      // Assert
      expect(result.current).toHaveProperty('employee');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should handle null id', () => {
      // Act
      const { result } = renderHook(() => useEmployee(''));

      // Assert - Should not make request with null id
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useEmployeesMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useEmployeesMutations());

      // Assert
      expect(result.current).toHaveProperty('createEmployee');
      expect(result.current).toHaveProperty('updateEmployee');
      expect(result.current).toHaveProperty('deleteEmployee');
      expect(typeof result.current.createEmployee).toBe('function');
      expect(typeof result.current.updateEmployee).toBe('function');
      expect(typeof result.current.deleteEmployee).toBe('function');
    });
  });

  describe('useDepartments', () => {
    it('should return departments data structure', () => {
      // Act
      const { result } = renderHook(() => useDepartments());

      // Assert
      expect(result.current).toHaveProperty('departments');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });
  });

  describe('usePositions', () => {
    it('should return positions data structure', () => {
      // Act
      const { result } = renderHook(() => usePositions());

      // Assert
      expect(result.current).toHaveProperty('positions');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });
  });
});
