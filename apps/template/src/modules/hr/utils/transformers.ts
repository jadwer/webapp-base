/**
 * HR Module - JSON:API Transformers
 *
 * Transforms data between JSON:API format and TypeScript.
 * IMPORTANT: Backend now requires camelCase for request attributes.
 * Response parsing still handles both snake_case and camelCase for backwards compatibility.
 * Focus on main entities: Employee, Attendance, Leave, PayrollPeriod
 */

import type {
  Employee,
  EmployeeFormData,
  Attendance,
  AttendanceFormData,
  Leave,
  LeaveFormData,
  PayrollPeriod,
  PayrollPeriodFormData,
  Department,
  Position,
  LeaveType,
} from '../types'

// ============================================================================
// EMPLOYEE TRANSFORMERS
// ============================================================================

export function transformJsonApiEmployee(resource: Record<string, unknown>): Employee {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    employeeCode: (attributes.employee_code || attributes.employeeCode) as string,
    firstName: (attributes.first_name || attributes.firstName) as string,
    lastName: (attributes.last_name || attributes.lastName) as string,
    email: attributes.email as string,
    phone: (attributes.phone as string | undefined),
    hireDate: (attributes.hire_date || attributes.hireDate) as string,
    birthDate: (attributes.birth_date || attributes.birthDate) as string | undefined,
    salary: attributes.salary as number,
    status: attributes.status as Employee['status'],
    terminationDate: (attributes.termination_date || attributes.terminationDate) as string | undefined,
    terminationReason: (attributes.termination_reason || attributes.terminationReason) as string | undefined,
    address: (attributes.address as string | undefined),
    emergencyContactName: (attributes.emergency_contact_name || attributes.emergencyContactName) as string | undefined,
    emergencyContactPhone: (attributes.emergency_contact_phone || attributes.emergencyContactPhone) as string | undefined,
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
    departmentId: (attributes.department_id || attributes.departmentId) as number | undefined,
    positionId: (attributes.position_id || attributes.positionId) as number | undefined,
    userId: (attributes.user_id || attributes.userId) as number | undefined,
  }
}

