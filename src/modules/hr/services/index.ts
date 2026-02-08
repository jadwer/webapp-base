/**
 * HR Module - Services
 *
 * API layer for HR entities with CRUD operations
 * Focus on main entities: Employee, Attendance, Leave, PayrollPeriod
 */

import axiosClient from '@/lib/axiosClient'
import type {
  EmployeeFormData,
  AttendanceFormData,
  LeaveFormData,
  PayrollPeriodFormData,
} from '../types'
import {
  transformEmployeeFormToJsonApi,
  transformAttendanceFormToJsonApi,
  transformLeaveFormToJsonApi,
  transformPayrollPeriodFormToJsonApi,
} from '../utils/transformers'

// ============================================================================
// EMPLOYEES SERVICE
// ============================================================================

export const employeesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('include', 'department,position')

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const url = `/api/v1/employees?${queryParams.toString()}`
      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(
        `/api/v1/employees/${id}?include=department,position,attendances,leaves,payrollItems`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: EmployeeFormData) => {
    try {
      const payload = transformEmployeeFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/employees', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: EmployeeFormData) => {
    try {
      const payload = transformEmployeeFormToJsonApi(data, 'employees', id)

      const response = await axiosClient.patch(`/api/v1/employees/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/employees/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // ===== EMPLOYEE SPECIFIC ENDPOINTS =====

  getLeaveBalance: async (id: string): Promise<{
    balances: Array<{ leaveType: string; entitled: number; used: number; remaining: number }>
  }> => {
    const response = await axiosClient.get(`/api/v1/employees/${id}/leave-balance`)
    return response.data
  },

  getPayrollSummary: async (id: string, periodId: number): Promise<{
    employee: { id: number; name: string }
    period: { id: number; name: string }
    earnings: Array<{ type: string; amount: number }>
    deductions: Array<{ type: string; amount: number }>
    grossPay: number
    totalDeductions: number
    netPay: number
  }> => {
    const response = await axiosClient.get(`/api/v1/employees/${id}/payroll-summary`, {
      params: { period_id: periodId }
    })
    return response.data
  },
}

// ============================================================================
// ATTENDANCES SERVICE
// ============================================================================

export const attendancesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('include', 'employee')

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const url = `/api/v1/attendances?${queryParams.toString()}`
      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: AttendanceFormData) => {
    try {
      const payload = transformAttendanceFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/attendances', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: AttendanceFormData) => {
    try {
      const payload = transformAttendanceFormToJsonApi(data, 'attendances', id)

      const response = await axiosClient.patch(`/api/v1/attendances/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/attendances/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// LEAVES SERVICE
// ============================================================================

export const leavesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('include', 'employee,leaveType')

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const url = `/api/v1/leaves?${queryParams.toString()}`
      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: LeaveFormData) => {
    try {
      const payload = transformLeaveFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/leaves', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: LeaveFormData) => {
    try {
      const payload = transformLeaveFormToJsonApi(data, 'leaves', id)

      const response = await axiosClient.patch(`/api/v1/leaves/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/leaves/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // ===== LEAVE APPROVAL WORKFLOW =====

  approve: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/leaves/${id}/approve`)
    return response.data
  },

  reject: async (id: string, reason: string) => {
    const response = await axiosClient.post(`/api/v1/leaves/${id}/reject`, { reason })
    return response.data
  },
}

// ============================================================================
// PAYROLL PERIODS SERVICE
// ============================================================================

export const payrollPeriodsService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()

      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/payroll-periods?${queryString}`
        : '/api/v1/payroll-periods'

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: PayrollPeriodFormData) => {
    try {
      const payload = transformPayrollPeriodFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/payroll-periods', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: PayrollPeriodFormData) => {
    try {
      const payload = transformPayrollPeriodFormToJsonApi(data, 'payroll-periods', id)

      const response = await axiosClient.patch(`/api/v1/payroll-periods/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/payroll-periods/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// SIMPLE ENTITIES SERVICES (Department, Position, LeaveType)
// ============================================================================

export const departmentsService = {
  getAll: async () => {
    try {
      const response = await axiosClient.get('/api/v1/departments')
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const positionsService = {
  getAll: async () => {
    try {
      const response = await axiosClient.get('/api/v1/positions')
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const leaveTypesService = {
  getAll: async () => {
    try {
      const response = await axiosClient.get('/api/v1/leave-types')
      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// PERFORMANCE REVIEWS SERVICE
// ============================================================================

export interface PerformanceReview {
  id: string
  employeeId: number
  reviewerId: number
  reviewPeriod: string
  status: 'draft' | 'submitted' | 'reviewed' | 'completed'
  overallRating: number | null
  goals: Record<string, unknown>
  achievements: string | null
  areasForImprovement: string | null
  comments: string | null
  employeeComments: string | null
  completedAt: string | null
  createdAt: string
}

export const performanceReviewsService = {
  getAll: async (params?: Record<string, unknown>) => {
    const queryParams = new URLSearchParams()
    queryParams.append('include', 'employee,reviewer')

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, String(params[key]))
        }
      })
    }

    const response = await axiosClient.get(`/api/v1/performance-reviews?${queryParams.toString()}`)
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/performance-reviews/${id}?include=employee,reviewer`)
    return response.data
  },

  create: async (data: Partial<PerformanceReview>) => {
    const response = await axiosClient.post('/api/v1/performance-reviews', {
      data: {
        type: 'performance-reviews',
        attributes: data
      }
    })
    return response.data
  },

  update: async (id: string, data: Partial<PerformanceReview>) => {
    const response = await axiosClient.patch(`/api/v1/performance-reviews/${id}`, {
      data: {
        type: 'performance-reviews',
        id,
        attributes: data
      }
    })
    return response.data
  },

  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/performance-reviews/${id}`)
  },

  submit: async (id: string) => {
    const response = await axiosClient.post(`/api/v1/performance-reviews/${id}/submit`)
    return response.data
  },

  complete: async (id: string, data: {
    overall_rating: number
    achievements?: string
    areas_for_improvement?: string
  }) => {
    const response = await axiosClient.post(`/api/v1/performance-reviews/${id}/complete`, data)
    return response.data
  },
}

// ============================================================================
// EMPLOYEE SELF-SERVICE
// ============================================================================

export const employeeSelfService = {
  getMe: async () => {
    const response = await axiosClient.get('/api/v1/employees/me')
    return response.data
  },

  getMyAttendances: async (month?: string) => {
    const params = month ? { month } : {}
    const response = await axiosClient.get('/api/v1/employees/me/attendances', { params })
    return response.data
  },

  getMyLeaveBalance: async () => {
    const response = await axiosClient.get('/api/v1/employees/me/leave-balance')
    return response.data
  },

  getMyPayslips: async () => {
    const response = await axiosClient.get('/api/v1/employees/me/payslips')
    return response.data
  },

  clockIn: async () => {
    const response = await axiosClient.post('/api/v1/employees/me/clock-in')
    return response.data
  },

  clockOut: async () => {
    const response = await axiosClient.post('/api/v1/employees/me/clock-out')
    return response.data
  },
}
