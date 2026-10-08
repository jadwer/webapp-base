import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AttendancesTable } from '../../components/AttendancesTable'
import type { Attendance } from '../../types'

describe('AttendancesTable fechas', () => {
  it('muestra la fecha de asistencia sin correrla un dia (ISO medianoche)', () => {
    const attendance = {
      id: '1',
      date: '2026-10-25T00:00:00.000000Z',
      status: 'present',
      employeeId: 1,
      checkIn: '09:00',
      hoursWorked: 8,
      overtimeHours: 0,
    } as unknown as Attendance
    const { container } = render(
      <AttendancesTable attendances={[attendance]} onEdit={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.textContent).toContain('25/10/2026')
    expect(container.textContent).not.toContain('24/10/2026')
  })
})
