/**
 * Leaves Admin Page - Complete Implementation
 *
 * Full-featured admin page for leave/vacation management with approval workflow
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { useLeaves, useLeavesMutations, useEmployees, useLeaveTypes } from '../hooks'
import type { Leave, LeaveFormData, LeavesFilters as FiltersType, LeaveStatus } from '../types'

const LeaveStatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const config = {
    pending: { color: 'warning', text: 'Pendiente', icon: 'clock' },
    approved: { color: 'success', text: 'Aprobado', icon: 'check-circle' },
    rejected: { color: 'danger', text: 'Rechazado', icon: 'x-circle' },
    cancelled: { color: 'secondary', text: 'Cancelado', icon: 'slash-circle' },
  }
  const c = config[status]
  return <span className={`badge bg-${c.color} bg-opacity-10 text-${c.color}`}><i className={`bi bi-${c.icon} me-1`} />{c.text}</span>
}

export const LeavesAdminPageReal: React.FC = () => {
  const [filters] = useState<FiltersType>({})
  const { leaves, isLoading, mutate } = useLeaves(filters)
  const { employees } = useEmployees()
  const { leaveTypes } = useLeaveTypes()
  const { createLeave, updateLeave, deleteLeave } = useLeavesMutations()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const [formData, setFormData] = useState<LeaveFormData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    reason: '',
    notes: '',
    employeeId: 0,
    leaveTypeId: 0,
  })

  const handleCreate = useCallback(async () => {
    try {
      await createLeave(formData)
      setShowCreateModal(false)
      mutate()
      const toast = document.createElement('div')
      toast.className = 'alert alert-success position-fixed top-0 end-0 m-3'
      toast.style.zIndex = '9999'
      toast.textContent = 'Solicitud de permiso creada exitosamente'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 4000)
    } catch {
      // Error handled silently
    }
  }, [formData, createLeave, mutate])

  const handleApprove = useCallback(async (leave: Leave) => {
    try {
      const leaveData: LeaveFormData = {
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: 'approved',
        reason: leave.reason,
        notes: leave.notes,
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        approverId: leave.approverId,
      }
      await updateLeave(leave.id, leaveData)
      mutate()
    } catch {
      // Error handled silently
    }
  }, [updateLeave, mutate])

  const handleReject = useCallback(async (leave: Leave) => {
    try {
      const leaveData: LeaveFormData = {
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: 'rejected',
        reason: leave.reason,
        notes: leave.notes,
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        approverId: leave.approverId,
      }
      await updateLeave(leave.id, leaveData)
      mutate()
    } catch {
      // Error handled silently
    }
  }, [updateLeave, mutate])

  const handleDelete = useCallback(async (leave: Leave) => {
    const confirmed = await confirmModalRef.current?.confirm(
      '¿Eliminar la solicitud de permiso?',
      {
        title: 'Confirmar Eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
      }
    )

    if (!confirmed) return

    try {
      await deleteLeave(leave.id)
      mutate()
    } catch {
      // Error handled silently
    }
  }, [deleteLeave, mutate])

  const pending = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length
  const totalDays = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.daysRequested, 0)

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2"><i className="bi bi-calendar-x me-3" />Gestión de Permisos y Vacaciones</h1>
              <p className="text-muted">Control de solicitudes de permisos y ausencias</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)} startIcon={<i className="bi bi-plus-circle" />}>
              Nueva Solicitud
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Total Solicitudes</h6>
              <h3>{leaves.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Pendientes</h6>
              <h3 className="text-warning">{pending}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Aprobados</h6>
              <h3 className="text-success">{approved}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Días Totales</h6>
              <h3>{totalDays}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : leaves.length === 0 ? (
            <div className="alert alert-info">No se encontraron solicitudes de permisos.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Empleado</th>
                    <th>Tipo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Días</th>
                    <th>Razón</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : '-'}</td>
                      <td><span className="badge bg-primary bg-opacity-10 text-primary">{leave.leaveType?.name || '-'}</span></td>
                      <td>{new Date(leave.startDate).toLocaleDateString('es-MX')}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString('es-MX')}</td>
                      <td><strong>{leave.daysRequested}</strong> días</td>
                      <td><small className="text-muted">{leave.reason}</small></td>
                      <td><LeaveStatusBadge status={leave.status} /></td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {leave.status === 'pending' && (
                            <>
                              <Button size="small" variant="success" buttonStyle="outline" onClick={() => handleApprove(leave)} title="Aprobar">
                                <i className="bi bi-check-lg" />
                              </Button>
                              <Button size="small" variant="danger" buttonStyle="outline" onClick={() => handleReject(leave)} title="Rechazar">
                                <i className="bi bi-x-lg" />
                              </Button>
                            </>
                          )}
                          <Button size="small" variant="danger" buttonStyle="outline" onClick={() => handleDelete(leave)}>
                            <i className="bi bi-trash" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Solicitud de Permiso</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Empleado *</label>
                  <select className="form-select" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: parseInt(e.target.value)})}>
                    <option value={0}>Seleccionar...</option>
                    {employees.filter(e => e.status === 'active').map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo de Permiso *</label>
                  <select className="form-select" value={formData.leaveTypeId} onChange={(e) => setFormData({...formData, leaveTypeId: parseInt(e.target.value)})}>
                    <option value={0}>Seleccionar...</option>
                    {leaveTypes.map((lt: { id: string; name: string; defaultDays: number }) => (
                      <option key={lt.id} value={lt.id}>{lt.name} ({lt.defaultDays} días)</option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Inicio *</label>
                    <input type="date" className="form-control" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Fin *</label>
                    <input type="date" className="form-control" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Razón *</label>
                  <textarea className="form-control" rows={3} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Notas</label>
                  <textarea className="form-control" rows={2} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" buttonStyle="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleCreate}>Crear Solicitud</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default LeavesAdminPageReal
