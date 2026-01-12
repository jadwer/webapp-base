/**
 * HR Module - Test Utilities
 * Mock factories for HR entities
 */

import type {
  Department,
  Position,
  Employee,
  Attendance,
  LeaveType,
  Leave,
  PayrollPeriod,
  PayrollItem,
  PerformanceReview,
} from '../../types';

// ============================================================================
// DEPARTMENT MOCKS
// ============================================================================

export const createMockDepartment = (overrides?: Partial<Department>): Department => ({
  id: '1',
  name: 'Engineering',
  description: 'Software Development Team',
  managerId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockDepartments = (count: number = 3): Department[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockDepartment({
      id: String(i + 1),
      name: `Department ${i + 1}`,
    })
  );
};

// ============================================================================
// POSITION MOCKS
// ============================================================================

export const createMockPosition = (overrides?: Partial<Position>): Position => ({
  id: '1',
  title: 'Software Engineer',
  description: 'Full Stack Developer',
  departmentId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPositions = (count: number = 3): Position[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPosition({
      id: String(i + 1),
      title: `Position ${i + 1}`,
    })
  );
};

// ============================================================================
// EMPLOYEE MOCKS
// ============================================================================

export const createMockEmployee = (overrides?: Partial<Employee>): Employee => ({
  id: '1',
  employeeCode: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0100',
  hireDate: '2024-01-01',
  birthDate: '1990-01-01',
  salary: 50000,
  status: 'active',
  address: '123 Main St',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '555-0101',
  departmentId: 1,
  positionId: 1,
  userId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockEmployees = (count: number = 3): Employee[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockEmployee({
      id: String(i + 1),
      employeeCode: `EMP${String(i + 1).padStart(3, '0')}`,
      firstName: `Employee${i + 1}`,
      email: `employee${i + 1}@example.com`,
    })
  );
};

// ============================================================================
// ATTENDANCE MOCKS
// ============================================================================

export const createMockAttendance = (overrides?: Partial<Attendance>): Attendance => ({
  id: '1',
  date: '2025-01-15',
  checkIn: '09:00:00',
  checkOut: '17:00:00',
  hoursWorked: 8,
  overtimeHours: 0,
  status: 'present',
  notes: 'Regular day',
  employeeId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAttendances = (count: number = 3): Attendance[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockAttendance({
      id: String(i + 1),
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
    })
  );
};

// ============================================================================
// LEAVE TYPE MOCKS
// ============================================================================

export const createMockLeaveType = (overrides?: Partial<LeaveType>): LeaveType => ({
  id: '1',
  name: 'Vacation',
  description: 'Annual vacation leave',
  defaultDays: 15,
  isPaid: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockLeaveTypes = (count: number = 3): LeaveType[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockLeaveType({
      id: String(i + 1),
      name: `Leave Type ${i + 1}`,
    })
  );
};

// ============================================================================
// LEAVE MOCKS
// ============================================================================

export const createMockLeave = (overrides?: Partial<Leave>): Leave => ({
  id: '1',
  startDate: '2025-02-01',
  endDate: '2025-02-05',
  daysRequested: 5,
  status: 'pending',
  reason: 'Family vacation',
  notes: 'Pre-approved by manager',
  employeeId: 1,
  leaveTypeId: 1,
  approverId: 2,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockLeaves = (count: number = 3): Leave[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockLeave({
      id: String(i + 1),
      startDate: `2025-02-${String((i * 5) + 1).padStart(2, '0')}`,
      endDate: `2025-02-${String((i * 5) + 5).padStart(2, '0')}`,
    })
  );
};

// ============================================================================
// PAYROLL PERIOD MOCKS
// ============================================================================

export const createMockPayrollPeriod = (
  overrides?: Partial<PayrollPeriod>
): PayrollPeriod => ({
  id: '1',
  name: 'January 2025',
  periodType: 'monthly',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  paymentDate: '2025-02-05',
  status: 'draft',
  totalGross: 100000,
  totalDeductions: 20000,
  totalNet: 80000,
  notes: 'Regular monthly payroll',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPayrollPeriods = (count: number = 3): PayrollPeriod[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPayrollPeriod({
      id: String(i + 1),
      name: `Payroll Period ${i + 1}`,
    })
  );
};

// ============================================================================
// PAYROLL ITEM MOCKS
// ============================================================================

export const createMockPayrollItem = (overrides?: Partial<PayrollItem>): PayrollItem => ({
  id: '1',
  baseSalary: 5000,
  overtime: 500,
  bonuses: 200,
  grossPay: 5700,
  socialSecurity: 300,
  healthInsurance: 200,
  taxes: 500,
  otherDeductions: 100,
  totalDeductions: 1100,
  netPay: 4600,
  status: 'approved',
  notes: 'Regular payroll item',
  employeeId: 1,
  payrollPeriodId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPayrollItems = (count: number = 3): PayrollItem[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPayrollItem({
      id: String(i + 1),
      employeeId: i + 1,
    })
  );
};

// ============================================================================
// PERFORMANCE REVIEW MOCKS
// ============================================================================

export const createMockPerformanceReview = (
  overrides?: Partial<PerformanceReview>
): PerformanceReview => ({
  id: '1',
  reviewDate: '2025-01-15',
  periodStart: '2024-01-01',
  periodEnd: '2024-12-31',
  overallRating: 4,
  strengths: 'Excellent technical skills',
  areasForImprovement: 'Communication could be better',
  goals: 'Lead a major project',
  status: 'completed',
  notes: 'Great performance',
  employeeId: 1,
  reviewerId: 2,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPerformanceReviews = (count: number = 3): PerformanceReview[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPerformanceReview({
      id: String(i + 1),
      employeeId: i + 1,
    })
  );
};

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

export const createMockAPIResponse = <T>(id: string, type: string, attributes: T) => ({
  jsonapi: { version: '1.1' },
  data: {
    type,
    id,
    attributes,
  },
});

export const createMockAPICollectionResponse = <T>(
  items: Array<{ id: string; attributes: T }>,
  type: string
) => ({
  jsonapi: { version: '1.1' },
  data: items.map(item => ({
    type,
    id: item.id,
    attributes: item.attributes,
  })),
  meta: {
    page: {
      currentPage: 1,
      from: 1,
      lastPage: 1,
      perPage: 15,
      to: items.length,
      total: items.length,
    },
  },
});

export const createMockAxiosError = (status: number, message: string) => {
  const error = new Error(message) as Error & { response?: { status: number; data: unknown } };
  error.response = {
    status,
    data: { message },
  };
  return error;
};

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};

// export const mockConsole = () => {
//   console.log = vi.fn();
//   console.error = vi.fn();
// };
