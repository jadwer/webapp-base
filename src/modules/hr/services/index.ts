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
      console.log('🚀 [Service] Fetching employees with params:', params)

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
      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Employees response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching employees:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      console.log('🚀 [Service] Fetching employee by ID:', id)
      const response = await axiosClient.get(
        `/api/v1/employees/${id}?include=department,position,attendances,leaves,payrollItems`
      )
      console.log('✅ [Service] Employee response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching employee:', error)
      throw error
    }
  },

  create: async (data: EmployeeFormData) => {
    try {
      console.log('🚀 [Service] Creating employee:', data)
      const payload = transformEmployeeFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/employees', payload)
      console.log('✅ [Service] Created employee:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating employee:', error)
      throw error
    }
  },

  update: async (id: string, data: EmployeeFormData) => {
    try {
      console.log('🚀 [Service] Updating employee:', id, data)
      const payload = transformEmployeeFormToJsonApi(data, 'employees', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/employees/${id}`, payload)
      console.log('✅ [Service] Updated employee:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating employee:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting employee:', id)
      const response = await axiosClient.delete(`/api/v1/employees/${id}`)
      console.log('✅ [Service] Deleted employee')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting employee:', error)
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
      console.log('🚀 [Service] Fetching attendances with params:', params)

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
      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Attendances response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching attendances:', error)
      throw error
    }
  },

  create: async (data: AttendanceFormData) => {
    try {
      console.log('🚀 [Service] Creating attendance:', data)
      const payload = transformAttendanceFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/attendances', payload)
      console.log('✅ [Service] Created attendance:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating attendance:', error)
      throw error
    }
  },

  update: async (id: string, data: AttendanceFormData) => {
    try {
      console.log('🚀 [Service] Updating attendance:', id, data)
      const payload = transformAttendanceFormToJsonApi(data, 'attendances', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/attendances/${id}`, payload)
      console.log('✅ [Service] Updated attendance:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating attendance:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting attendance:', id)
      const response = await axiosClient.delete(`/api/v1/attendances/${id}`)
      console.log('✅ [Service] Deleted attendance')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting attendance:', error)
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
      console.log('🚀 [Service] Fetching leaves with params:', params)

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
      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Leaves response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching leaves:', error)
      throw error
    }
  },

  create: async (data: LeaveFormData) => {
    try {
      console.log('🚀 [Service] Creating leave:', data)
      const payload = transformLeaveFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/leaves', payload)
      console.log('✅ [Service] Created leave:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating leave:', error)
      throw error
    }
  },

  update: async (id: string, data: LeaveFormData) => {
    try {
      console.log('🚀 [Service] Updating leave:', id, data)
      const payload = transformLeaveFormToJsonApi(data, 'leaves', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/leaves/${id}`, payload)
      console.log('✅ [Service] Updated leave:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating leave:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting leave:', id)
      const response = await axiosClient.delete(`/api/v1/leaves/${id}`)
      console.log('✅ [Service] Deleted leave')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting leave:', error)
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
      console.log('🚀 [Service] Fetching payroll periods with params:', params)

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

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Payroll periods response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching payroll periods:', error)
      throw error
    }
  },

  create: async (data: PayrollPeriodFormData) => {
    try {
      console.log('🚀 [Service] Creating payroll period:', data)
      const payload = transformPayrollPeriodFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/payroll-periods', payload)
      console.log('✅ [Service] Created payroll period:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating payroll period:', error)
      throw error
    }
  },

  update: async (id: string, data: PayrollPeriodFormData) => {
    try {
      console.log('🚀 [Service] Updating payroll period:', id, data)
      const payload = transformPayrollPeriodFormToJsonApi(data, 'payroll-periods', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/payroll-periods/${id}`, payload)
      console.log('✅ [Service] Updated payroll period:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating payroll period:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting payroll period:', id)
      const response = await axiosClient.delete(`/api/v1/payroll-periods/${id}`)
      console.log('✅ [Service] Deleted payroll period')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting payroll period:', error)
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
      console.error('❌ [Service] Error fetching departments:', error)
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
      console.error('❌ [Service] Error fetching positions:', error)
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
      console.error('❌ [Service] Error fetching leave types:', error)
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
