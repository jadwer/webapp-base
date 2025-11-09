/**
 * HR Module - Core Entities Services Tests
 * Tests for Department, Position, and Employee services
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import {
  departmentsService,
  positionsService,
  employeesService,
} from '../../services';
import {
  createMockDepartment,
  createMockDepartments,
  createMockPosition,
  createMockPositions,
  createMockEmployee,
  createMockEmployees,
  createMockAPIResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('Core Entities Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  // ==========================================================================
  // DEPARTMENTS SERVICE (Read-only)
  // ==========================================================================

  describe('departmentsService', () => {
    it('should fetch all departments', async () => {
      const mockDepts = createMockDepartments(3);
      const mockResponse = createMockAPICollectionResponse(
        mockDepts.map(dept => ({
          id: dept.id,
          attributes: { name: dept.name, description: dept.description },
        })),
        'departments'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await departmentsService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/departments');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching departments', async () => {
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      await expect(departmentsService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // POSITIONS SERVICE (Read-only)
  // ==========================================================================

  describe('positionsService', () => {
    it('should fetch all positions', async () => {
      const mockPositions = createMockPositions(3);
      const mockResponse = createMockAPICollectionResponse(
        mockPositions.map(pos => ({
          id: pos.id,
          attributes: { title: pos.title, description: pos.description },
        })),
        'positions'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await positionsService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/positions');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching positions', async () => {
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      await expect(positionsService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // EMPLOYEES SERVICE
  // ==========================================================================

  describe('employeesService', () => {
    it('should fetch all employees with default includes', async () => {
      const mockEmployees = createMockEmployees(3);
      const mockResponse = createMockAPICollectionResponse(
        mockEmployees.map(emp => ({
          id: emp.id,
          attributes: {
            employee_code: emp.employeeCode,
            first_name: emp.firstName,
            last_name: emp.lastName,
            email: emp.email,
          },
        })),
        'employees'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await employeesService.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('include=department%2Cposition')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch employees with filters', async () => {
      const mockEmployees = createMockEmployees(2);
      const mockResponse = createMockAPICollectionResponse(
        mockEmployees.map(emp => ({ id: emp.id, attributes: { first_name: emp.firstName } })),
        'employees'
      );

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await employeesService.getAll({
        'filter[status]': 'active',
        'filter[department_id]': '1',
      });

      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=active')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch a single employee by ID with all includes', async () => {
      const mockEmp = createMockEmployee({ id: '5' });
      const mockResponse = createMockAPIResponse('5', 'employees', {
        employee_code: mockEmp.employeeCode,
        first_name: mockEmp.firstName,
        last_name: mockEmp.lastName,
      });

      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const result = await employeesService.getById('5');

      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/employees/5?include=department,position,attendances,leaves,payrollItems'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a new employee', async () => {
      const formData = {
        employeeCode: 'EMP999',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        hireDate: '2025-01-01',
        salary: 60000,
        status: 'active' as const,
      };
      const mockResponse = createMockAPIResponse('10', 'employees', {
        employee_code: formData.employeeCode,
        first_name: formData.firstName,
      });

      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const result = await employeesService.create(formData);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/employees', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should update an existing employee', async () => {
      const formData = {
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Updated',
        email: 'john.updated@example.com',
        hireDate: '2024-01-01',
        salary: 65000,
        status: 'active' as const,
      };
      const mockResponse = createMockAPIResponse('3', 'employees', {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const result = await employeesService.update('3', formData);

      expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/employees/3', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should delete an employee', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: {} });

      const result = await employeesService.delete('5');

      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/employees/5');
      expect(result).toEqual({});
    });

    it('should handle errors when creating employee', async () => {
      const formData = {
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: 'invalid',
        hireDate: '',
        salary: -1,
        status: 'active' as const,
      };
      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      await expect(employeesService.create(formData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
