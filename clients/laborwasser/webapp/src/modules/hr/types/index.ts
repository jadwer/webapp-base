/**
 * HR Module - TypeScript Types
 *
 * Entities: Department, Position, Employee, Attendance, LeaveType, Leave,
 *           PayrollPeriod, PayrollItem, PerformanceReview
 * Backend: Laravel JSON:API with auto-calculated fields
 */

// ============================================================================
// DEPARTMENT
// ============================================================================

export interface Department {
  id: string
  name: string
  description?: string
  managerId?: number
  createdAt: string
  updatedAt: string

  // Included relationships
  manager?: Employee
  employees?: Employee[]
}

export interface DepartmentFormData {
  name: string
  description?: string
  managerId?: number
}

// ============================================================================
// POSITION
// ============================================================================

export interface Position {
  id: string
  title: string
  description?: string
  departmentId?: number
  createdAt: string
  updatedAt: string

  // Included relationships
  department?: Department
  employees?: Employee[]
}

export interface PositionFormData {
  title: string
  description?: string
  departmentId?: number
}

// ============================================================================
// EMPLOYEE
// ============================================================================

export type EmployeeStatus = 'active' | 'inactive' | 'terminated'

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  hireDate: string // YYYY-MM-DD
  birthDate?: string // YYYY-MM-DD
  salary: number
  status: EmployeeStatus
  terminationDate?: string // YYYY-MM-DD
  terminationReason?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  createdAt: string
  updatedAt: string

  // Foreign keys
  departmentId?: number
  positionId?: number
  userId?: number

  // Included relationships
  department?: Department
  position?: Position
  user?: Record<string, unknown>
  attendances?: Attendance[]
  leaves?: Leave[]
  payrollItems?: PayrollItem[]
  performanceReviews?: PerformanceReview[]
}

export interface EmployeeFormData {
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  hireDate: string
  birthDate?: string
  salary: number
  status: EmployeeStatus
  terminationDate?: string
  terminationReason?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  departmentId?: number
  positionId?: number
  userId?: number
}

// ============================================================================
// ATTENDANCE
// ============================================================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day'

export interface Attendance {
  id: string
  date: string // YYYY-MM-DD
  checkIn: string // HH:MM:SS
  checkOut?: string // HH:MM:SS
  hoursWorked: number // Auto-calculated
  overtimeHours: number // Auto-calculated
  status: AttendanceStatus
  notes?: string
  createdAt: string
  updatedAt: string

  // Foreign keys
  employeeId: number

  // Included relationships
  employee?: Employee
}

export interface AttendanceFormData {
  date: string
  checkIn: string
  checkOut?: string
  status: AttendanceStatus
  notes?: string
  employeeId: number
}

// ============================================================================
// LEAVE TYPE
// ============================================================================

export interface LeaveType {
  id: string
  name: string
  description?: string
  defaultDays: number
  isPaid: boolean
  createdAt: string
  updatedAt: string

  // Included relationships
  leaves?: Leave[]
}

export interface LeaveTypeFormData {
  name: string
  description?: string
  defaultDays: number
  isPaid: boolean
}

// ============================================================================
// LEAVE
// ============================================================================

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Leave {
  id: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  daysRequested: number // Auto-calculated
  status: LeaveStatus
  reason: string
  notes?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string

  // Foreign keys
  employeeId: number
  leaveTypeId: number
  approverId?: number

  // Included relationships
  employee?: Employee
  leaveType?: LeaveType
  approver?: Employee
}

export interface LeaveFormData {
  startDate: string
  endDate: string
  status: LeaveStatus
  reason: string
  notes?: string
  employeeId: number
  leaveTypeId: number
  approverId?: number
}

// ============================================================================
// PAYROLL PERIOD
// ============================================================================

export type PeriodType = 'weekly' | 'biweekly' | 'monthly'
export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'closed'

export interface PayrollPeriod {
  id: string
  name: string
  periodType: PeriodType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  paymentDate: string // YYYY-MM-DD
  status: PayrollStatus
  totalGross: number // Auto-calculated
  totalDeductions: number // Auto-calculated
  totalNet: number // Auto-calculated
  notes?: string
  createdAt: string
  updatedAt: string

  // Included relationships
  payrollItems?: PayrollItem[]
}

export interface PayrollPeriodFormData {
  name: string
  periodType: PeriodType
  startDate: string
  endDate: string
  paymentDate: string
  status: PayrollStatus
  notes?: string
}

// ============================================================================
// PAYROLL ITEM
// ============================================================================

export interface PayrollItem {
  id: string
  baseSalary: number
  overtime: number
  bonuses: number
  grossPay: number // Auto-calculated
  socialSecurity: number
  healthInsurance: number
  taxes: number
  otherDeductions: number
  totalDeductions: number // Auto-calculated
  netPay: number // Auto-calculated
  status: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Foreign keys
  employeeId: number
  payrollPeriodId: number

  // Included relationships
  employee?: Employee
  payrollPeriod?: PayrollPeriod
}

export interface PayrollItemFormData {
  baseSalary: number
  overtime: number
  bonuses: number
  socialSecurity: number
  healthInsurance: number
  taxes: number
  otherDeductions: number
  status: string
  notes?: string
  employeeId: number
  payrollPeriodId: number
}

// ============================================================================
// PERFORMANCE REVIEW
// ============================================================================

export type ReviewStatus = 'draft' | 'pending' | 'completed'

export interface PerformanceReview {
  id: string
  reviewDate: string // YYYY-MM-DD
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  overallRating: number // 1-5
  strengths: string
  areasForImprovement: string
  goals: string
  status: ReviewStatus
  notes?: string
  createdAt: string
  updatedAt: string

  // Foreign keys
  employeeId: number
  reviewerId: number

  // Included relationships
  employee?: Employee
  reviewer?: Employee
}

export interface PerformanceReviewFormData {
  reviewDate: string
  periodStart: string
  periodEnd: string
  overallRating: number
  strengths: string
  areasForImprovement: string
  goals: string
  status: ReviewStatus
  notes?: string
  employeeId: number
  reviewerId: number
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface EmployeesFilters {
  search?: string
  status?: EmployeeStatus
  departmentId?: number
  positionId?: number
}

export interface AttendancesFilters {
  employeeId?: number
  dateFrom?: string
  dateTo?: string
  status?: AttendanceStatus
}

export interface LeavesFilters {
  employeeId?: number
  status?: LeaveStatus
  leaveTypeId?: number
  dateFrom?: string
  dateTo?: string
}

export interface PayrollPeriodsFilters {
  status?: PayrollStatus
  periodType?: PeriodType
  dateFrom?: string
  dateTo?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface EmployeeSummary {
  employee: {
    name: string
    code: string
    status: EmployeeStatus
    salary: number
  }
  attendance: {
    totalHours: number
    records: number
  }
  leaves: {
    approvedDays: number
    pendingRequests: number
  }
  lastPayroll?: {
    grossPay: number
    netPay: number
    deductions: number
  }
}