export function transformEmployeeFormToJsonApi(
  data: EmployeeFormData,
  type = 'employees',
  id?: string
) {
  // Backend requires camelCase for request attributes
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        hireDate: data.hireDate,
        birthDate: data.birthDate || null,
        salary: data.salary,
        status: data.status,
        terminationDate: data.terminationDate || null,
        terminationReason: data.terminationReason || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
      },
      relationships: {} as Record<string, unknown>,
    }
  }

  if (data.departmentId) {
    (payload.data as Record<string, unknown>).relationships = {
      ...(payload.data as Record<string, unknown>).relationships as Record<string, unknown>,
      department: { data: { type: 'departments', id: String(data.departmentId) } }
    }
  }

  if (data.positionId) {
    (payload.data as Record<string, unknown>).relationships = {
      ...(payload.data as Record<string, unknown>).relationships as Record<string, unknown>,
      position: { data: { type: 'positions', id: String(data.positionId) } }
    }
  }

  if (data.userId) {
    (payload.data as Record<string, unknown>).relationships = {
      ...(payload.data as Record<string, unknown>).relationships as Record<string, unknown>,
      user: { data: { type: 'users', id: String(data.userId) } }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformEmployeesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((employee) => transformJsonApiEmployee(employee))
    : [transformJsonApiEmployee(response.data as Record<string, unknown>)]

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// ATTENDANCE TRANSFORMERS
// ============================================================================

export function transformJsonApiAttendance(resource: Record<string, unknown>): Attendance {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    date: attributes.date as string,
    checkIn: (attributes.check_in || attributes.checkIn) as string,
    checkOut: (attributes.check_out || attributes.checkOut) as string | undefined,
    hoursWorked: (attributes.hours_worked || attributes.hoursWorked) as number,
    overtimeHours: (attributes.overtime_hours || attributes.overtimeHours) as number,
    status: attributes.status as Attendance['status'],
    notes: (attributes.notes as string | undefined),
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
    employeeId: (attributes.employee_id || attributes.employeeId) as number,
  }
}

export function transformAttendanceFormToJsonApi(
  data: AttendanceFormData,
  type = 'attendances',
  id?: string
) {
  // Backend requires camelCase for request attributes
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        date: data.date,
        checkIn: data.checkIn,
        checkOut: data.checkOut || null,
        status: data.status,
        notes: data.notes || null,
      },
      relationships: {
        employee: {
          data: { type: 'employees', id: String(data.employeeId) }
        }
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformAttendancesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((attendance) => transformJsonApiAttendance(attendance))
    : [transformJsonApiAttendance(response.data as Record<string, unknown>)]

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// LEAVE TRANSFORMERS
// ============================================================================

export function transformJsonApiLeave(resource: Record<string, unknown>): Leave {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    startDate: (attributes.start_date || attributes.startDate) as string,
    endDate: (attributes.end_date || attributes.endDate) as string,
    daysRequested: (attributes.days_requested || attributes.daysRequested) as number,
    status: attributes.status as Leave['status'],
    reason: attributes.reason as string,
    notes: (attributes.notes as string | undefined),
    approvedAt: (attributes.approved_at || attributes.approvedAt) as string | undefined,
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
    employeeId: (attributes.employee_id || attributes.employeeId) as number,
    leaveTypeId: (attributes.leave_type_id || attributes.leaveTypeId) as number,
    approverId: (attributes.approver_id || attributes.approverId) as number | undefined,
  }
}

export function transformLeaveFormToJsonApi(
  data: LeaveFormData,
  type = 'leaves',
  id?: string
) {
  // Backend requires camelCase for request attributes
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        reason: data.reason,
        notes: data.notes || null,
      },
      relationships: {
        employee: {
          data: { type: 'employees', id: String(data.employeeId) }
        },
        leaveType: {
          data: { type: 'leave-types', id: String(data.leaveTypeId) }
        }
      }
    }
  }

  if (data.approverId) {
    (payload.data as Record<string, unknown>).relationships = {
      ...(payload.data as Record<string, unknown>).relationships as Record<string, unknown>,
      approver: { data: { type: 'employees', id: String(data.approverId) } }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformLeavesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((leave) => transformJsonApiLeave(leave))
    : [transformJsonApiLeave(response.data as Record<string, unknown>)]

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// PAYROLL PERIOD TRANSFORMERS
// ============================================================================

export function transformJsonApiPayrollPeriod(resource: Record<string, unknown>): PayrollPeriod {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    name: attributes.name as string,
    periodType: (attributes.period_type || attributes.periodType) as PayrollPeriod['periodType'],
    startDate: (attributes.start_date || attributes.startDate) as string,
    endDate: (attributes.end_date || attributes.endDate) as string,
    paymentDate: (attributes.payment_date || attributes.paymentDate) as string,
    status: attributes.status as PayrollPeriod['status'],
    totalGross: (attributes.total_gross || attributes.totalGross) as number,
    totalDeductions: (attributes.total_deductions || attributes.totalDeductions) as number,
    totalNet: (attributes.total_net || attributes.totalNet) as number,
    notes: (attributes.notes as string | undefined),
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
  }
}

export function transformPayrollPeriodFormToJsonApi(
  data: PayrollPeriodFormData,
  type = 'payroll-periods',
  id?: string
) {
  // Backend requires camelCase for request attributes
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        name: data.name,
        periodType: data.periodType,
        startDate: data.startDate,
        endDate: data.endDate,
        paymentDate: data.paymentDate,
        status: data.status,
        notes: data.notes || null,
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformPayrollPeriodsResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((period) => transformJsonApiPayrollPeriod(period))
    : [transformJsonApiPayrollPeriod(response.data as Record<string, unknown>)]

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// SIMPLE ENTITY TRANSFORMERS (Department, Position, LeaveType)
// ============================================================================

export function transformJsonApiDepartment(resource: Record<string, unknown>): Department {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    name: attributes.name as string,
    description: (attributes.description as string | undefined),
    managerId: (attributes.manager_id || attributes.managerId) as number | undefined,
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
  }
}

export function transformJsonApiPosition(resource: Record<string, unknown>): Position {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    title: attributes.title as string,
    description: (attributes.description as string | undefined),
    departmentId: (attributes.department_id || attributes.departmentId) as number | undefined,
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
  }
}

export function transformJsonApiLeaveType(resource: Record<string, unknown>): LeaveType {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    name: attributes.name as string,
    description: (attributes.description as string | undefined),
    defaultDays: (attributes.default_days || attributes.defaultDays) as number,
    isPaid: (attributes.is_paid ?? attributes.isPaid) as boolean,
    createdAt: (attributes.created_at || attributes.createdAt) as string,
    updatedAt: (attributes.updated_at || attributes.updatedAt) as string,
  }
}
