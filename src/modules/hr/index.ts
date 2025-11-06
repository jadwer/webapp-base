/**
 * HR Module - Main Entry Point
 *
 * Centralized exports for the HR module
 * Entities: Department, Position, Employee, Attendance, LeaveType, Leave,
 *           PayrollPeriod, PayrollItem, PerformanceReview
 */

// Types
export type {
  Department,
  DepartmentFormData,
  Position,
  PositionFormData,
  Employee,
  EmployeeFormData,
  EmployeeStatus,
  Attendance,
  AttendanceFormData,
  AttendanceStatus,
  LeaveType,
  LeaveTypeFormData,
  Leave,
  LeaveFormData,
  LeaveStatus,
  PayrollPeriod,
  PayrollPeriodFormData,
  PeriodType,
  PayrollStatus,
  PayrollItem,
  PayrollItemFormData,
  PerformanceReview,
  PerformanceReviewFormData,
  ReviewStatus,
  EmployeesFilters,
  AttendancesFilters,
  LeavesFilters,
  PayrollPeriodsFilters,
  EmployeeSummary,
} from './types'

// Services
export {
  employeesService,
  attendancesService,
  leavesService,
  payrollPeriodsService,
  departmentsService,
  positionsService,
  leaveTypesService,
} from './services'

// Hooks
export {
  useEmployees,
  useEmployee,
  useEmployeesMutations,
  useAttendances,
  useAttendancesMutations,
  useLeaves,
  useLeavesMutations,
  usePayrollPeriods,
  usePayrollPeriodsMutations,
  useDepartments,
  usePositions,
  useLeaveTypes,
} from './hooks'

// Transformers
export {
  transformJsonApiEmployee,
  transformEmployeeFormToJsonApi,
  transformEmployeesResponse,
  transformJsonApiAttendance,
  transformAttendanceFormToJsonApi,
  transformAttendancesResponse,
  transformJsonApiLeave,
  transformLeaveFormToJsonApi,
  transformLeavesResponse,
  transformJsonApiPayrollPeriod,
  transformPayrollPeriodFormToJsonApi,
  transformPayrollPeriodsResponse,
  transformJsonApiDepartment,
  transformJsonApiPosition,
  transformJsonApiLeaveType,
} from './utils/transformers'

// Components
export {
  HRIndexPage,
} from './components'
