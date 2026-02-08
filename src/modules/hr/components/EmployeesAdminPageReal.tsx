/**
 * Employees Admin Page - Complete Implementation
 *
 * Full-featured admin page for employee management with CRUD operations
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { useEmployees, useEmployeesMutations } from '../hooks'
import { EmployeeForm } from './EmployeeForm'
import { EmployeesTable } from './EmployeesTable'
import { EmployeesFilters } from './EmployeesFilters'
import type { Employee, EmployeeFormData, EmployeesFilters as FiltersType } from '../types'

export const EmployeesAdminPageReal: React.FC = () => {
  const [filters, setFilters] = useState<FiltersType>({})
  const { employees, isLoading, mutate } = useEmployees(filters)
  const { createEmployee, updateEmployee, deleteEmployee } = useEmployeesMutations()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Create Employee
  const handleCreate = useCallback(async (data: EmployeeFormData) => {
    try {
      await createEmployee(data)
      setShowCreateModal(false)
      mutate()
      showToast('Empleado creado exitosamente', 'success')
    } catch {
      showToast('Error al crear empleado', 'error')
    }
  }, [createEmployee, mutate])

  // Update Employee
  const handleUpdate = useCallback(async (data: EmployeeFormData) => {
    if (!editingEmployee) return

    try {
      await updateEmployee(editingEmployee.id, data)
      setEditingEmployee(null)
      mutate()
      showToast('Empleado actualizado exitosamente', 'success')
    } catch {
      showToast('Error al actualizar empleado', 'error')
    }
  }, [editingEmployee, updateEmployee, mutate])

  // Delete Employee
  const handleDelete = useCallback(async (employee: Employee) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro de que deseas eliminar al empleado ${employee.firstName} ${employee.lastName}? Esta acción no se puede deshacer.`,
      {
        title: 'Confirmar Eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
      }
    )

    if (!confirmed) return

    try {
      await deleteEmployee(employee.id)
      mutate()
      showToast('Empleado eliminado exitosamente', 'success')
    } catch {
      showToast('Error al eliminar empleado', 'error')
    }
  }, [deleteEmployee, mutate])

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`
    toast.style.zIndex = '9999'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  const activeEmployees = employees.filter(e => e.status === 'active').length

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-people-fill me-3" />
                Gestión de Empleados
              </h1>
              <p className="text-muted">
                Administra la información de empleados, departamentos y puestos
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              startIcon={<i className="bi bi-plus-circle" />}
            >
              Nuevo Empleado
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Empleados</h6>
                  <h3 className="mb-0">{employees.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-person-check text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Activos</h6>
                  <h3 className="mb-0">{activeEmployees}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded p-3">
                    <i className="bi bi-person-dash text-warning" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Inactivos</h6>
                  <h3 className="mb-0">
                    {employees.filter(e => e.status === 'inactive').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded p-3">
                    <i className="bi bi-person-x text-danger" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Terminados</h6>
                  <h3 className="mb-0">
                    {employees.filter(e => e.status === 'terminated').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <EmployeesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <EmployeesTable
            employees={employees}
            onEdit={setEditingEmployee}
            onDelete={(id) => {
              const employee = employees.find(e => e.id === id)
              if (employee) handleDelete(employee)
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2" />
                  Nuevo Empleado
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <div className="modal-body">
                <EmployeeForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil me-2" />
                  Editar Empleado
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingEmployee(null)}
                />
              </div>
              <div className="modal-body">
                <EmployeeForm
                  initialData={{
                    employeeCode: editingEmployee.employeeCode,
                    firstName: editingEmployee.firstName,
                    lastName: editingEmployee.lastName,
                    email: editingEmployee.email,
                    phone: editingEmployee.phone,
                    hireDate: editingEmployee.hireDate,
                    birthDate: editingEmployee.birthDate,
                    salary: editingEmployee.salary,
                    status: editingEmployee.status,
                    terminationDate: editingEmployee.terminationDate,
                    terminationReason: editingEmployee.terminationReason,
                    address: editingEmployee.address,
                    emergencyContactName: editingEmployee.emergencyContactName,
                    emergencyContactPhone: editingEmployee.emergencyContactPhone,
                    departmentId: editingEmployee.departmentId,
                    positionId: editingEmployee.positionId,
                    userId: editingEmployee.userId,
                  }}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingEmployee(null)}
                  isEdit
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default EmployeesAdminPageReal
