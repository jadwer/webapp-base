/**
 * Attendances Table Component
 *
 * Data table for attendance records with calculated hours
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Attendance } from '../types'

interface AttendancesTableProps {
  attendances: Attendance[]
  onEdit: (attendance: Attendance) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const StatusBadge: React.FC<{ status: Attendance['status'] }> = ({ status }) => {
  const statusConfig = {
    present: { color: 'success', text: 'Presente', icon: 'check-circle' },
    absent: { color: 'danger', text: 'Ausente', icon: 'x-circle' },
    late: { color: 'warning', text: 'Tarde', icon: 'clock' },
    half_day: { color: 'info', text: 'Medio Día', icon: 'clock-history' },
  }

  const config = statusConfig[status]

  return (
    <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color}`}>
      <i className={`bi bi-${config.icon} me-1`} />
      {config.text}
    </span>
  )
}

export const AttendancesTable: React.FC<AttendancesTableProps> = ({
  attendances,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (attendances.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        No se encontraron registros de asistencia.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Empleado</th>
            <th>Fecha</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Horas Trabajadas</th>
            <th>Horas Extra</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((attendance) => (
            <tr key={attendance.id}>
              <td>
                {attendance.employee ? (
                  <div>
                    <div className="fw-medium">
                      {attendance.employee.firstName} {attendance.employee.lastName}
                    </div>
                    <small className="text-muted">
                      {attendance.employee.employeeCode}
                    </small>
                  </div>
                ) : (
                  <span className="text-muted">Sin empleado</span>
                )}
              </td>
              <td>
                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                  {new Date(attendance.date).toLocaleDateString('es-MX')}
                </span>
              </td>
              <td>
                <code className="text-success">{attendance.checkIn}</code>
              </td>
              <td>
                {attendance.checkOut ? (
                  <code className="text-danger">{attendance.checkOut}</code>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <span className="fw-medium">
                  {attendance.hoursWorked.toFixed(2)} hrs
                </span>
              </td>
              <td>
                {attendance.overtimeHours > 0 ? (
                  <span className="text-warning fw-medium">
                    +{attendance.overtimeHours.toFixed(2)} hrs
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <StatusBadge status={attendance.status} />
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    size="small"
                    variant="primary"
                    buttonStyle="outline"
                    onClick={() => onEdit(attendance)}
                    title="Editar registro"
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    buttonStyle="outline"
                    onClick={() => onDelete(attendance.id)}
                    title="Eliminar registro"
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendancesTable
