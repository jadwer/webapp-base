/**
 * Employees Table Component
 *
 * Data table for employees with actions
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Employee } from '../types'

interface EmployeesTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const StatusBadge: React.FC<{ status: Employee['status'] }> = ({ status }) => {
  const statusConfig = {
    active: { color: 'success', text: 'Activo' },
    inactive: { color: 'warning', text: 'Inactivo' },
    terminated: { color: 'danger', text: 'Terminado' },
  }

  const config = statusConfig[status]

  return (
    <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color}`}>
      {config.text}
    </span>
  )
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
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

  if (employees.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        No se encontraron empleados.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Departamento</th>
            <th>Puesto</th>
            <th>Estado</th>
            <th>Salario</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <code className="text-muted">{employee.employeeCode}</code>
              </td>
              <td>
                <div>
                  <div className="fw-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  {employee.phone && (
                    <small className="text-muted">
                      <i className="bi bi-telephone me-1" />
                      {employee.phone}
                    </small>
                  )}
                </div>
              </td>
              <td>
                <a href={`mailto:${employee.email}`} className="text-decoration-none">
                  {employee.email}
                </a>
              </td>
              <td>
                {employee.department ? (
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {employee.department.name}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                {employee.position ? (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary">
                    {employee.position.title}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <StatusBadge status={employee.status} />
              </td>
              <td>
                <span className="fw-medium">
                  ${employee.salary.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    size="small"
                    variant="primary"
                    buttonStyle="outline"
                    onClick={() => onEdit(employee)}
                    title="Editar empleado"
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    buttonStyle="outline"
                    onClick={() => onDelete(employee.id)}
                    title="Eliminar empleado"
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

export default EmployeesTable
