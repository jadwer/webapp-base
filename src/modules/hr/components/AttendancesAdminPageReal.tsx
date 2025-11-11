/**
 * Attendances Admin Page - Complete Implementation
 *
 * Full-featured admin page for attendance management with CRUD operations
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { useAttendances, useAttendancesMutations } from '../hooks'
import { AttendanceForm } from './AttendanceForm'
import { AttendancesTable } from './AttendancesTable'
import { AttendancesFilters } from './AttendancesFilters'
import type { Attendance, AttendanceFormData, AttendancesFilters as FiltersType } from '../types'

export const AttendancesAdminPageReal: React.FC = () => {
  const [filters, setFilters] = useState<FiltersType>({})
  const { attendances, isLoading, mutate } = useAttendances(filters)
  const { createAttendance, updateAttendance, deleteAttendance } = useAttendancesMutations()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Create Attendance
  const handleCreate = useCallback(async (data: AttendanceFormData) => {
    try {
      await createAttendance(data)
      setShowCreateModal(false)
      mutate()
      showToast('Registro de asistencia creado exitosamente', 'success')
    } catch (error) {
      console.error('Error creating attendance:', error)
      showToast('Error al crear registro de asistencia', 'error')
    }
  }, [createAttendance, mutate])

  // Update Attendance
  const handleUpdate = useCallback(async (data: AttendanceFormData) => {
    if (!editingAttendance) return

    try {
      await updateAttendance(editingAttendance.id, data)
      setEditingAttendance(null)
      mutate()
      showToast('Registro de asistencia actualizado exitosamente', 'success')
    } catch (error) {
      console.error('Error updating attendance:', error)
      showToast('Error al actualizar registro de asistencia', 'error')
    }
  }, [editingAttendance, updateAttendance, mutate])

  // Delete Attendance
  const handleDelete = useCallback(async (attendance: Attendance) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro de que deseas eliminar el registro de asistencia del ${new Date(attendance.date).toLocaleDateString('es-MX')}? Esta acción no se puede deshacer.`,
      {
        title: 'Confirmar Eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
      }
    )

    if (!confirmed) return

    try {
      await deleteAttendance(attendance.id)
      mutate()
      showToast('Registro de asistencia eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error deleting attendance:', error)
      showToast('Error al eliminar registro de asistencia', 'error')
    }
  }, [deleteAttendance, mutate])

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`
    toast.style.zIndex = '9999'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  // Calculate stats
  const totalRecords = attendances.length
  const presentCount = attendances.filter(a => a.status === 'present').length
  const absentCount = attendances.filter(a => a.status === 'absent').length
  const lateCount = attendances.filter(a => a.status === 'late').length
  const totalHours = attendances.reduce((sum, a) => sum + a.hoursWorked, 0)
  const totalOvertime = attendances.reduce((sum, a) => sum + a.overtimeHours, 0)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-clock-history me-3" />
                Gestión de Asistencia
              </h1>
              <p className="text-muted">
                Registro y control de asistencia de empleados
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              startIcon={<i className="bi bi-plus-circle" />}
            >
              Registrar Asistencia
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-list-check text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Total Registros</h6>
                  <h4 className="mb-0">{totalRecords}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Presentes</h6>
                  <h4 className="mb-0">{presentCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded p-3">
                    <i className="bi bi-x-circle text-danger" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Ausentes</h6>
                  <h4 className="mb-0">{absentCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded p-3">
                    <i className="bi bi-clock text-warning" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Retardos</h6>
                  <h4 className="mb-0">{lateCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded p-3">
                    <i className="bi bi-hourglass-split text-info" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Hrs Trabajadas</h6>
                  <h4 className="mb-0">{totalHours.toFixed(1)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-secondary bg-opacity-10 rounded p-3">
                    <i className="bi bi-plus-circle text-secondary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted small">Hrs Extra</h6>
                  <h4 className="mb-0">{totalOvertime.toFixed(1)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AttendancesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <AttendancesTable
            attendances={attendances}
            onEdit={setEditingAttendance}
            onDelete={(id) => {
              const attendance = attendances.find(a => a.id === id)
              if (attendance) handleDelete(attendance)
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
                  <i className="bi bi-plus-circle me-2" />
                  Registrar Asistencia
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <div className="modal-body">
                <AttendanceForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAttendance && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil me-2" />
                  Editar Asistencia
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingAttendance(null)}
                />
              </div>
              <div className="modal-body">
                <AttendanceForm
                  initialData={{
                    date: editingAttendance.date,
                    checkIn: editingAttendance.checkIn,
                    checkOut: editingAttendance.checkOut,
                    status: editingAttendance.status,
                    notes: editingAttendance.notes,
                    employeeId: editingAttendance.employeeId,
                  }}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingAttendance(null)}
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

export default AttendancesAdminPageReal
