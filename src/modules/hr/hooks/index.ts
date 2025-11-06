/**
 * HR Module - SWR Hooks
 *
 * Data fetching and mutation hooks for HR entities
 * Focus on main entities: Employee, Attendance, Leave, PayrollPeriod
 */

import useSWR from 'swr'
import { useCallback } from 'react'
import {
  employeesService,
  attendancesService,
  leavesService,
  payrollPeriodsService,
  departmentsService,
  positionsService,
  leaveTypesService,
} from '../services'
import {
  transformEmployeesResponse,
  transformAttendancesResponse,
  transformLeavesResponse,
  transformPayrollPeriodsResponse,
} from '../utils/transformers'
import type {
  EmployeesFilters,
  AttendancesFilters,
  LeavesFilters,
  PayrollPeriodsFilters,
  EmployeeFormData,
  AttendanceFormData,
  LeaveFormData,
  PayrollPeriodFormData,
} from '../types'

// ============================================================================
// EMPLOYEES HOOKS
// ============================================================================

export const useEmployees = (params?: EmployeesFilters) => {
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.departmentId) {
    queryParams['filter[department_id]'] = params.departmentId
  }
  if (params?.positionId) {
    queryParams['filter[position_id]'] = params.positionId
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/employees', queryParams]
    : '/api/v1/employees'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await employeesService.getAll(queryParams)
      const transformed = transformEmployeesResponse(response)
      console.log('✅ [Hook] Transformed employees:', transformed)
      return transformed
    }
  )

  return {
    employees: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useEmployee = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/employees/${id}` : null,
    async () => {
      const response = await employeesService.getById(id)
      const transformed = transformEmployeesResponse(response)
      console.log('✅ [Hook] Transformed employee:', transformed.data)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    employee: data,
    isLoading,
    error,
    mutate,
  }
}

export const useEmployeesMutations = () => {
  return {
    createEmployee: useCallback(async (data: EmployeeFormData) => {
      return await employeesService.create(data)
    }, []),

    updateEmployee: useCallback(async (id: string, data: EmployeeFormData) => {
      return await employeesService.update(id, data)
    }, []),

    deleteEmployee: useCallback(async (id: string) => {
      return await employeesService.delete(id)
    }, []),
  }
}

// ============================================================================
// ATTENDANCES HOOKS
// ============================================================================

export const useAttendances = (params?: AttendancesFilters) => {
  const queryParams: Record<string, unknown> = {}

  if (params?.employeeId) {
    queryParams['filter[employee_id]'] = params.employeeId
  }
  if (params?.dateFrom) {
    queryParams['filter[date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[date_to]'] = params.dateTo
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/attendances', queryParams]
    : '/api/v1/attendances'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await attendancesService.getAll(queryParams)
      const transformed = transformAttendancesResponse(response)
      console.log('✅ [Hook] Transformed attendances:', transformed)
      return transformed
    }
  )

  return {
    attendances: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useAttendancesMutations = () => {
  return {
    createAttendance: useCallback(async (data: AttendanceFormData) => {
      return await attendancesService.create(data)
    }, []),

    updateAttendance: useCallback(async (id: string, data: AttendanceFormData) => {
      return await attendancesService.update(id, data)
    }, []),

    deleteAttendance: useCallback(async (id: string) => {
      return await attendancesService.delete(id)
    }, []),
  }
}

// ============================================================================
// LEAVES HOOKS
// ============================================================================

export const useLeaves = (params?: LeavesFilters) => {
  const queryParams: Record<string, unknown> = {}

  if (params?.employeeId) {
    queryParams['filter[employee_id]'] = params.employeeId
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.leaveTypeId) {
    queryParams['filter[leave_type_id]'] = params.leaveTypeId
  }
  if (params?.dateFrom) {
    queryParams['filter[date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/leaves', queryParams]
    : '/api/v1/leaves'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await leavesService.getAll(queryParams)
      const transformed = transformLeavesResponse(response)
      console.log('✅ [Hook] Transformed leaves:', transformed)
      return transformed
    }
  )

  return {
    leaves: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useLeavesMutations = () => {
  return {
    createLeave: useCallback(async (data: LeaveFormData) => {
      return await leavesService.create(data)
    }, []),

    updateLeave: useCallback(async (id: string, data: LeaveFormData) => {
      return await leavesService.update(id, data)
    }, []),

    deleteLeave: useCallback(async (id: string) => {
      return await leavesService.delete(id)
    }, []),
  }
}

// ============================================================================
// PAYROLL PERIODS HOOKS
// ============================================================================

export const usePayrollPeriods = (params?: PayrollPeriodsFilters) => {
  const queryParams: Record<string, unknown> = {}

  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.periodType) {
    queryParams['filter[period_type]'] = params.periodType
  }
  if (params?.dateFrom) {
    queryParams['filter[date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/payroll-periods', queryParams]
    : '/api/v1/payroll-periods'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await payrollPeriodsService.getAll(queryParams)
      const transformed = transformPayrollPeriodsResponse(response)
      console.log('✅ [Hook] Transformed payroll periods:', transformed)
      return transformed
    }
  )

  return {
    payrollPeriods: data?.data || [],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const usePayrollPeriodsMutations = () => {
  return {
    createPayrollPeriod: useCallback(async (data: PayrollPeriodFormData) => {
      return await payrollPeriodsService.create(data)
    }, []),

    updatePayrollPeriod: useCallback(async (id: string, data: PayrollPeriodFormData) => {
      return await payrollPeriodsService.update(id, data)
    }, []),

    deletePayrollPeriod: useCallback(async (id: string) => {
      return await payrollPeriodsService.delete(id)
    }, []),
  }
}

// ============================================================================
// SIMPLE ENTITIES HOOKS (Department, Position, LeaveType)
// ============================================================================

export const useDepartments = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/departments',
    async () => {
      const response = await departmentsService.getAll()
      return response
    }
  )

  return {
    departments: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}

export const usePositions = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/positions',
    async () => {
      const response = await positionsService.getAll()
      return response
    }
  )

  return {
    positions: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}

export const useLeaveTypes = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/leave-types',
    async () => {
      const response = await leaveTypesService.getAll()
      return response
    }
  )

  return {
    leaveTypes: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}
